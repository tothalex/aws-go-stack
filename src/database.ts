import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import { RemovalPolicy } from 'aws-cdk-lib'

export const createDatabase = (props: {
  scope: Construct
  name: string
  tableName: string
  secondaryIndex?: boolean
}) => {
  const table = new Table(props.scope, props.name, {
    partitionKey: {
      name: 'pk',
      type: AttributeType.STRING,
    },
    sortKey: {
      name: 'sk',
      type: AttributeType.STRING,
    },
    tableName: props.tableName,
    removalPolicy: RemovalPolicy.DESTROY,
  })

  if (props.secondaryIndex) {
    table.addGlobalSecondaryIndex({
      indexName: 'secondary-index',
      partitionKey: {
        name: `GSI1PK`,
        type: AttributeType.STRING,
      },
      sortKey: {
        name: `GSI1SK`,
        type: AttributeType.STRING,
      },
    })
  }

  return table
}
