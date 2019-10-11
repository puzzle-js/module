import http from "http";

interface ServerOptions {
  port?: number;
  hostname?: string;
}

class Server {
  instance: http.Server;

  private options: ServerOptions;
  private readonly handler: any;


  constructor(handler: any, options?: ServerOptions) {
    this.options = options || {};
    this.handler = handler;

    this.instance = this.create();
  }

  listen(cb?: () => void) {
    if (!this.options.hostname) {
      this.instance.listen(this.options.port || 8000, cb);
    } else {
      this.instance.listen(this.options.port || 8000, this.options.hostname, cb);
    }
  }

  private create() {
    return http.createServer(this.handler)
  }
}

export {
  ServerOptions,
  Server
}
