import {
  LambdaIntegration,
  PassthroughBehavior,
} from 'aws-cdk-lib/aws-apigateway'
import { IFunction } from 'aws-cdk-lib/aws-lambda'

export const createLambdaIntegration = (props: { lambdaFn: IFunction }) => {
  return new LambdaIntegration(props.lambdaFn, {
    proxy: false,
    integrationResponses: [
      {
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers':
            "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
          'method.response.header.Access-Control-Allow-Origin': "'*'",
          'method.response.header.Access-Control-Allow-Credentials': "'false'",
          'method.response.header.Access-Control-Allow-Methods':
            "'OPTIONS,GET,PUT,POST,DELETE'",
        },
      },
    ],
    passthroughBehavior: PassthroughBehavior.NEVER,
    requestTemplates: {
      'application/json': '{"statusCode": 200}',
    },
  })
}
