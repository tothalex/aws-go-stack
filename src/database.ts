import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import { RemovalPolicy } from 'aws-cdk-lib'

const times = (n: number, f: (index?: number) => void) => {
  while (n-- > 0) f(n)
}

export const createDatabase = (props: {
  scope: Construct
  name: string
  tableName: string
  secondaryIndex: number
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

  times(props.secondaryIndex, (index) => {
    table.addGlobalSecondaryIndex({
      indexName: `index-${index}`,
      partitionKey: {
        name: `GSI${index}PK`,
        type: AttributeType.STRING,
      },
      sortKey: {
        name: `GSI${index}SK`,
        type: AttributeType.STRING,
      },
    })
  })

  return table
}
