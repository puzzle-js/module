import {ApiHandler, ApiOptions, Constructor, JSONValue} from "./types";
import {DEFAULT_RENDER_WORKER_COUNT, META_TYPES} from "./enums";
import {ApiProcedureResponseBuilder} from "./procedure-response-builder";
import {WorkerGroup, WorkerManager} from "./worker-manager";
import {IOC} from "./ioc";

class Api<T = unknown> {
  // tslint:disable-next-line:no-any
  instance?: any;
  name: string;

  private readonly service: Constructor<T>;
  private workerGroup?: WorkerGroup;
  private configuration: ApiOptions;
  private handlers: Map<string, ApiHandler>;

  constructor(service: Constructor<T>) {
    this.name = Reflect.getMetadata(META_TYPES.PATH, service);
    this.configuration = Reflect.getMetadata(META_TYPES.CONFIGURATION, service) as ApiOptions;
    this.handlers = Reflect.getMetadata(META_TYPES.API_HANDLERS, service) as Map<string, ApiHandler>;
    this.service = service;
  }

  init() {
    this.validate(this.configuration);

    if (WorkerManager.supported && this.configuration.workers !== 0) {
      const decoratedFile = Reflect.getMetadata(META_TYPES.FILE_PATH, this.service) as string;
      this.workerGroup = WorkerManager.createWorkerGroup(decoratedFile, this.name, this.configuration.workers || DEFAULT_RENDER_WORKER_COUNT);
    } else {
      this.instance = IOC.get(this.service);
    }

    return this;
  }

  async request(endpoint: string, params: JSONValue, response: ApiProcedureResponseBuilder) {
    const targetEndpoint = this.handlers.get(endpoint);
    if (!targetEndpoint) {
      return response.upgradeVersion({
        upgrade: true
      });
    }

    if (this.workerGroup) {
      const response = await this.workerGroup.distribute({
        handler: targetEndpoint.handler,
        data: params
      });

      console.log(response);
    }

    if (this.instance && typeof (this.instance)[targetEndpoint.handler] === 'function') {
      return this.instance[targetEndpoint.handler](params, response);
    }

    return response.upgradeVersion({
      upgrade: true
    });
  }

  private validate(configuration: ApiOptions) {
    // if (!configuration.mapper) {
    //   throw new Error(`Mapper not provided for api (${this.name})`);
    // }
    //
    // if (!configuration.params) {
    //   throw new Error(`Params not provided for api (${this.name})`);
    // }

    // if (JSON.stringify(Object.keys(configuration.mapper).sort()) !== JSON.stringify(Object.keys(configuration.params).sort())) {
    //   throw new Error(`@fragment params and mapper is not matching for service(${this.name})`);
    // }
  }
}

export {
  Api
}
