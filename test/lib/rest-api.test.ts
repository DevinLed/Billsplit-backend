import { RestApiLayerProps, RestApi } from '../../lib/rest-api';
import { LambdaLayer } from '../../lib/lambda';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

jest.mock('aws-cdk-lib');

const mockRestApi = {
  root: {
    addResource: jest.fn().mockReturnThis(),
    addMethod: jest.fn().mockReturnThis(),
  },
};

const mockLambdaIntegration = {
  bind: jest.fn(),
};

jest.mock('aws-cdk-lib/aws-apigateway', () => ({
  RestApi: jest.fn().mockImplementation(() => mockRestApi),
  LambdaIntegration: jest.fn().mockImplementation(() => mockLambdaIntegration),
}));

describe('RestApi Tests', () => {
  const mockLambdas: LambdaLayer = {
    functionContactsGet: {
      node: { defaultChild: {} },
    } as any,
    functionContactsPost: {
      node: { defaultChild: {} },
    } as any,
    functionContactsDelete: {
      node: { defaultChild: {} },
    } as any,
    functionContactsPut: {
      node: { defaultChild: {} },
    } as any,
    functionTransactionsGet: {
      node: { defaultChild: {} },
    } as any,
    functionTransactionsPost: {
      node: { defaultChild: {} },
    } as any,
  };

  let restApi: RestApi;

  beforeEach(() => {
    const props: RestApiLayerProps = { dynamo: {} as any, lambdas: mockLambdas };
    restApi = new RestApi(new Construct(), 'RestApi', props);
  });

  test('Should create contacts resource with methods and lambda integrations', () => {
    expect(mockRestApi.root.addResource).toHaveBeenCalledWith('contacts');
    expect(mockRestApi.root.addResource().addResource).toHaveBeenCalledWith('{ContactId}');
    expect(mockRestApi.root.addResource().addResource().addResource).toHaveBeenCalledWith('{UserEmail}');

    expect(apigateway.LambdaIntegration).toHaveBeenCalledWith(mockLambdas.functionContactsGet);
    expect(apigateway.LambdaIntegration).toHaveBeenCalledWith(mockLambdas.functionContactsPost);
    expect(apigateway.LambdaIntegration).toHaveBeenCalledWith(mockLambdas.functionContactsPut);
    expect(apigateway.LambdaIntegration).toHaveBeenCalledWith(mockLambdas.functionContactsDelete);

    expect(mockRestApi.root.addResource().addMethod).toHaveBeenCalledWith('GET', expect.any(Object));
    expect(mockRestApi.root.addResource().addResource().addResource().addMethod).toHaveBeenCalledWith('DELETE', expect.any(Object));
  });

  test('Should create transaction resource with methods and lambda integrations', () => {
    expect(mockRestApi.root.addResource).toHaveBeenCalledWith('transaction');
    expect(mockRestApi.root.addResource().addResource).toHaveBeenCalledWith('{transactionId}');

    expect(apigateway.LambdaIntegration).toHaveBeenCalledWith(mockLambdas.functionTransactionsGet);
    expect(apigateway.LambdaIntegration).toHaveBeenCalledWith(mockLambdas.functionTransactionsPost);

    expect(mockRestApi.root.addResource().addMethod).toHaveBeenCalledWith('GET', expect.any(Object));
    expect(mockRestApi.root.addResource().addResource().addMethod).toHaveBeenCalledWith('POST', expect.any(Object));
  });
});
