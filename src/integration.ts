import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway'
import { IFunction } from 'aws-cdk-lib/aws-lambda'

export const createLambdaIntegration = (props: { lambdaFn: IFunction }) => {
  return new LambdaIntegration(props.lambdaFn)
}
