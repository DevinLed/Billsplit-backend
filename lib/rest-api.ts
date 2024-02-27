import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { LambdaLayer } from "./lambda";

interface RestApiLayerProps {
  lambdas: LambdaLayer;
}

export class RestApi extends Construct {
  readonly api: cdk.aws_apigateway.RestApi;

  constructor(scope: Construct, id: string, props: RestApiLayerProps) {
    super(scope, id);

    this.api = new cdk.aws_apigateway.RestApi(this, "RestApi", {
      defaultCorsPreflightOptions: {
        allowOrigins: ["*"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
    });

    this.createContactsResource(props);
  }

  createContactsResource(props: RestApiLayerProps) {
    const {
      functionContactsGet,
      functionContactsPost,
      functionContactsDelete,
      functionContactsPut,
      functionTransactionsGet,
      functionTransactionsPost,
    } = props.lambdas;

    /**
     * Resources
     */
    const contactResource = this.api.root.addResource("contacts");
    const contactIdResource = contactResource.addResource("{ContactId}");
    const contactUserEmailResource =
      contactIdResource.addResource("{UserEmail}");

    const transactionResource = this.api.root.addResource("transaction");
    const transactionIdResource =
      transactionResource.addResource("{transactionId}");

    /**
     * Lambda Integrations
     */
    const contactsGetLambda = new cdk.aws_apigateway.LambdaIntegration(
      functionContactsGet
    );
    const contactsPostLambda = new cdk.aws_apigateway.LambdaIntegration(
      functionContactsPost
    );
    const contactsPutLambda = new cdk.aws_apigateway.LambdaIntegration(
      functionContactsPut
    );
    const contactsDeleteLambda = new cdk.aws_apigateway.LambdaIntegration(
      functionContactsDelete
    );

    const transactionsGetLambda = new cdk.aws_apigateway.LambdaIntegration(
      functionTransactionsGet
    );
    const transactionsPostLambda = new cdk.aws_apigateway.LambdaIntegration(
      functionTransactionsPost
    );

    /**
     * Resource Method Integrations
     */
    contactResource.addMethod("GET", contactsGetLambda);
    contactIdResource.addMethod("GET", contactsGetLambda);
    contactResource.addMethod("POST", contactsPostLambda);
    contactIdResource.addMethod("POST", contactsPostLambda);
    contactResource.addMethod("PUT", contactsPutLambda);
    contactIdResource.addMethod("PUT", contactsPutLambda);
    contactIdResource.addMethod("DELETE", contactsDeleteLambda);
    contactUserEmailResource.addMethod("DELETE", contactsDeleteLambda);
    transactionResource.addMethod("GET", transactionsGetLambda);
    transactionResource.addMethod("POST", transactionsPostLambda);
    transactionIdResource.addMethod("GET", transactionsGetLambda);
    transactionIdResource.addMethod("POST", transactionsPostLambda);
  }
}
