import {IOC} from "./ioc";
import {WorkerMessage, WorkerProps} from "./types";
import {MessagePort, parentPort, workerData} from "worker_threads";
import Worker from "worker-threads-promise";


class WorkerThread {
  // tslint:disable-next-line:no-any
  private service: any;
  private parentPort: MessagePort;
  private workerData: WorkerProps;

  constructor(parentPort: MessagePort, workerData: WorkerProps) {
    Worker.connect(parentPort);

    this.parentPort = parentPort;
    this.workerData = workerData;

    this.messageHandler = this.messageHandler.bind(this);

    parentPort.on('message', this.messageHandler);

    this.createService();
  }

  private createService() {
    const renderService = require(this.workerData.decoratedFile);
    const serviceConstructor = renderService[this.workerData.serviceName];
    this.service = IOC.get(serviceConstructor);
  }

  messageHandler(msg: WorkerMessage) {
    this.service[msg.handler](msg.data);
  }
}

if (typeof process.env.JEST_WORKER_ID === "undefined") {
  // tslint:disable-next-line:no-unused-expression
  new WorkerThread(parentPort as MessagePort, workerData);
}


export {
  WorkerThread
}
