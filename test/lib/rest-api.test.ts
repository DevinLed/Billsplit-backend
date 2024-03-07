import { App } from "aws-cdk-lib";
import { RestApi } from "../../lib/rest-api";
import { LambdaLayer } from "../../lib/lambda";
import { DynamoLayer } from "../../lib/dynamo";
import { Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";

describe('RestApi', () => {
  it('should create an API Gateway with the expected resources and methods', () => {
    const app = new App();
    const stack = new Stack(app, "TestStack");
    const dynamoLayer = new DynamoLayer(stack, "TestDynamoLayer");

    const lambdaLayer = new LambdaLayer(stack, "TestLambdaLayer", {
      dynamo: dynamoLayer,
    });

    new RestApi(stack, "TestApi", {
      lambdas: lambdaLayer,
    });

    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
    template.resourceCountIs('AWS::ApiGateway::Resource', 6);
    template.resourceCountIs('AWS::ApiGateway::Method', 12);
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'GET',
    });
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'POST',
    });
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'PUT',
    });
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'DELETE',
    });
  });
});
