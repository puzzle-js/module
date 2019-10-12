import {constructor, DataOptions, DataRequest, DataResponse, RenderOptions, RenderResponse} from "./types";
import {DEFAULT_RENDER_WORKER_COUNT, META_TYPES, SERVICE_TYPE} from "./enums";
import {IOC} from "./ioc";
import {WorkerManager} from "./worker-manager";


class Fragment {
  public name: string;

  private workerSupported: boolean = false;
  private dataHandler!: (req: DataRequest) => DataResponse | Promise<DataResponse> ;
  private renderHandler!: (data: DataResponse) => RenderResponse | Promise<RenderResponse>;

  constructor(name: string) {
    this.name = name;

    this.render = this.render.bind(this);
  }

  /**
   * Validates fragment settings on runtime
   */
  validate() {
    if (!this.dataHandler) {
      throw new Error(`Data service of fragment ${this.name} is not registered.`);
    }

    if (!this.renderHandler) {
      throw new Error(`Render service of fragment ${this.name} is not registered.`);
    }
  }


  /**
   * Sets data service for the fragment
   * @param service
   */
  setService(service: constructor) {
    const handler = Reflect.getMetadata(META_TYPES.HANDLER, service) as string;
    const type = Reflect.getMetadata(META_TYPES.TYPE, service) as SERVICE_TYPE;
    const configuration = Reflect.getMetadata(META_TYPES.CONFIGURATION, service) as DataOptions;

    const handlerName = type === SERVICE_TYPE.RENDER_ENGINE ? 'renderHandler': 'dataHandler';

    if (WorkerManager.supported && configuration.workers !== 0) {
      this.workerSupported = true;
      const decoratedFile = Reflect.getMetadata(META_TYPES.FILE_PATH, service) as string;
      const workerGroup = WorkerManager.createWorkerGroup(decoratedFile, handler, service.name, configuration.workers || DEFAULT_RENDER_WORKER_COUNT);
      this[handlerName] = (request: DataRequest | DataResponse) => workerGroup.distribute<any>(request);
    } else {
      const renderService = IOC.get(service) as any;
      this[handlerName] = renderService[handler].bind(renderService);
    }
  }
  //
  // /**
  //  * Sets render service of the fragment
  //  * @param service
  //  */
  // setRenderService(service: constructor) {
  //   const handler = Reflect.getMetadata(META_TYPES.HANDLER, service) as string;
  //   const renderConfiguration = Reflect.getMetadata(META_TYPES.CONFIGURATION, service) as RenderOptions;
  //
  //   if (WorkerManager.isWorkerSupported() && renderConfiguration.workers !== 0) {
  //     this.workerSupported = true;
  //     const decoratedFile = Reflect.getMetadata(META_TYPES.FILE_PATH, service) as string;
  //     const workerGroup = WorkerManager.createWorkerGroup(decoratedFile, handler, service.name, renderConfiguration.workers || DEFAULT_RENDER_WORKER_COUNT);
  //     this.renderHandler = (data: DataResponse) => workerGroup.distribute<RenderResponse>(data);
  //   } else {
  //     const renderService = IOC.get(service) as any;
  //     this.renderHandler = renderService[handler].bind(renderService);
  //   }
  // }


  /**
   * Render method for handling requests
   * @param req
   * @param res
   */
  async render(req: any, res: any) {
    const dataResponse = await this.dataHandler({} as any);
    const {data} = dataResponse;
    if (data) {
      const renderResult = this.workerSupported ? await this.renderHandler(data) : this.renderHandler(data);
      res.end(JSON.stringify(renderResult));
    }
  }


}

export {
  Fragment
}
