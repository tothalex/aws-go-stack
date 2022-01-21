import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import {
  AuthorizationType,
  LambdaIntegration,
} from 'aws-cdk-lib/aws-apigateway'
import { existsSync } from 'fs'

import { createLambdaFunction, getLambdaFunctionName } from './function'
import { createDatabase } from './database'
import { createAPI } from './api'

type HandlerProps = {
  lambda: {
    name?: string
    entry: string
  }
  api: {
    resource: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  }
}

type AppProps = {
  handlers: Array<HandlerProps>
  api: {
    name: string
    authorizer?: boolean
  }
  database: {
    name: string
    tableName: string
  }
}

export default class AwsGoStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    appProps: AppProps,
    stackProps?: StackProps,
  ) {
    super(scope, id, stackProps)

    const { database } = appProps

    const dynamoDB = createDatabase({
      scope: this,
      name: database.name,
      tableName: database.tableName,
    })

    const { api } = appProps

    const { apiGateway, apiAuthorizer } = createAPI({
      scope: this,
      name: api.name,
      authorizer: api.authorizer,
    })

    appProps.handlers.forEach((props) => {
      const { lambda, api } = props

      if (!existsSync(lambda.entry)) {
        throw new Error(`lambda entry doesn't exists: ${lambda.entry}❗️`)
      }

      const name = lambda.name || getLambdaFunctionName(lambda.entry)

      const lambdaFn = createLambdaFunction({
        scope: this,
        name,
        entry: lambda.entry,
      })

      let resource = apiGateway.root.getResource(api.resource)
      if (!resource) {
        resource = apiGateway.root.addResource(api.resource)
      }

      resource.addMethod(
        api.method,
        new LambdaIntegration(lambdaFn, { proxy: true }),
        apiAuthorizer
          ? {
              authorizationType: AuthorizationType.COGNITO,
              authorizer: {
                authorizerId: apiAuthorizer.ref,
              },
            }
          : {},
      )
      dynamoDB.grantReadWriteData(lambdaFn)
    })
  }
}
