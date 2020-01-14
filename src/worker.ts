import {IOC} from "./ioc";
import {RENDER_TYPES} from "./enums";
import {WorkerProps} from "./types";
import {parentPort, workerData} from "worker_threads";
import Worker from "worker-threads-promise";


class WorkerThread {
  private parentPort: any;
  private workerData: WorkerProps;
  private service: any;

  constructor(parentPort: any, workerData: WorkerProps) {
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
    this.service = IOC.get(serviceConstructor) as any;
  }

  messageHandler(msg: { type: RENDER_TYPES, data: any }) {
    if (msg.type === RENDER_TYPES.HANDLER) {
      return this.service[this.workerData.handler](msg.data);
    } else if (msg.type === RENDER_TYPES.ERROR) {
      return this.service[this.workerData.errorHandler](msg.data);
    }
  }
}

if (typeof process.env.JEST_WORKER_ID === "undefined") {
  new WorkerThread(parentPort, workerData);
}


export {
  WorkerThread
}
