import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface RestApiLayerProps {
    lambdas: cdk.aws_lambda.Function;
}

export class RestApi extends Construct {
    readonly api: cdk.aws_apigateway.RestApi;

    constructor(scope: Construct, id: string, props: RestApiLayerProps) {
        super(scope, id);

        this.api = new cdk.aws_apigateway.RestApi(this, 'RestApi', {
            defaultCorsPreflightOptions: {
                allowOrigins: ['*'],
                allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            }
        });

        this.createUsersResource(props);
    }

    createUsersResource(props: RestApiLayerProps) {
        const userResource = this.api.root.addResource('users');

        const personEmailResource = userResource.addResource('{userId}');

        function addGetMethod(resource: cdk.aws_apigateway.IResource, lambdas: cdk.aws_lambda.Function) {
            const userGetLambda = new cdk.aws_apigateway.LambdaIntegration(lambdas);
            
            resource.addMethod('GET', userGetLambda);
        }
        
        addGetMethod(userResource, props.lambdas);
        addGetMethod(personEmailResource, props.lambdas);

        const userPostLambda = new cdk.aws_apigateway.LambdaIntegration(props.lambdas);
        userResource.addMethod('POST', userPostLambda);

        const userPutLambda = new cdk.aws_apigateway.LambdaIntegration(props.lambdas);
        personEmailResource.addMethod('PUT', userPutLambda);

        const userDeleteLambda = new cdk.aws_apigateway.LambdaIntegration(props.lambdas);
        personEmailResource.addMethod('DELETE', userDeleteLambda);
        
    }
}
