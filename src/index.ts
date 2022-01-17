import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'

import { createLambdaFunction } from './function'
import { createDatabase } from './database'
import { createAPI } from './api'

type AppProps = {
  lambda: {
    name: string
    entry: string
  }
  api: {
    name: string
    resource: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  }
  database: {
    name: string
    tableName: string
  }
}

export default class GoLambdaStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    appProps: AppProps,
    stackProps?: StackProps,
  ) {
    super(scope, id, stackProps)

    const { lambda } = appProps

    const lambdaFn = createLambdaFunction({
      scope,
      name: lambda.name,
      entry: lambda.entry,
    })

    const { database } = appProps

    const dynamoDB = createDatabase({
      scope,
      name: database.name,
      tableName: database.tableName,
    })
    dynamoDB.grantReadWriteData(lambdaFn)

    const { api } = appProps

    createAPI({
      scope,
      lambdaFn,
      name: api.name,
      resource: api.resource,
      method: api.method,
    })
  }
}
