import {constructor, DataRequest, DataResponse, RenderOptions, RenderResponse} from "./types";
import {DEFAULT_RENDER_WORKER_COUNT, META_TYPES} from "./enums";
import {IOC} from "./ioc";
import {WorkerManager} from "./worker-manager";


class Fragment {
  public name: string;

  private workerSupported: boolean = false;
  private dataHandler!: (req: DataRequest) => Promise<DataResponse> | DataResponse;
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
  setDataService(service: constructor) {
    const dataHandler = Reflect.getMetadata(META_TYPES.HANDLER, service) as string;
    const dataService = IOC.get(service) as any;

    this.dataHandler = dataService[dataHandler].bind(dataService);
  }

  /**
   * Sets render service of the fragment
   * @param service
   */
  setRenderService(service: constructor) {
    const renderConfiguration = Reflect.getMetadata(META_TYPES.CONFIGURATION, service) as RenderOptions;
    const renderHandler = Reflect.getMetadata(META_TYPES.HANDLER, service) as string;

    if (WorkerManager.isWorkerSupported() && renderConfiguration.workers !== 0) {
      this.workerSupported = true;
      const decoratedFile = Reflect.getMetadata(META_TYPES.FILE_PATH, service) as string;
      const workerGroup = WorkerManager.createWorkerGroup(decoratedFile, renderHandler, service.name, renderConfiguration.workers || DEFAULT_RENDER_WORKER_COUNT);
      this.renderHandler = (data: DataResponse) => workerGroup.distribute(data);
    } else {
      const renderService = IOC.get(service) as any;
      this.renderHandler = renderService[renderHandler].bind(renderService);
    }
  }

  /**
   * Render method for handling requests
   * @param req
   * @param res
   */
  async render(req: any, res: any) {
    const dataResponse = await this.dataHandler({} as any);
    const {data} = dataResponse;
    if (data) {
      if (!this.workerSupported) {
        res.end(JSON.stringify(this.renderHandler(data)));
      } else {
        res.end(await this.renderHandler(data));
      }
    }
  }


}

export {
  Fragment
}
