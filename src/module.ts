/* tslint:disable */
import "reflect-metadata";
import {assertType} from "./decorators";
import {DEVELOPMENT_PORT, META_TYPES, ProcedureActionType, SERVICE_TYPE} from "./enums";
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
import {ApiProcedureResponseBuilder, ProcedureResponseBuilder} from "./procedure-response-builder";
import {Api} from "./api";
import {Component} from "./component";

class Module {
  private readonly adaptor: Adaptor;
  private api: Map<string, Api> = new Map();
  private components: Map<string, Component> = new Map();
  private fragment?: Fragment;

  constructor(adaptor: Adaptor) {
    this.adaptor = adaptor;

    this.handleIncomingProcedure = this.handleIncomingProcedure.bind(this);
  }

  static run(moduleCtor: Constructor<Module>) {
    const moduleConfiguration = Reflect.getMetadata(META_TYPES.CONFIGURATION, moduleCtor) as unknown as ModuleConfiguration;

    const adaptor = new moduleConfiguration.adaptor();

    const module = new moduleCtor(adaptor);

    return module.init();
  }

  async init() {
    this.validateSettings();

    this.registerDependencies();
    await this.onBeforeInit(IOC);

    await this.adaptor
      .init(this.handleIncomingProcedure)
      .then(() => this.adaptor.start(process.env.PORT ? +process.env.PORT : DEVELOPMENT_PORT));
  }

  private registerDependencies() {
    const configuration = Reflect.getMetadata(META_TYPES.CONFIGURATION, this.constructor) as ModuleConfiguration;

    configuration.bootstrap
      .forEach(service => {
        const type = Reflect.getMetadata(META_TYPES.TYPE, service);

        switch (type) {
          case SERVICE_TYPE.API:
            const api = new Api(service).init();
            this.api.set(api.name, api);
            break;
          case SERVICE_TYPE.FRAGMENT:
            // this.fragment = IOC.get<Fragment>(service);
            break;
          case SERVICE_TYPE.COMPONENT:
            const component = IOC.get<Component>(service);
            // this.components.set(component.name, component);
            break;
          default:
            throw new Error(`Unexpected service type (${service.name}) in bootstrap`);
        }
      });
  }

  private handleIncomingProcedure(procedure: Procedure, cb: (procedureResponse: ProcedureResponse) => void) {
    const responseBuilder = ProcedureResponseBuilder
      .create(procedure.action, cb);

    if (procedure.action === ProcedureActionType.API && procedure.api) {
      const apiHandler = this.api.get(procedure.api.base);

      if (apiHandler) {
        return apiHandler.request(procedure.api.endpoint, procedure.params, responseBuilder as ApiProcedureResponseBuilder);
      }
    }

    return responseBuilder
      .upgradeVersion({
        params: {
          test: 44
        }
      });

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

  async onBeforeInit(ioc: IOC): Promise<any> {
    return;
  }

  // private registerModules(service: Constructor) {
  //   const type = Reflect.getMetadata(META_TYPES.TYPE, service);
  //
  //   switch (type) {
  //     case SERVICE_TYPE.API:
  //       this.connectApi(service);
  //       break;
  //     // case SERVICE_TYPE.DATA_PROVIDER:
  //     // case SERVICE_TYPE.RENDER_ENGINE:
  //     //   this.connectFragmentService(service, type);
  //     //   break;
  //     default:
  //       throw new Error('Unexpected module type');
  //   }
  // }
  //
  // private connectApi(service: Constructor) {
  //   const handlers = Reflect.getMetadata(META_TYPES.API_HANDLERS, service) as ApiHandler[];
  //   const pathPrefix = Reflect.getMetadata(META_TYPES.PATH, service);
  //
  //   const apiInstance = IOC.get(service) as any;
  //
  //   handlers.forEach(apiHandler => {
  //     // this.router[apiHandler.method](path.join(API_PREFIX, pathPrefix, apiHandler.path), this.handleApiResponse.bind(this, apiInstance, apiHandler));
  //   });
  // };
  //
  // private handleApiResponse(instance: any, handlerMeta: ApiHandler, request: any, response: any) {
  //   const data = instance[handlerMeta.handler](request);
  //
  //   if (typeof data.then === 'function') {
  //     data.then((resolved: any) => {
  //       response.end(this.mapResponseToHTTP(resolved, handlerMeta.stringifier))
  //     });
  //   } else {
  //     response.end(this.mapResponseToHTTP(data, handlerMeta.stringifier))
  //   }
  // }

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

    // if (type === SERVICE_TYPE.DATA_PROVIDER) {
    //   fragment.setService(service);
    // } else if (type === SERVICE_TYPE.RENDER_ENGINE) {
    //   fragment.setService(service);
    // }

    // this.fragment = fragment;
  }

  private registerFragment() {

    // this.fragment.validate();
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

  private validateSettings() {
    assertType(this.constructor, SERVICE_TYPE.MODULE);

    const configuration = Reflect.getMetadata(META_TYPES.CONFIGURATION, this.constructor) as ModuleConfiguration;

    if (!configuration.name) {
      throw new Error('Module name not provided');
    }

    if (typeof configuration.adaptor === 'undefined') {
      throw new Error(`Module adaptor not provided`);
    }

    const fragmentExists = configuration.bootstrap.find(service => Reflect.getMetadata(META_TYPES.TYPE, service) === SERVICE_TYPE.FRAGMENT);
    const componentsExists = configuration.bootstrap.some(service => Reflect.getMetadata(META_TYPES.TYPE, service) === SERVICE_TYPE.COMPONENT);

    if (componentsExists && !fragmentExists) {
      throw new Error('Components registered without fragment')
    }
  }
}

export {
  Module
}

