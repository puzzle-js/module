import "reflect-metadata";
import {ModuleConfiguration} from "./types";
import {SERVICE_TYPE} from "./enums";

const TYPE_SYMBOL = Symbol.for('TYPE_SYMBOL');
const CONFIGURATION_SYMBOL = Symbol.for('CONFIGURATION_SYMBOL');


function Module(configuration: ModuleConfiguration) {
  console.log(configuration);
  return <T extends { new(...args: any[]): {} }>(constructor: T) => {
    console.log("Plugin found: " + configuration.name);
    Reflect.defineMetadata(TYPE_SYMBOL, SERVICE_TYPE.MODULE, constructor);
    Reflect.defineMetadata(CONFIGURATION_SYMBOL, configuration, constructor);
  }
}

function ApiService(path: string) {
  return <T extends { new(...args: any[]): {} }>(constructor: T) => {
    Reflect.defineMetadata(TYPE_SYMBOL, SERVICE_TYPE.API, constructor);
  }
}

function get(path: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const type = Reflect.getMetadata(TYPE_SYMBOL, target);
    if(type && type !== SERVICE_TYPE.API){
      throw new Error("@get decorator can only be used with ApiService");
    }
  };
}

export {
  TYPE_SYMBOL,
  CONFIGURATION_SYMBOL,
  Module,
  ApiService,
  get
}
