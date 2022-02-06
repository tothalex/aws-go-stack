import {
  AuthorizationType,
  CfnAuthorizer,
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

export const addCorsOptions = (apiResource: IResource) => {
  apiResource.addMethod(
    'OPTIONS',
    new MockIntegration({
      integrationResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Headers':
              "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
            'method.response.header.Access-Control-Allow-Origin': "'*'",
            'method.response.header.Access-Control-Allow-Credentials':
              "'false'",
            'method.response.header.Access-Control-Allow-Methods':
              "'OPTIONS,GET,PUT,POST,DELETE'",
          },
        },
      ],
      passthroughBehavior: PassthroughBehavior.NEVER,
      requestTemplates: {
        'application/json': '{"statusCode": 200}',
      },
    }),
    {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Headers': true,
            'method.response.header.Access-Control-Allow-Methods': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
      ],
    },
  )
}
