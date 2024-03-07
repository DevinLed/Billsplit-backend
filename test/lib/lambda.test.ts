import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from 'aws-cdk-lib';
import { DynamoLayer } from '../../lib/dynamo';
import { LambdaLayer } from '../../lib/lambda';

describe('LambdaLayer', () => {
  const app = new cdk.App();
  const dynamoStack = new DynamoLayer(app, 'DynamoLayerStack');
  const stack = new LambdaLayer(app, 'LambdaLayerStack', { dynamo: dynamoStack });

  it('creates the correct Lambda functions', () => {
    expectCDK(stack).to(haveResource('AWS::Lambda::Function', {
      Handler: 'dist/contactGetLambda.handler',
      Runtime: 'nodejs14.x',
      Environment: {
        NOTIFICATIONAPI_CLIENT_ID: process.env.NOTIFICATIONAPI_CLIENT_ID,
        NOTIFICATIONAPI_CLIENT_SECRET: process.env.NOTIFICATIONAPI_CLIENT_SECRET,
      },
    }));

  });

  it('grants the correct DynamoDB permissions', () => {
    expectCDK(stack).to(haveResource('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: 'dynamodb:Query',
            Effect: 'Allow',
            Resource: { 'Fn::GetAtt': ['ContactsTableV2', 'Arn'] },
          },
        ],
      },
    }));
  });
});