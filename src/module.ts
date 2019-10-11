import "reflect-metadata";
import {assertType} from "./decorators";
import {API_PREFIX, DEVELOPMENT_PORT, META_TYPES, SERVICE_TYPE} from "./enums";
import {ApiHandler, constructor, ModuleConfiguration} from "./types";
import Router from "find-my-way";
import path from "path";
import {IOC} from "./ioc";
import {Fragment} from "./fragment";
import {detectDevelopmentMode} from "./helpers";
import {Server} from "./server";
import {WorkerManager} from "./worker-manager";



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
        this.connectDataProvider(service);
        break;
      case SERVICE_TYPE.RENDER_ENGINE:
        this.connectRenderService(service);
        break;
    }
  }

  private connectApi(service: constructor) {
    const handlers = Reflect.getMetadata(META_TYPES.API_HANDLERS, service) as ApiHandler[];
    const pathPrefix = Reflect.getMetadata(META_TYPES.PATH, service);

    const apiInstance = IOC.get(service) as any;

    handlers.forEach(apiHandler => {
      this.router[apiHandler.method](path.join(API_PREFIX, pathPrefix, apiHandler.path), apiInstance[apiHandler.handler].bind(apiInstance));
    });
  };


  private connectDataProvider(service: constructor) {
    const fragmentName = Reflect.getMetadata(META_TYPES.FRAGMENT, service) as string;

    let fragment = this.fragments.get(fragmentName);
    if (!fragment) fragment = new Fragment(fragmentName);

    fragment.setDataService(service);

    this.fragments.set(fragmentName, fragment);
  }

  private connectRenderService(service: constructor) {
    const fragmentName = Reflect.getMetadata(META_TYPES.FRAGMENT, service) as string;

    let fragment = this.fragments.get(fragmentName);
    if (!fragment) fragment = new Fragment(fragmentName);

    fragment.setRenderService(service);

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

