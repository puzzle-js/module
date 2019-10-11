import Worker from "worker-threads-promise";
import path from "path";
import {RenderResponse} from "./types";

class WorkerGroup {
  private i = 0;
  private workers: Worker[];

  constructor(workers: Worker[]) {
    this.workers = workers;
  }

  async distribute(data: any) {
    if (!this.workers[this.i]) this.i = 0;
    return this.workers[this.i++].postMessageAsync(data) as Promise<RenderResponse>
  }
}

class WorkerManager {
  static supported: boolean = WorkerManager.isWorkerSupported();
  static Worker = WorkerManager.getWorkerThreads();

  static createWorkerGroup(decoratedFile: string, renderHandler: string, serviceName: string, amount: number) {
    if (!this.Worker) throw new Error('Workers are not supported');


    const workers = new Array(amount).fill(null).map(_ => new this.Worker!(path.join(__dirname, './render-worker.js'), {
      workerData: {
        decoratedFile,
        serviceName,
        renderHandler
      }
    }));

    return new WorkerGroup(workers);
  }

  static isWorkerSupported() {
    try {
      require('worker-threads-promise');
      return true;
    } catch (e) {
      console.warn('Worker Threads are not supported, consider upgrading NodeJs version 12.X or use --experimental-worker');
      return false;
    }
  }

  private static getWorkerThreads() {
    try {
      return require('worker-threads-promise') as new (...args: any[]) => Worker;
    } catch (e) {
      return null;
    }
  }
}

export {
  WorkerGroup,
  WorkerManager
}
