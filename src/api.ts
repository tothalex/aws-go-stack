import { RestApi } from 'aws-cdk-lib/aws-apigateway'
import { Construct } from 'constructs'

export const createAPI = (props: { scope: Construct; name: string }) => {
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

  return api
}
