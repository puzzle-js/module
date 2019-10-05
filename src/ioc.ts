import "reflect-metadata"
import {constructor} from "./types";

class IOC {
  private static IOC_REGISTRIES: Map<string, {
    ctor: constructor,
    instance?: object
  }> = new Map();

  static get(ctor: constructor): object {
    const ioc_registry = this.IOC_REGISTRIES.get(ctor.name);

    if (!ioc_registry) {
      throw new Error(`${ctor.name} is not marked as injectable`);
    }

    if (ioc_registry.instance) {
      return ioc_registry.instance;
    }

    const injections = this.getInjections(ctor) || [];

    const injectionInstances = injections.map(injection => {
      return this.get(injection);
    });

    const instance = new ctor(...injectionInstances);


    ioc_registry.instance = instance;
    this.IOC_REGISTRIES.set(ctor.name, ioc_registry);


    return instance;
  }

  static register(ctorName: string, ctor: constructor) {
    this.IOC_REGISTRIES.set(ctorName, {
      ctor
    });
  }

  private static getInjections(ctor: constructor): constructor[] {
    return Reflect.getMetadata('design:paramtypes', ctor);
  }
}


export {
  IOC
}
