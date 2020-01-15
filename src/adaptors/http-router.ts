import _Router, {Handler, HTTPVersion} from "find-my-way";
import {IncomingMessage, ServerResponse} from "http";


class HttpRouter {
  private httpRouter = _Router({
    ignoreTrailingSlash: true
  });

  constructor() {
    this.lookup = this.lookup.bind(this);
  }

  get(path: string, handler: Handler<HTTPVersion.V1>) {
    this.httpRouter.get(path, handler);
  }

  post(path: string, handler: Handler<HTTPVersion.V1>) {
    this.httpRouter.post(path, handler);
  }

  put(path: string, handler: Handler<HTTPVersion.V1>) {
    this.httpRouter.put(path, handler);
  }

  delete(path: string, handler: Handler<HTTPVersion.V1>) {
    this.httpRouter.delete(path, handler);
  }

  lookup(req: IncomingMessage, res: ServerResponse) {
    this.httpRouter.lookup(req, res);
  }

  prettyPrint() {
    this.httpRouter.prettyPrint();
  }
}


export {
  HttpRouter
}
