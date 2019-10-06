import "reflect-metadata";
import {ApiHandler, constructor, HTTP_METHODS, ModuleConfiguration} from "./types";
import {SERVICE_TYPE, META_TYPES} from "./enums";
import {IOC} from "./ioc";


function module(configuration: ModuleConfiguration) {
  return <T extends { new(...args: any[]): {} }>(constructor: T) => {
    Reflect.defineMetadata(META_TYPES.TYPE, SERVICE_TYPE.MODULE, constructor);
    Reflect.defineMetadata(META_TYPES.CONFIGURATION, configuration, constructor);
  }
}

function  injectable<T extends { new(...args: any[]): {} }>(constructor: T) {
  Reflect.defineMetadata(META_TYPES.TYPE, SERVICE_TYPE.INJECTABLE, constructor);
  IOC.register(constructor);
}

function apiService(path: string) {
  if (!path) throw new Error('Api path must be provided');

  return <T extends { new(...args: any[]): {} }>(constructor: T) => {
    Reflect.defineMetadata(META_TYPES.TYPE, SERVICE_TYPE.API, constructor);
    Reflect.defineMetadata(META_TYPES.PATH, path, constructor);

    IOC.register(constructor);
  }
}

function dataService(fragment: string) {
  if (!fragment) throw new Error('Fragment name must be provided');

  return <T extends { new(...args: any[]): {} }>(constructor: T) => {
    Reflect.defineMetadata(META_TYPES.TYPE, SERVICE_TYPE.API, constructor);

    IOC.register(constructor);
  }
}

function get(path: string) {
  if (!path) throw new Error('Get path must be provided');

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const type = Reflect.getMetadata(META_TYPES.TYPE, target);
    if (type) assertType(target, SERVICE_TYPE.API, `Can't attach GET handler to non API type class`);

    addRouteType(target.constructor, path, propertyKey, 'get');
  };
}

function put(path: string) {
  if (!path) throw new Error('Put path must be provided');

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const type = Reflect.getMetadata(META_TYPES.TYPE, target);
    if (type) assertType(target, SERVICE_TYPE.API, `Can't attach PUT handler to non API type class`);

    addRouteType(target.constructor, path, propertyKey, 'put');
  };
}

function del(path: string) {
  if (!path) throw new Error('Del path must be provided');

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const type = Reflect.getMetadata(META_TYPES.TYPE, target);
    if (type) assertType(target, SERVICE_TYPE.API, `Can't attach DELETE handler to non API type class`);

    addRouteType(target.constructor, path, propertyKey, 'delete');
  };
}

function post(path: string) {
  if (!path) throw new Error('Post path must be provided');

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const type = Reflect.getMetadata(META_TYPES.TYPE, target);
    if (type) assertType(target, SERVICE_TYPE.API, `Can't attach POST handler to non API type class`);

    addRouteType(target.constructor, path, propertyKey, 'post');
  };
}

const assertType = (target: any, type: SERVICE_TYPE, error?: string) => {
  const attachedType = Reflect.getMetadata(META_TYPES.TYPE, target);
  if (attachedType !== type) {

    throw new Error(error || `Unexpected type ${attachedType} received, expected it to be ${type}`);
  }
};

const addRouteType = (target: constructor, path: string, handler: string, method: HTTP_METHODS) => {
  let handlers = Reflect.getMetadata(META_TYPES.API_HANDLERS, target) as ApiHandler[];
  if (!handlers) handlers = [];

  handlers.push({
    method,
    path,
    handler
  });

  Reflect.defineMetadata(META_TYPES.API_HANDLERS, handlers, target);
};

export {
  injectable,
  module,
  apiService,
  dataService,
  get,
  post,
  put,
  del,
  assertType
}
