import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LambdaLayer } from './lambda';

interface RestApiLayerProps {
    lambdas: LambdaLayer;
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

        this.createContactsResource(props);
    }

    createContactsResource(props: RestApiLayerProps) {
        const { functionContactsGet, functionContactsPost } = props.lambdas;

        /**
         * Resources
         */
        const contactResource = this.api.root.addResource('contacts');
        const contactIdResource = contactResource.addResource('{ContactId}');

        /**
         * Lambda Integrations
         */
        const contactsGetLambda = new cdk.aws_apigateway.LambdaIntegration(functionContactsGet);
        const contactsPostLambda = new cdk.aws_apigateway.LambdaIntegration(functionContactsPost);

        /**
         * Resource Method Integrations
         */
        contactResource.addMethod('GET', contactsGetLambda);
        contactIdResource.addMethod('GET', contactsGetLambda);
        contactResource.addMethod('POST', contactsPostLambda);
    }
}
