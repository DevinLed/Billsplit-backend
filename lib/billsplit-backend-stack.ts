import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { DynamoLayer } from "./dynamo";
import { LambdaLayer } from "./lambda";
import { RestApi } from "./rest-api";

export class BillsplitBackendStack extends cdk.Stack {
  readonly dynamoLayer: DynamoLayer;
  readonly lambdaLayer: LambdaLayer;
  readonly restApiLayer: RestApi;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.dynamoLayer = new DynamoLayer(this, "DynamoLayer");
    this.lambdaLayer = new LambdaLayer(this, "LambdaLayer", {
      dynamo: this.dynamoLayer,
    });
    this.restApiLayer = new RestApi(this, "RestApi", {
      lambdas: this.lambdaLayer,
    });
  }
}
