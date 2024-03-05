import { expect as expectCDK, haveResource, countResources } from '@aws-cdk/assert';
import * as cdk from 'aws-cdk-lib';
import { DynamoLayer } from '../../lib/dynamo';

describe('DynamoLayer', () => {
  const app = new cdk.App();
  const stack = new DynamoLayer(app, 'DynamoLayerStack');

  it('creates the correct number of DynamoDB tables', () => {
    expectCDK(stack).to(countResources('AWS::DynamoDB::Table', 3));
  });

  it('creates a Transactions table with correct properties', () => {
    expectCDK(stack).to(haveResource('AWS::DynamoDB::Table', {
      TableName: 'Transactions',
      BillingMode: 'PAY_PER_REQUEST',
      KeySchema: [
        {AttributeName: 'TransactionId', KeyType: 'HASH'}
      ],
      GlobalSecondaryIndexes: [
        {IndexName: 'PayerId-Index', KeySchema: [{AttributeName: 'PayerId', KeyType: 'HASH'}], Projection: {ProjectionType: 'ALL'}},
        {IndexName: 'DebtorId-Index', KeySchema: [{AttributeName: 'DebtorId', KeyType: 'HASH'}], Projection: {ProjectionType: 'ALL'}},
      ]
    }));
  });

  it('creates a Contacts table with correct properties', () => {
    expectCDK(stack).to(haveResource('AWS::DynamoDB::Table', {
      TableName: 'Contacts',
      BillingMode: 'PAY_PER_REQUEST',
      KeySchema: [
        {AttributeName: 'ContactId', KeyType: 'HASH'}
      ],
    }));
  });

  it('creates a ContactsTableV2 with correct properties and indexes', () => {
    expectCDK(stack).to(haveResource('AWS::DynamoDB::Table', {
      TableName: 'ContactsTableV2',
      BillingMode: 'PAY_PER_REQUEST',
      KeySchema: [
        {AttributeName: 'ContactId', KeyType: 'HASH'},
        {AttributeName: 'UserEmail', KeyType: 'RANGE'}
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'UserEmail-Email-Index',
          KeySchema: [
            {AttributeName: 'UserEmail', KeyType: 'HASH'},
            {AttributeName: 'Email', KeyType: 'RANGE'}
          ],
          Projection: {ProjectionType: 'ALL'}
        }
      ]
    }));
  });

  it('creates an IAM Role for Lambda with correct permissions', () => {
    expectCDK(stack).to(haveResource('AWS::IAM::Role', {
      AssumeRolePolicyDocument: {
        Statement: [{
          Effect: 'Allow',
          Principal: {Service: 'lambda.amazonaws.com'},
          Action: 'sts:AssumeRole'
        }],
        Version: '2012-10-17'
      },
      Policies: [{
        PolicyName: 'inlinepolicy',
        PolicyDocument: {
          Statement: [{
            Effect: 'Allow',
            Action: 'dynamodb:Query',
            Resource: [{
              'Fn::GetAtt': [
                'ContactsTableV2',
                'Arn'
              ]
            }]
          }],
          Version: '2012-10-17'
        }
      }]
    }));
  });
});
