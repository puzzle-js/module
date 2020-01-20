import {Adaptor, Procedure, ProcedureCallback, ProcedureResponse,} from '../types';
import fastify from 'fastify';
import {DEVELOPMENT_PORT} from '../enums';

const HTTP_SCHEMA = {
  response: {
    200: {
      type: 'object',
      properties: {
        fragment: {
          type: 'object',
          properties: {
            html: {
              type: 'object',
              patternProperties: {
                '.*': {
                  type: 'string',
                },
              },
            },
            data: {
              type: 'object',
            },
            meta: {
              type: 'object',
              properties: {
                headers: {
                  type: 'object',
                  patternProperties: {
                    '.*': {
                      type: 'string',
                    },
                  },
                },
                statusCode: {
                  type: 'number',
                }
              }
            },
          }
        },
        api: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
            },
            meta: {
              type: 'object',
              properties: {
                headers: {
                  type: 'object',
                  patternProperties: {
                    '.*': {
                      type: 'string',
                    },
                  },
                },
                statusCode: {
                  type: 'number',
                }
              }
            }
          }
        },
        __upgrade__version: {
          type: 'object',
          patternProperties: {
            '.*': {
              type: 'string',
            },
          },
        }
      },
    },
  },
  body: {
    version: {
      type: 'string',
    },
    action: {
      type: 'string',
    },
    params: {
      type: 'object',
    },
    command: {
      type: 'string',
    },
  },
};

class HttpAdaptor implements Adaptor {
  server = fastify();
  port: number;
  private procedureCallback!: ProcedureCallback;

  constructor() {
    this.port = process.env.PORT ? +process.env.PORT : DEVELOPMENT_PORT;

    this.registerPlugins();
    this.registerRoute();
  }

  private registerPlugins() {
    this.server.register(require('fastify-compress'));
  }

  // tslint:disable-next-line:no-any
  httpToProcedure(request: fastify.FastifyRequest<any>): Procedure {
    return {
      action: request.body.action,
      version: request.body.version,
      params: request.body.params,
      command: request.body.command,
    };
  }

  async init(procedureCallback: ProcedureCallback) {
    this.procedureCallback = procedureCallback;
  }

  async start() {
    await this.server.listen(this.port);
  }

  private registerRoute() {
    this.server.route({
      method: 'POST',
      url: '/',
      schema: HTTP_SCHEMA,
      handler: async (request, reply) => {
        const procedure = this.httpToProcedure(request);
        this.procedureCallback(
          procedure,
          (procedureResponse: ProcedureResponse) => {
            reply.send(procedureResponse);
          }
        );
      },
    });
  }
}

export {HttpAdaptor};
