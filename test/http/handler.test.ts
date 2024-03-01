import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Handler, handlerFactory } from '../../src/http/handler';

describe('Handler Tests', () => {
  let handler: Handler;

  beforeEach(() => {
    handler = handlerFactory();
  });

  it('should add handler and execute it successfully', async () => {
    const mockEvent: APIGatewayProxyEvent = {
      httpMethod: 'GET',
    } as APIGatewayProxyEvent;

    const mockResult: APIGatewayProxyResult = {
      statusCode: 200,
      body: 'Success',
    };

    const mockHandlerFn = jest.fn().mockResolvedValue(mockResult);

    handler.addHandler('GET', mockHandlerFn);

    const result = await handler.execute(mockEvent);

    expect(mockHandlerFn).toHaveBeenCalledWith(mockEvent);
    expect(result).toEqual(mockResult);
  });

  it('should return 404 for unsupported method', async () => {
    const mockEvent: APIGatewayProxyEvent = {
      httpMethod: 'POST',
    } as APIGatewayProxyEvent;

    const result = await handler.execute(mockEvent);

    expect(result.statusCode).toBe(404);
    expect(result.body).toBe('Method not supported');
  });

  it('should return 404 for unsupported method even with added handlers', async () => {
    const mockEvent: APIGatewayProxyEvent = {
      httpMethod: 'POST',
    } as APIGatewayProxyEvent;

    const mockHandlerFn = jest.fn();

    handler.addHandler('GET', mockHandlerFn);

    const result = await handler.execute(mockEvent);

    expect(mockHandlerFn).not.toHaveBeenCalled();
    expect(result.statusCode).toBe(404);
    expect(result.body).toBe('Method not supported');
  });

});
