import { handler as deleteContactHandler } from '../../src/lambdas/contactDeleteLambda';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('deleteContactHandler Tests', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  const createEvent = (overrides = {}): APIGatewayProxyEvent => ({
    httpMethod: 'DELETE',
    path: '',
    headers: {},
    multiValueHeaders: {},
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    pathParameters: {
      ContactId: 'c1234567-89ab-cdef-1234-56789abcdef0',
      UserEmail: 'user@example.com',
    },
    stageVariables: null,
    requestContext: {} as any, 
    resource: '', 
    body: null,
    isBase64Encoded: false,
    ...overrides,
  });

  test('Should delete contact successfully', async () => {
    const event = createEvent();
    const context = {}; 
    ddbMock.on(DeleteCommand).resolvesOnce({});

    const result = await deleteContactHandler(event as unknown as APIGatewayProxyEvent, context as any);
    expect(result.statusCode).toEqual(204);
  });

  test('Should return error for missing ContactId', async () => {
    const event = createEvent({
      pathParameters: { ContactId: '', UserEmail: 'user@example.com' }, 
    });
    const context = {};

    const result = await deleteContactHandler(event as unknown as APIGatewayProxyEvent, context as any);
    expect(result.statusCode).toEqual(400);
    expect(JSON.parse(result.body).error).toEqual('Invalid request. ContactId is missing.');
  });

  test('Should handle DynamoDB error gracefully', async () => {
    const event = createEvent();
    const context = {};
    ddbMock.on(DeleteCommand).rejectsOnce(new Error('Internal Server Error'));

    const result = await deleteContactHandler(event as unknown as APIGatewayProxyEvent, context as any);
    expect(result.statusCode).toEqual(500);
    expect(JSON.parse(result.body).error).toEqual('Failed to delete item.');
  });
});
