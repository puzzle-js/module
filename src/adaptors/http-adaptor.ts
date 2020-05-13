/* istanbul ignore file */


import {Adaptor, Procedure, ProcedureCallback, ProcedureResponse,} from '../types';
import fastify, {FastifyReply, FastifyRequest} from 'fastify';
import {DEVELOPMENT_PORT} from '../enums';
import {ServerResponse} from "http";


/*

Running 10s test @ http://0.0.0.0:4444
10 connections

┌─────────┬──────┬──────┬───────┬──────┬─────────┬─────────┬─────────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%  │ Avg     │ Stdev   │ Max     │
├─────────┼──────┼──────┼───────┼──────┼─────────┼─────────┼─────────┤
│ Latency │ 0 ms │ 0 ms │ 0 ms  │ 0 ms │ 0.01 ms │ 0.05 ms │ 8.38 ms │
└─────────┴──────┴──────┴───────┴──────┴─────────┴─────────┴─────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬──────────┬────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg      │ Stdev  │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼──────────┼────────┼─────────┤
│ Req/Sec   │ 37215   │ 37215   │ 38591   │ 39583   │ 38657.46 │ 773.24 │ 37190   │
├───────────┼─────────┼─────────┼─────────┼─────────┼──────────┼────────┼─────────┤
│ Bytes/Sec │ 9.27 MB │ 9.27 MB │ 9.61 MB │ 9.86 MB │ 9.63 MB  │ 195 kB │ 9.26 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴──────────┴────────┴─────────┘

Req/Bytes counts sampled once per second.

425k requests in 11.03s, 106 MB read

 */


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
          properties: {
            params: {
              type: 'object',
              patternProperties: {
                '.*': {
                  type: "string",
                },
              },
            },
            mapper: {
              type: 'object',
              patternProperties: {
                '.*': {
                  type: 'array',
                  items: {type: 'string'}
                },
              },
            }
          }
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

    this.routeHandler = this.routeHandler.bind(this);

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
      api: request.body.api,
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
      handler: this.routeHandler,
    });
  }


  private async routeHandler(request: FastifyRequest, reply: FastifyReply<ServerResponse>) {
    const procedure = this.httpToProcedure(request);
    this.procedureCallback(
      procedure,
      (procedureResponse: ProcedureResponse) => {
        reply.send(procedureResponse);
      }
    );
  }
}

export {HttpAdaptor};
