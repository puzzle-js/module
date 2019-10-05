import "reflect-metadata";
import {assertType} from "./decorators";
import {META_TYPES, SERVICE_TYPE} from "./enums";
import {ApiHandler, constructor, ModuleConfiguration} from "./types";
import Router from "find-my-way";
import path from "path";
import {IOC} from "./ioc";

class Module {
  private router = Router();

  public async init() {
    await this.onBeforeInit();

    assertType(this.constructor, SERVICE_TYPE.MODULE);
    const configuration = Reflect.getMetadata(META_TYPES.CONFIGURATION, this.constructor) as ModuleConfiguration;
    configuration.bootstrap.forEach(service => this.registerModules(service));
    console.log(this.router.prettyPrint());
  }

  private registerModules(service: constructor) {
    const type = Reflect.getMetadata(META_TYPES.TYPE, service);

    switch (type) {
      case SERVICE_TYPE.API:
        this.connectApi(service);
        break;
      case SERVICE_TYPE.FRAGMENT:

        break;
    }
  }

  private connectApi(service: any) {
    const handlers = Reflect.getMetadata(META_TYPES.API_HANDLERS, service) as ApiHandler[];
    const pathPrefix = Reflect.getMetadata(META_TYPES.PATH, service);

    const apiInstance = IOC.get(service) as any;

    handlers.forEach(apiHandler => {
      this.router[apiHandler.method](path.join(pathPrefix, apiHandler.path), apiInstance[apiHandler.handler].bind(apiInstance));
    });
  };

  async onBeforeInit(): Promise<any> {
    return;
  }
}

export {
  Module
}

