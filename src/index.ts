import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import {
  AuthorizationType,
  JsonSchemaType,
  LambdaIntegration,
  Model,
  RequestValidator,
} from 'aws-cdk-lib/aws-apigateway'
import { existsSync } from 'fs'

import { createLambdaFunction, getLambdaFunctionName } from './function'
import { createDatabase } from './database'
import { createAPI } from './api'
import { AppProps } from './types'

export { JsonSchemaType }

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
      secondaryIndex: database.secondaryIndex,
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

      dynamoDB.grantReadWriteData(lambdaFn)

      let resource = apiGateway.root.getResource(api.resource)
      if (!resource) {
        resource = apiGateway.root.addResource(api.resource)
      }

      const methodOptions: Record<string, unknown> = {}

      if (apiAuthorizer) {
        methodOptions.authorizer = {
          authorizerId: apiAuthorizer.ref,
        }
        methodOptions.authorizationType = AuthorizationType.COGNITO
      }

      if (api.schema) {
        const requestValidator = new RequestValidator(
          this,
          `${api.resource}-validator`,
          {
            restApi: apiGateway,
            validateRequestBody: true,
          },
        )
        const model = new Model(this, `${api.resource}-model`, {
          restApi: apiGateway,
          schema: api.schema,
        })

        methodOptions.requestValidator = requestValidator
        methodOptions.requestModels = {
          'application/json': model,
        }
      }

      resource.addMethod(
        api.method,
        new LambdaIntegration(lambdaFn, { proxy: true }),
        methodOptions,
      )
    })
  }
}
