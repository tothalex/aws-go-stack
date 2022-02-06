import {
  LambdaIntegration,
  PassthroughBehavior,
} from 'aws-cdk-lib/aws-apigateway'
import { IFunction } from 'aws-cdk-lib/aws-lambda'

export const createLambdaIntegration = (props: { lambdaFn: IFunction }) => {
  const integration = new LambdaIntegration(props.lambdaFn, {
    integrationResponses: [
      {
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': "'*'",
        },
        statusCode: '200',
      },
    ],
    passthroughBehavior: PassthroughBehavior.NEVER,
    proxy: false,
  })

  return integration
}
