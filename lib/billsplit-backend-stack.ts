import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { DynamoLayer } from './dynamo';
import { RestApi } from './rest-api';

export class BillsplitBackendStack extends cdk.Stack {
  readonly dynamoLayer: DynamoLayer;
  readonly lambdaFunction: lambda.Function;
  readonly restApiLayer: RestApi;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.dynamoLayer = new DynamoLayer(this, 'DynamoLayer');

    this.lambdaFunction = new lambda.Function(this, 'MyLambdaFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'dist/lambdas/transactionPostLambda.handler',
      code: lambda.Code.fromAsset('./deployment.zip'), 
      environment: {
        DYNAMO_TABLE_NAME: this.dynamoLayer.tableTransactions.tableName,
      },
    });

    this.dynamoLayer.tableTransactions.grantReadWriteData(this.lambdaFunction);

    this.restApiLayer = new RestApi(this, 'RestApi', {
      lambdas: this.lambdaFunction
    })
  }
}
