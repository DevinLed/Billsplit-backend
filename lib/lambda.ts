import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { DynamoLayer } from "./dynamo";
import * as dotenv from 'dotenv';
dotenv.config()

interface LambdaLayerProps {
  dynamo: DynamoLayer;
}

export class LambdaLayer extends Construct {
  readonly functionContactsGet: lambda.Function;
  readonly functionContactsPost: lambda.Function;
  readonly functionContactsPut: lambda.Function;
  readonly functionContactsDelete: lambda.Function;
  readonly functionTransactionsGet: lambda.Function;
  readonly functionTransactionsPost: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaLayerProps) {
    super(scope, id);

    const clientId = process.env.NOTIFICATIONAPI_CLIENT_ID!
    const clientSecret = process.env.NOTIFICATIONAPI_CLIENT_SECRET!

    if (!clientId) {
      throw new Error('Missing NOTIFICATIONAPI_CLIENT_ID')
    } 
    if (!clientSecret) {
      throw new Error('Missing NOTIFICATIONAPI_CLIENT_ID')
    }

    const { tableContacts, tableTransactions, tableContactsV2 } = props.dynamo;

    /**
     * Functions
     */
    this.functionContactsGet = new lambda.Function(this, "ContactsGet", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "dist/contactGetLambda.handler",
      code: lambda.Code.fromAsset("./deployment.zip"),
    });

    this.functionContactsPost = new lambda.Function(this, "ContactsPost", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "dist/contactPostLambda.handler",
      code: lambda.Code.fromAsset("./deployment.zip"),
    });

    this.functionContactsPut = new lambda.Function(this, "ContactsPut", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "dist/contactPutLambda.handler",
      code: lambda.Code.fromAsset("./deployment.zip"),
      environment: {
        NOTIFICATIONAPI_CLIENT_ID: process.env.NOTIFICATIONAPI_CLIENT_ID!, 
        NOTIFICATIONAPI_CLIENT_SECRET: process.env.NOTIFICATIONAPI_CLIENT_SECRET!
      }
    });

    this.functionContactsDelete = new lambda.Function(this, "ContactsDelete", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "dist/contactDeleteLambda.handler",
      code: lambda.Code.fromAsset("./deployment.zip"),
    });

    this.functionTransactionsGet = new lambda.Function(
      this,
      "TransactionsGet",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "dist/transactionGetLambda.handler",
        code: lambda.Code.fromAsset("./deployment.zip"),
      }
    );

    this.functionTransactionsPost = new lambda.Function(
      this,
      "TransactionsPost",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "dist/transactionPostLambda.handler",
        code: lambda.Code.fromAsset("./deployment.zip"),
        environment: {
          NOTIFICATIONAPI_CLIENT_ID: process.env.NOTIFICATIONAPI_CLIENT_ID!, 
          NOTIFICATIONAPI_CLIENT_SECRET: process.env.NOTIFICATIONAPI_CLIENT_SECRET!,
        }
      }
    );

    /**
     * Dynamo permissions
     */
    tableContacts.grantReadWriteData(this.functionContactsGet);
    tableContacts.grantReadWriteData(this.functionContactsPost);
    tableContacts.grantReadWriteData(this.functionContactsDelete);
    tableContacts.grantReadWriteData(this.functionContactsPut);
    tableContacts.grantReadWriteData(this.functionTransactionsPost);
    tableTransactions.grantReadWriteData(this.functionTransactionsGet);
    tableTransactions.grantReadWriteData(this.functionTransactionsPost);
    tableContactsV2.grantReadWriteData(this.functionContactsGet);
    tableContactsV2.grantReadWriteData(this.functionContactsPost);
    tableContactsV2.grantReadWriteData(this.functionContactsDelete);
    tableContactsV2.grantReadWriteData(this.functionContactsPut);
    tableContactsV2.grantReadWriteData(this.functionTransactionsPost);
    tableTransactions.grantReadWriteData(this.functionTransactionsGet);
    tableTransactions.grantReadWriteData(this.functionTransactionsPost);
    tableContactsV2.grantReadWriteData(this.functionTransactionsGet);
    tableContactsV2.grantReadWriteData(this.functionTransactionsPost);
  }
}
