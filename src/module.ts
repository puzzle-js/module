import "reflect-metadata";
import {assertType} from "./decorators";
import {API_PREFIX, DEVELOPMENT_PORT, META_TYPES, SERVICE_TYPE} from "./enums";
import {ApiHandler, constructor, ModuleConfiguration, Stringifier} from "./types";
import Router from "find-my-way";
import path from "path";
import {IOC} from "./ioc";
import {Fragment} from "./fragment";
import {detectDevelopmentMode} from "./helpers";
import {Server} from "./server";


class Module {
  private router = Router({
    ignoreTrailingSlash: true
  });
  fragments: Map<string, Fragment> = new Map();

  constructor() {
    this.developmentMode();
  }

  public async init() {
    await this.onBeforeInit();

    assertType(this.constructor, SERVICE_TYPE.MODULE);

    const configuration = Reflect.getMetadata(META_TYPES.CONFIGURATION, this.constructor) as ModuleConfiguration;
    configuration.bootstrap.forEach(service => this.registerModules(service));

    this.connectFragments();
  }

  private developmentMode() {
    if (detectDevelopmentMode()) {
      console.info('Development mode enabled, starting module in preview mode');

      this
        .init()
        .then(() => {
          const server = new Server(this.router.lookup.bind(this.router), {port: DEVELOPMENT_PORT});
          console.log(this.router.prettyPrint());
          server.listen(() => {
            console.log(`Server started listening on port ${DEVELOPMENT_PORT}`);
          });
        });
    }
  }

  private registerModules(service: constructor) {
    const type = Reflect.getMetadata(META_TYPES.TYPE, service);

    switch (type) {
      case SERVICE_TYPE.API:
        this.connectApi(service);
        break;
      case SERVICE_TYPE.DATA_PROVIDER:
      case SERVICE_TYPE.RENDER_ENGINE:
        this.connectFragmentService(service, type);
        break;
    }
  }

  private connectApi(service: constructor) {
    const handlers = Reflect.getMetadata(META_TYPES.API_HANDLERS, service) as ApiHandler[];
    const pathPrefix = Reflect.getMetadata(META_TYPES.PATH, service);

    const apiInstance = IOC.get(service) as any;

    handlers.forEach(apiHandler => {
      this.router[apiHandler.method](path.join(API_PREFIX, pathPrefix, apiHandler.path), this.handleApiResponse.bind(this, apiInstance, apiHandler));
    });
  };

  private handleApiResponse(instance: any, handlerMeta: ApiHandler, request: any, response: any) {
    let data = instance[handlerMeta.handler](request);

    if (typeof data.then === 'function') {
      data.then((resolved: any) => {
        response.end(this.mapResponseToHTTP(resolved, handlerMeta.stringifier))
      });
    } else {
      response.end(this.mapResponseToHTTP(data, handlerMeta.stringifier))
    }
  }

  private mapResponseToHTTP(data: any, stringifier?: Stringifier) {
    if (typeof data === 'object') {
      return stringifier ? stringifier(data) : JSON.stringify(data);
    } else {
      data.toString();
    }
  }


  private connectFragmentService(service: constructor, type: SERVICE_TYPE) {
    const fragmentName = Reflect.getMetadata(META_TYPES.FRAGMENT, service) as string;

    let fragment = this.fragments.get(fragmentName);
    if (!fragment) fragment = new Fragment(fragmentName);

    if (type === SERVICE_TYPE.DATA_PROVIDER) {
      fragment.setService(service);
    } else if (type === SERVICE_TYPE.RENDER_ENGINE) {
      fragment.setService(service);
    }

    this.fragments.set(fragmentName, fragment);
  }

  private connectFragments() {
    this.fragments.forEach(fragmentService => {
      fragmentService.validate();
      this.router.get(`/${fragmentService.name}/`, fragmentService.render.bind(fragmentService));
    });
  }

  getRouter() {
    return this.router.lookup.bind(this.router);
  }

  async onBeforeInit(): Promise<any> {
    return;
  }
}

export {
  Module
}

