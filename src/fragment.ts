import {constructor, DataOptions, DataRequest, DataResponse, ParsableParamsObject, RenderResponse} from "./types";
import {DEFAULT_RENDER_WORKER_COUNT, META_TYPES, RENDER_TYPES, SERVICE_TYPE} from "./enums";
import {IOC} from "./ioc";
import {WorkerManager} from "./worker-manager";
import fastJsonStringifier from "fast-json-stringify";


class Fragment {
  public params!: ParsableParamsObject;

  private workerSupported: boolean = false;
  private dataHandler!: (req: DataRequest) => DataResponse | Promise<DataResponse>;
  private renderHandler!: (data: DataResponse) => RenderResponse | Promise<RenderResponse>;
  private dataErrorHandler?: (req: DataRequest) => DataResponse | Promise<DataResponse>;
  private renderErrorHandler?: (data: DataResponse) => RenderResponse | Promise<RenderResponse>;
  private stringifier!: (data: any) => string;

  constructor() {
    this.render = this.render.bind(this);
  }

  /**
   * Validates fragment settings on runtime
   */
  validate() {
    if (!this.dataHandler) {
      throw new Error(`Data service of fragment is not registered.`);
    }

    if (!this.renderHandler) {
      throw new Error(`Render service of fragment is not registered.`);
    }

    if (!this.params) {
      throw new Error(`Data service params of fragment is not provided.`);
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
    const errorHandler = Reflect.getMetadata(META_TYPES.ERROR_HANDLER, service);

    const handlerName = type === SERVICE_TYPE.RENDER_ENGINE ? 'renderHandler' : 'dataHandler';

    if (type === SERVICE_TYPE.RENDER_ENGINE) this.createStringifier(Reflect.getMetadata(META_TYPES.RENDER_PARTIALS, service));

    if (type === SERVICE_TYPE.DATA_PROVIDER) {
      this.params = configuration.params;
    }

    if (WorkerManager.supported && configuration.workers !== 0) {
      this.workerSupported = true;
      const decoratedFile = Reflect.getMetadata(META_TYPES.FILE_PATH, service) as string;
      const workerGroup = WorkerManager.createWorkerGroup(decoratedFile, handler, service.name, configuration.workers || DEFAULT_RENDER_WORKER_COUNT, errorHandler);
      this[handlerName] = (request: DataRequest | DataResponse) => workerGroup.distribute<any>({
        type: RENDER_TYPES.HANDLER,
        data: request
      });

      if (type === SERVICE_TYPE.RENDER_ENGINE) {
        this.renderErrorHandler = (request: DataResponse) => workerGroup.distribute<any>({
          type: RENDER_TYPES.ERROR,
          data: request
        });
      } else if (type === SERVICE_TYPE.DATA_PROVIDER) {
        this.dataErrorHandler = (request: DataRequest) => workerGroup.distribute<any>({
          type: RENDER_TYPES.ERROR,
          data: request
        });
      }
    } else {
      const serviceInstance = IOC.get(service) as any;
      if (errorHandler) {
        if (type === SERVICE_TYPE.RENDER_ENGINE) {
          this.renderErrorHandler = serviceInstance[errorHandler].bind(serviceInstance);
        } else if (type === SERVICE_TYPE.DATA_PROVIDER) {
          this.dataErrorHandler = serviceInstance[errorHandler].bind(serviceInstance);
        }
      }
      this[handlerName] = serviceInstance[handler].bind(serviceInstance);
    }
  }


  /**
   * Render method for handling requests
   * @param req
   * @param res
   */
  async render(req: any, res: any) {
    let dataResponse: DataResponse = {};

    dataResponse = await this.dataHandler({} as any);
    if (!dataResponse) {
      if (this.dataErrorHandler) {
        dataResponse = await this.dataErrorHandler({} as any);
        if (!dataResponse) {
          dataResponse = {
            $status: 500
          };
        }
      } else {
        if (!dataResponse) {
          dataResponse = {
            $status: 500
          };
        }
      }
    }


    let renderResponse = {
      main: ''
    } as RenderResponse;

    if (dataResponse.data) {
      renderResponse = await this.renderHandler(dataResponse.data);
      if (!renderResponse) {
        if (this.renderErrorHandler) {
          renderResponse = await this.renderErrorHandler(dataResponse.data);
          if (!renderResponse) {
            dataResponse.$status = 500;
          }
        } else {
          dataResponse.$status = 500;
        }
      }

      res.end(this.stringifier({
        ...renderResponse,
        $status: dataResponse.$status
      }));
    } else {
      res.end(this.stringifier(dataResponse));
    }
  }

  private createStringifier(metaTypes?: string[]) {
    const defaultMetaTypes = ['main'].concat(metaTypes || []);

    this.stringifier = fastJsonStringifier({
      type: 'object',
      properties: defaultMetaTypes.reduce((schema: any, partial: string) => {
        schema[partial] = {
          type: 'string'
        };
        return schema;
      }, {
        $status: {
          type: 'number'
        }
      })
    })
  }
}

export {
  Fragment
}
