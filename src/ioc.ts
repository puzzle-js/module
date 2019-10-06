import "reflect-metadata"
import {constructor} from "./types";

class IOC {
  static IOC_REGISTRIES: Map<string, {
    ctor: constructor,
    instance?: any
  }> = new Map();

  static get<T>(ctor: constructor): T {
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

  static register(ctor: constructor) {
    this.IOC_REGISTRIES.set(ctor.name, {
      ctor
    });
  }

  static clear() {
    this.IOC_REGISTRIES.clear();
  }

  private static getInjections(ctor: constructor): constructor[] {
    return Reflect.getMetadata('design:paramtypes', ctor);
  }
}


export {
  IOC
}
