import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam"; 

export class DynamoLayer extends cdk.Stack {
  readonly tableTransactions: dynamodb.Table;
  readonly tableContacts: dynamodb.Table;
  
  readonly tableContactsV2: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.tableTransactions = new dynamodb.Table(this, "TransactionsTable", {
      tableName: "Transactions",
      partitionKey: {
        name: "TransactionId",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.tableTransactions.addGlobalSecondaryIndex({
      indexName: 'PayerId-Index',
      partitionKey: {
        name: 'PayerId',
        type: dynamodb.AttributeType.STRING
      },
      projectionType: dynamodb.ProjectionType.ALL,
      
    });

    this.tableTransactions.addGlobalSecondaryIndex({
      indexName: 'DebtorId-Index',
      partitionKey: {
        name: 'DebtorId',
        type: dynamodb.AttributeType.STRING
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    this.tableTransactions.node.addMetadata("attributeDefinitions", {
      PayerId: dynamodb.AttributeType.STRING,
      DebtorId: dynamodb.AttributeType.STRING,
    });

    
    this.tableContacts = new dynamodb.Table(this, "ContactsTable", {
      tableName: "Contacts",
      partitionKey: {
        name: "ContactId",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.tableContacts.node.addMetadata("attributeDefinitions", {
      Name: dynamodb.AttributeType.STRING,
      Email: dynamodb.AttributeType.STRING,
      Phone: dynamodb.AttributeType.STRING,
      Owing: dynamodb.AttributeType.STRING,
    });

    this.tableContactsV2 = new dynamodb.Table(this, "ContactsTableV2", {
      tableName: "ContactsTableV2",
      partitionKey: {
        name: "ContactId",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "UserEmail",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    this.tableContactsV2.addGlobalSecondaryIndex({
      indexName: "UserEmail-Email-Index",
      partitionKey: {
        name: "UserEmail",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "Email",
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });
    
    const lambdaRole = new iam.Role(this, "LambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });
    
    this.tableContactsV2.grant(lambdaRole, "dynamodb:Query");
    this.tableContactsV2.node.addMetadata("attributeDefinitions", {
      
      Name: dynamodb.AttributeType.STRING,
      Email: dynamodb.AttributeType.STRING,
      Phone: dynamodb.AttributeType.STRING,
      Owing: dynamodb.AttributeType.STRING,
    });
  }
  
}
