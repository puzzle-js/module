/* istanbul ignore file */

import {Adaptor, Procedure, ProcedureCallback, ProcedureResponse} from "../types";
import {App, HttpResponse} from "uWebSockets.js";

const fastJson = require('fast-json-stringify');

/*

Running 10s test @ http://0.0.0.0:4445
10 connections

┌─────────┬──────┬──────┬───────┬──────┬─────────┬─────────┬─────────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%  │ Avg     │ Stdev   │ Max     │
├─────────┼──────┼──────┼───────┼──────┼─────────┼─────────┼─────────┤
│ Latency │ 0 ms │ 0 ms │ 0 ms  │ 0 ms │ 0.01 ms │ 0.04 ms │ 8.37 ms │
└─────────┴──────┴──────┴───────┴──────┴─────────┴─────────┴─────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg     │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Req/Sec   │ 63199   │ 63199   │ 68031   │ 69119   │ 67614.4 │ 1561.73 │ 63180   │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Bytes/Sec │ 12.2 MB │ 12.2 MB │ 13.1 MB │ 13.3 MB │ 13 MB   │ 301 kB  │ 12.2 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘

Req/Bytes counts sampled once per second.

676k requests in 10.03s, 130 MB read

 */
const httpResponseStringifier = fastJson({
  title: 'Example Schema',
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
  }
});


class Uws implements Adaptor {
  private server = App();
  private procedureCallback!: ProcedureCallback;


  async init(procedureCallback: ProcedureCallback) {
    this.procedureCallback = procedureCallback;

    this.server.post('/*', res => {
      this.readJsonStream(res, (procedure: Procedure) => {
        this.procedureCallback(
          procedure,
          (procedureResponse: ProcedureResponse) => {
            res
              .writeHeader('content-type', 'application/json')
              .end(JSON.stringify(procedureResponse))
          }
        );
      }, () => {
        res
          .end();
      });
    });
  }

  async start(port: number): Promise<void> {
    this.server.listen(port, token => {
      console.log(token);
    });
  }

  // tslint:disable-next-line:no-any
  private readJsonStream(res: HttpResponse, cb: (parsedObject: Procedure) => void, errCb: () => void) {
    let buffer: Buffer;
    res.onData((ab, isLast) => {
      const chunk = Buffer.from(ab);
      if (isLast) {
        let json;
        if (buffer) {
          try {
            json = JSON.parse(Buffer.concat([buffer, chunk]).toString());
          } catch (e) {
            res.close();
            return;
          }
          cb(json);
        } else {
          try {
            json = JSON.parse(chunk.toString());
          } catch (e) {
            res.close();
            return;
          }
          cb(json);
        }
      } else {
        if (buffer) {
          buffer = Buffer.concat([buffer, chunk]);
        } else {
          buffer = Buffer.concat([chunk]);
        }
      }
    });

    res.onAborted(errCb);
  }
}

export {
  Uws
}
