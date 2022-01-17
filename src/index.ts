import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'

import { createLambdaFunction } from './function'
import { createDatabase } from './database'
import { createAPI } from './api'

type HandlerProps = {
  lambda: {
    name: string
    entry: string
  }
  api: {
    name: string
    resource: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  }
}

type AppProps = {
  handler: HandlerProps | Array<HandlerProps>
  database: {
    name: string
    tableName: string
  }
}

const createHandler = (scope: Construct, props: HandlerProps) => {
  const { lambda, api } = props

  const lambdaFn = createLambdaFunction({
    scope,
    name: lambda.name,
    entry: lambda.entry,
  })

  const apiGateway = createAPI({
    scope,
    lambdaFn,
    name: api.name,
    resource: api.resource,
    method: api.method,
  })

  return { lambdaFn, apiGateway }
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
      scope,
      name: database.name,
      tableName: database.tableName,
    })

    if ('lambda' in appProps.handler) {
      const handler = createHandler(scope, appProps.handler)
      dynamoDB.grantReadWriteData(handler.lambdaFn)
      return
    }

    appProps.handler.forEach((props) => {
      const handler = createHandler(scope, props)
      dynamoDB.grantReadWriteData(handler.lambdaFn)
    })
  }
}
