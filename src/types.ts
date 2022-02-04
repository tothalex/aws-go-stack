import { JsonSchema } from 'aws-cdk-lib/aws-apigateway'

type HandlerProps = {
  lambda: {
    name?: string
    entry: string
  }
  api: {
    resource: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    schema?: JsonSchema
  }
}

export type AppProps = {
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
