import http, {IncomingMessage, ServerResponse} from "http";
import {DEVELOPMENT_PORT} from "../enums";

interface ServerOptions {
  port?: number;
  hostname?: string;
}

class HttpServer {
  private options: ServerOptions;

  constructor(options?: ServerOptions) {
    this.options = {
      ...options,
      port: options && options.port ? options.port : (process.env.PORT ? +process.env.PORT : DEVELOPMENT_PORT)
    }
  }

  listen(handler: (req: IncomingMessage, res: ServerResponse) => void, cb?: () => void) {
    const instance = http.createServer(handler);

    if (!this.options.hostname) {
      instance.listen(this.options.port, cb);
    } else {
      instance.listen(this.options.port, this.options.hostname, cb);
    }
  }
}

export {
  ServerOptions,
  HttpServer
}
