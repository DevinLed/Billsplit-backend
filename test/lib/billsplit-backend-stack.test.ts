import { expect as expectCDK, haveResource, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from 'aws-cdk-lib';
import { BillsplitBackendStack } from '../../lib/billsplit-backend-stack';
import { SynthUtils } from '@aws-cdk/assert';

describe('BillsplitBackendStack', () => {
    const app = new cdk.App();
    const stack = new BillsplitBackendStack(app, 'MyTestStack');

    it('creates a DynamoDB table', () => {
        expectCDK(stack).to(haveResource('AWS::DynamoDB::Table', {
            BillingMode: 'PAY_PER_REQUEST',
        }));
    });

    it('creates a Lambda function', () => {
        expectCDK(stack).to(haveResource('AWS::Lambda::Function', {
            Handler: 'index.handler',
            Runtime: 'nodejs14.x',
        }));
    });

    it('creates an API Gateway', () => {
        expectCDK(stack).to(haveResource('AWS::ApiGateway::RestApi', {
            Name: 'RestApi',
        }));
    });

    it('matches the snapshot', () => {
        expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
    });
});
