import {
  AuthorizationType,
  CfnAuthorizer,
  Cors,
  IResource,
  MockIntegration,
  PassthroughBehavior,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway'
import { UserPool } from 'aws-cdk-lib/aws-cognito'
import { Construct } from 'constructs'

export const createAPI = (props: {
  scope: Construct
  name: string
  authorizer?: boolean
}) => {
  const apiGateway = new RestApi(props.scope, `${props.name}-api`, {
    deployOptions: {
      stageName: 'prod',
    },
    defaultCorsPreflightOptions: {
      allowOrigins: Cors.ALL_ORIGINS,
    },
  })

  if (!props.authorizer) {
    return { apiGateway }
  }

  const userPool = new UserPool(props.scope, 'users', {
    signInAliases: {
      email: true,
    },
  })

  userPool.addClient('client', {
    authFlows: {
      userPassword: true,
      userSrp: true,
    },
  })

  const apiAuthorizer = new CfnAuthorizer(
    props.scope,
    `${props.name}-authorizer`,
    {
      restApiId: apiGateway.restApiId,
      name: `${props.name}Authorizer`,
      type: AuthorizationType.COGNITO,
      identitySource: 'method.request.header.Authorization',
      providerArns: [userPool.userPoolArn],
    },
  )

  return { apiGateway, apiAuthorizer }
}
