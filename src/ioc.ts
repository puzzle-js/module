import "reflect-metadata"
import {Constructor} from "./types";

class IOC {
  static IOC_REGISTRIES: Map<string, {
    ctor: Constructor,
    instance?: unknown
  }> = new Map();

  static get<T>(ctor: Constructor): T {
    const iocRegistry = this.IOC_REGISTRIES.get(ctor.name);

    if (!iocRegistry) {
      throw new Error(`${ctor.name} is not marked as injectable`);
    }

    if (iocRegistry.instance) {
      return iocRegistry.instance as T;
    }

    const injections = this.getInjections(ctor) || [];


    const injectionInstances = injections.map(injection => {
      return this.get(injection);
    });

    const instance = new ctor(...injectionInstances);


    iocRegistry.instance = instance;
    this.IOC_REGISTRIES.set(ctor.name, iocRegistry);


    return instance as T;
  }

  static register(ctor: Constructor) {
    this.IOC_REGISTRIES.set(ctor.name, {
      ctor
    });
  }

  static clear() {
    this.IOC_REGISTRIES.clear();
  }

  private static getInjections(ctor: Constructor): Constructor[] {
    return Reflect.getMetadata('design:paramtypes', ctor);
  }
}


export {
  IOC
}
