/* tslint:disable */
import "reflect-metadata";
import {assertType} from "./decorators";
import {META_TYPES, SERVICE_TYPE} from "./enums";
import {
  Adaptor,
  ApiHandler,
  Constructor,
  JSONObject,
  JSONValue,
  ModuleConfiguration,
  Procedure,
  ProcedureResponse,
  Stringifier
} from "./types";
import {IOC} from "./ioc";
import {Fragment} from "./fragment";
import {FragmentProcedureResponseBuilder, ProcedureResponseBuilder} from "./procedure-response-builder";
import {Uws} from "./adaptors/uws";

class Module {
  private fragment!: Fragment;
  private readonly adaptors: Adaptor[];

  constructor(adaptors: Adaptor[]) {
    this.adaptors = adaptors;

    this.adaptorCallback = this.adaptorCallback.bind(this);
  }

  static run(moduleCtor: Constructor<Module>) {
    const uws = new Uws();
    const module = new moduleCtor([uws]);

    return module.init();
  }

  async init() {
    assertType(this.constructor, SERVICE_TYPE.MODULE);

    await this.onBeforeInit();

    this.bootstrapDependencies();
    this.connectFragmentToRouter();
    this.connectConfiguration();

    for (const adaptor of this.adaptors) {
      await adaptor
        .init(this.adaptorCallback)
        .then(() => adaptor.start());
    }
  }

  private bootstrapDependencies() {
    const configuration = Reflect.getMetadata(META_TYPES.CONFIGURATION, this.constructor) as ModuleConfiguration;
    configuration.bootstrap.forEach(service => this.registerModules(service));
  }

  private adaptorCallback(procedure: Procedure, cb: (procedureResponse: ProcedureResponse) => void) {
    const response = ProcedureResponseBuilder
      .create(procedure.action, cb) as FragmentProcedureResponseBuilder;
    //
    // if (procedure.version !== '3') {
    //   return response.upgradeVersion({
    //     params: {
    //       storefrontId: 'number'
    //     },
    //     mapper: {
    //       storefrontId: ['query', 'env']
    //     }
    //   });
    // }
    // //
    // response
    //   .header('test', 'true')
    //   .partial('tt', '4434')
    //   .status(204)
    //   .done();
  }

  async onBeforeInit(): Promise<any> {
    return;
  }

  private registerModules(service: Constructor) {
    const type = Reflect.getMetadata(META_TYPES.TYPE, service);

    switch (type) {
      case SERVICE_TYPE.API:
        this.connectApi(service);
        break;
      case SERVICE_TYPE.DATA_PROVIDER:
      case SERVICE_TYPE.RENDER_ENGINE:
        this.connectFragmentService(service, type);
        break;
      default:
        throw new Error('Unexpected module type');
    }
  }

  private connectApi(service: Constructor) {
    const handlers = Reflect.getMetadata(META_TYPES.API_HANDLERS, service) as ApiHandler[];
    const pathPrefix = Reflect.getMetadata(META_TYPES.PATH, service);

    const apiInstance = IOC.get(service) as any;

    handlers.forEach(apiHandler => {
      // this.router[apiHandler.method](path.join(API_PREFIX, pathPrefix, apiHandler.path), this.handleApiResponse.bind(this, apiInstance, apiHandler));
    });
  };

  private handleApiResponse(instance: any, handlerMeta: ApiHandler, request: any, response: any) {
    const data = instance[handlerMeta.handler](request);

    if (typeof data.then === 'function') {
      data.then((resolved: any) => {
        response.end(this.mapResponseToHTTP(resolved, handlerMeta.stringifier))
      });
    } else {
      response.end(this.mapResponseToHTTP(data, handlerMeta.stringifier))
    }
  }

  private mapResponseToHTTP(data: JSONObject | JSONValue, stringifier?: Stringifier) {
    if (typeof data === 'object') {
      return stringifier ? stringifier(data) : JSON.stringify(data);
    } else {
      return data.toString();
    }
  }

  private connectFragmentService(service: Constructor, type: SERVICE_TYPE) {
    let fragment = this.fragment;
    if (!fragment) fragment = new Fragment();

    if (type === SERVICE_TYPE.DATA_PROVIDER) {
      fragment.setService(service);
    } else if (type === SERVICE_TYPE.RENDER_ENGINE) {
      fragment.setService(service);
    }

    this.fragment = fragment;
  }

  private connectFragmentToRouter() {
    this.fragment.validate();
    // this.router.post('/fragment', (req, res) => {
    //   if (req.headers.version !== '2') {
    //     res.statusCode = 422;
    //     res.setHeader('content-type', 'application/json');
    //     res.setHeader('version', '2');
    //     res.end(JSON.stringify(this.getConfiguration()));
    //   } else {
    //     res.setHeader('content-type', 'application/json');
    //     this.fragment.render(req, res);
    //   }
    // });
  }

  private connectConfiguration() {
    // this.router.get('/__/configuration', (req, res) => {
    //   res.end(JSON.stringify(this.getConfiguration()));
    // });
  }
}

export {
  Module
}

