// http/handler.ts

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export class Handler {
  private listeners: { [method: string]: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult> };

  constructor() {
    this.listeners = {};
  }

  addHandler(method: string, fn: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>): Handler {
    this.listeners[method] = fn;
    return this;
  }

  async execute(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    let response;

    const method = event.httpMethod;
    if (this.listeners[method]) {
      response = await this.listeners[method](event);
    } else {
      response = {
        statusCode: 404,
        body: "Method not supported",
      };
    }

    // Log final response
    console.log("Final Response:", response);

    return response;
  }
}

export const handlerFactory = (): Handler => new Handler();