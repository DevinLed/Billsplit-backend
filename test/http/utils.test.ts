import { HttpResponses, HttpStatus } from '../../src/http/utils';
import { APIGatewayProxyResult } from 'aws-lambda';

describe('HttpResponses', () => {
  const baseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE,PUT',
  };

  test('should return OK response', () => {
    const result: APIGatewayProxyResult = HttpResponses.ok({ message: 'OK' });
    expect(result).toEqual({
      statusCode: HttpStatus.OK,
      headers: baseHeaders,
      body: '{"message":"OK"}',
    });
  });

  test('should return Created response', () => {
    const result: APIGatewayProxyResult = HttpResponses.created({ id: '123' });
    expect(result).toEqual({
      statusCode: HttpStatus.Created,
      headers: baseHeaders,
      body: '{"id":"123"}',
    });
  });

  test('should return NoContent response', () => {
    const result: APIGatewayProxyResult = HttpResponses.noContent();
    expect(result).toEqual({
      statusCode: HttpStatus.NoContent,
      headers: baseHeaders,
      body: '',
    });
  });

  test('should return Deleted response', () => {
    const result: APIGatewayProxyResult = HttpResponses.deleted();
    expect(result).toEqual({
      statusCode: HttpStatus.NoContent,
      headers: baseHeaders,
      body: '',
    });
  });

  test('should return Updated response', () => {
    const result: APIGatewayProxyResult = HttpResponses.updated({ status: 'success' });
    expect(result).toEqual({
      statusCode: HttpStatus.OK,
      headers: baseHeaders,
      body: '{"status":"success"}',
    });
  });

  test('should return BadRequest response', () => {
    const result: APIGatewayProxyResult = HttpResponses.badRequest('Bad Request');
    expect(result).toEqual({
      statusCode: HttpStatus.BadRequest,
      headers: baseHeaders,
      body: '{"error":"Bad Request"}',
    });
  });

  test('should return Unauthorized response', () => {
    const result: APIGatewayProxyResult = HttpResponses.unauthorized('Unauthorized');
    expect(result).toEqual({
      statusCode: HttpStatus.Unauthorized,
      headers: baseHeaders,
      body: '{"error":"Unauthorized"}',
    });
  });

  test('should return Forbidden response', () => {
    const result: APIGatewayProxyResult = HttpResponses.forbidden('Forbidden');
    expect(result).toEqual({
      statusCode: HttpStatus.Forbidden,
      headers: baseHeaders,
      body: '{"error":"Forbidden"}',
    });
  });

  test('should return NotFound response', () => {
    const result: APIGatewayProxyResult = HttpResponses.notFound('Not Found');
    expect(result).toEqual({
      statusCode: HttpStatus.NotFound,
      headers: baseHeaders,
      body: '{"error":"Not Found"}',
    });
  });

  test('should return InternalServerError response', () => {
    const result: APIGatewayProxyResult = HttpResponses.internalServerError('Internal Server Error');
    expect(result).toEqual({
      statusCode: HttpStatus.InternalServerError,
      headers: baseHeaders,
      body: '{"error":"Internal Server Error"}',
    });
  });
});
