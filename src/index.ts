import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway'

import { createLambdaFunction } from './function'
import { createDatabase } from './database'
import { createAPI } from './api'

type HandlerProps = {
  lambda: {
    name: string
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

    const apiGateway = createAPI({
      scope: this,
      name: api.name,
    })

    appProps.handlers.forEach((props) => {
      const { lambda, api } = props
      const lambdaFn = createLambdaFunction({
        scope: this,
        name: lambda.name,
        entry: lambda.entry,
      })

      let resource = apiGateway.root.getResource(api.resource)
      if (!resource) {
        resource = apiGateway.root.addResource(api.resource)
      }

      resource.addMethod(
        api.method,
        new LambdaIntegration(lambdaFn, { proxy: true }),
      )
      dynamoDB.grantReadWriteData(lambdaFn)
    })
  }
}
