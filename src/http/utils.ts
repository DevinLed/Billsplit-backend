import { APIGatewayProxyResult } from "aws-lambda";

enum HttpStatus {
  OK = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500,
}

class HttpResponses {
  private static baseHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE,PUT",
  };

  static response(statusCode: HttpStatus, headers: any, data?: any): APIGatewayProxyResult {
    return {
      statusCode: HttpStatus.OK,
      headers: {...this.baseHeaders, ...headers},
      body: data ? JSON.stringify(data) : '',
    };
  }

  static ok(data?: any, headers?: any): APIGatewayProxyResult {
    return this.response(HttpStatus.OK, headers, data)
  }

  static created(data: any): APIGatewayProxyResult {
    return {
      statusCode: HttpStatus.Created,
      headers: this.baseHeaders,
      body: JSON.stringify(data),
    };
  }

  static noContent(): APIGatewayProxyResult {
    return {
      statusCode: HttpStatus.NoContent,
      headers: this.baseHeaders,
      body: "",
    };
  }

  static deleted(): APIGatewayProxyResult {
    return {
      statusCode: HttpStatus.NoContent,
      headers: this.baseHeaders,
      body: "",
    };
  }

  static updated(data: any): APIGatewayProxyResult {
    return {
      statusCode: HttpStatus.OK,
      headers: this.baseHeaders,
      body: JSON.stringify(data),
    };
  }

  static badRequest(message: string): APIGatewayProxyResult {
    return {
      statusCode: HttpStatus.BadRequest,
      headers: this.baseHeaders,
      body: JSON.stringify({ error: message }),
    };
  }

  static unauthorized(message: string): APIGatewayProxyResult {
    return {
      statusCode: HttpStatus.Unauthorized,
      headers: this.baseHeaders,
      body: JSON.stringify({ error: message }),
    };
  }

  static forbidden(message: string): APIGatewayProxyResult {
    return {
      statusCode: HttpStatus.Forbidden,
      headers: this.baseHeaders,
      body: JSON.stringify({ error: message }),
    };
  }

  static notFound(message: string): APIGatewayProxyResult {
    return {
      statusCode: HttpStatus.NotFound,
      headers: this.baseHeaders,
      body: JSON.stringify({ error: message }),
    };
  }

  static internalServerError(message: string): APIGatewayProxyResult {
    return {
      statusCode: HttpStatus.InternalServerError,
      headers: this.baseHeaders,
      body: JSON.stringify({ error: message }),
    };
  }
}

export { HttpResponses, HttpStatus };
