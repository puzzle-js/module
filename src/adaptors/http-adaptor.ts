import {Adaptor, Procedure, ProcedureCallback} from "../types";
import {HttpServer} from "./http-server";
import {IncomingMessage, ServerResponse} from "http";
import {HttpRouter} from "./http-router";


class HttpAdaptor implements Adaptor {
  private server: HttpServer;
  private router: HttpRouter;
  private procedureCallback!: ProcedureCallback;


  constructor(
    server: HttpServer,
    router: HttpRouter
  ) {
    this.server = server;
    this.router = router;

    this.handleIncomingRequest = this.handleIncomingRequest.bind(this);
  }

  handleIncomingRequest(req: IncomingMessage, res: ServerResponse) {
    if (req.method === "POST") {
      const data: Buffer[] = [];
      req.on('data', chunk => {
        data.push(chunk)
      });
      req.on('end', () => {
        const a = JSON.parse(data.toString()) as Procedure;
        this.procedureCallback(a, procedureResponse => {
          console.log(procedureResponse);
          res.end();
        });
      });
    } else {
      res.statusCode = 405;
      res.end();
    }
  }

  async init(procedureCallback: ProcedureCallback) {
    this.procedureCallback = procedureCallback;
  }

  async start() {
    this.server.listen(this.handleIncomingRequest);
  }
}

export {
  HttpAdaptor
}
