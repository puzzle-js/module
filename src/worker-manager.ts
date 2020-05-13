import Worker from "worker-threads-promise";
import path from "path";
import {DEFAULT_CONTENT_TIMEOUT} from "./enums";
import {WorkerMessage, WorkerProps} from "./types";

// todo Workers might not be ready!
class WorkerGroup {
  private i = 0;
  private workers: Worker[];

  constructor(workers: Worker[]) {
    this.workers = workers;
  }

  async distribute<T>(message: WorkerMessage, timeout: number = DEFAULT_CONTENT_TIMEOUT) {
    if (!this.workers[this.i]) this.i = 0;
    return this.workers[this.i++].postMessageAsync(message, {timeout}) as Promise<T>
  }
}

class WorkerManager {
  static supported: boolean = WorkerManager.isWorkerSupported();
  static worker = WorkerManager.getWorkerThreads();

  static createWorkerGroup(decoratedFile: string, serviceName: string, amount: number) {
    if (!this.worker) throw new Error('Workers are not supported');

    const workers = new Array(amount)
      .fill(null)
      .map(_ => new this.worker!(path.join(__dirname, './worker.js'), {
        workerData: {
          decoratedFile,
          serviceName,
        } as WorkerProps
      }));

    console.log(decoratedFile, serviceName);

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
      return require('worker-threads-promise') as new (...args: unknown[]) => Worker;
    } catch (e) {
      return null;
    }
  }
}

export {
  WorkerGroup,
  WorkerManager
}
