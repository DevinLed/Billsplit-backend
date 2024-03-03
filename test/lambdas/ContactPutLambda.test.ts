import { putContactHandler } from '../../src/lambdas/contactPutLambda';
import { APIGatewayProxyEvent } from 'aws-lambda';
import * as coreModule from '../../src/core';
import * as databaseModule from '../../src/database/contacts';
import * as httpUtilsModule from '../../src/http/utils';


jest.mock('../../src/core', () => ({
  updateContact: jest.fn(),
  SendUserUpdate: jest.fn(),
}));

jest.mock('../../src/database/contacts', () => ({
  getExistingContactByEmail: jest.fn(),
}));

jest.mock('../../src/http/utils', () => ({
  HttpResponses: {
    badRequest: jest.fn(),
    internalServerError: jest.fn(),
    ok: jest.fn(),
  },
}));

describe('putContactHandler Tests', () => {
  const createEvent = (overrides = {}): APIGatewayProxyEvent => ({
    httpMethod: 'PUT',
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle invalid request without body', async () => {
    const event = createEvent({ body: null });
    await putContactHandler(event);
    expect(httpUtilsModule.HttpResponses.badRequest).toHaveBeenCalledWith("Invalid request. Body is missing.");
  });

  test('should handle error updating item', async () => {
    (coreModule.updateContact as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Simulated update error");
    });

    const event = createEvent({ body: '{}' });
    await putContactHandler(event);

    expect(httpUtilsModule.HttpResponses.internalServerError).toHaveBeenCalledWith("Failed to update item.");
  });

  test('should handle valid request', async () => {
    (coreModule.updateContact as jest.Mock).mockResolvedValueOnce({});
    (databaseModule.getExistingContactByEmail as jest.Mock).mockResolvedValueOnce({});

    const event = createEvent({ body: '{}' });
    await putContactHandler(event);

    expect(httpUtilsModule.HttpResponses.ok).toHaveBeenCalledWith(expect.objectContaining({
      UserA: expect.any(Object),
      UserB: expect.any(String),
      contactAlreadyExists: expect.any(Boolean),
    }));
  });
});
