import { handler as getContactHandler } from '../../src/lambdas/contactGetLambda';
import { APIGatewayProxyEvent } from 'aws-lambda';
import * as contactsCore from '../../src/core/contacts';

jest.mock('../../src/core/contacts', () => ({
  listContacts: jest.fn(),
}));

describe('getContactHandler Tests', () => {
  const createEvent = (overrides = {}): APIGatewayProxyEvent => ({
    httpMethod: 'GET',
    path: '/contacts',
    headers: {},
    multiValueHeaders: {},
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    pathParameters: {},
    stageVariables: null,
    requestContext: {} as any,
    resource: '/contacts',
    body: null,
    isBase64Encoded: false,
    ...overrides,
  });

  test('Should return contacts successfully', async () => {
    const mockContacts = [{ id: '1', name: 'Test Contact' }];
    (contactsCore.listContacts as jest.Mock).mockResolvedValueOnce(mockContacts);

    const event = createEvent();
    const context = {};

    const result = await getContactHandler(event, context as any);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(JSON.stringify(mockContacts));
    expect(contactsCore.listContacts).toHaveBeenCalled();
  });

  test('Should handle error when fetching contacts fails', async () => {
    (contactsCore.listContacts as jest.Mock).mockRejectedValueOnce(new Error('Internal Error'));

    const event = createEvent();
    const context = {};

    const result = await getContactHandler(event, context as any);
    expect(result.statusCode).toEqual(500);
    expect(JSON.parse(result.body).error).toEqual('Failed to fetch contacts.');
    expect(contactsCore.listContacts).toHaveBeenCalled();
  });
});
