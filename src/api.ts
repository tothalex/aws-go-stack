import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { Construct } from 'constructs'
import { IFunction } from 'aws-cdk-lib/aws-lambda'

export const createAPI = (props: {
  scope: Construct
  name: string
  resource: string
  method: string
  lambdaFn: IFunction
}) => {
  const api = new RestApi(props.scope, props.name, {
    deployOptions: {
      stageName: 'prod',
    },
    defaultCorsPreflightOptions: {
      allowHeaders: [
        'Content-Type',
        'X-Amz-Date',
        'Authorization',
        'X-Api-Key',
      ],
      allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowCredentials: true,
      allowOrigins: ['*'],
    },
  })

  const resource = api.root.addResource(props.resource)
  resource.addMethod(
    props.method,
    new LambdaIntegration(props.lambdaFn, { proxy: true }),
  )

  return api
}
