import "reflect-metadata";
import {ApiHandler, constructor, HTTP_METHODS, ModuleConfiguration, RenderOptions} from "./types";
import {META_TYPES, SERVICE_TYPE} from "./enums";
import {IOC} from "./ioc";
import {getDecoratedFile} from "./helpers";


/**
 * @description Sets class as Base Module which will be bootstrapped by PuzzleJs
 * @param configuration
 */
function module(configuration: ModuleConfiguration) {
  return <T extends { new(...args: any[]): {} }>(constructor: T) => {
    Reflect.defineMetadata(META_TYPES.TYPE, SERVICE_TYPE.MODULE, constructor);
    Reflect.defineMetadata(META_TYPES.CONFIGURATION, configuration, constructor);
  }
}

/**
 * @description Makes class injectable
 * @param constructor
 */
function injectable<T extends { new(...args: any[]): {} }>(constructor: T) {
  Reflect.defineMetadata(META_TYPES.TYPE, SERVICE_TYPE.INJECTABLE, constructor);
  IOC.register(constructor);
}

/**
 * @description Sets class as api
 * @param path
 */
function api(path: string) {
  if (!path) throw new Error('Api path must be provided');

  return <T extends { new(...args: any[]): {} }>(constructor: T) => {
    Reflect.defineMetadata(META_TYPES.TYPE, SERVICE_TYPE.API, constructor);
    Reflect.defineMetadata(META_TYPES.PATH, path, constructor);

    IOC.register(constructor);
  }
}

/**
 * @description Sets class as data provider for fragment
 * @param fragment
 */
function data(fragment: string) {
  if (!fragment) throw new Error('Fragment name must be provided');

  return <T extends { new(...args: any[]): {} }>(constructor: T) => {
    Reflect.defineMetadata(META_TYPES.TYPE, SERVICE_TYPE.DATA_PROVIDER, constructor);
    Reflect.defineMetadata(META_TYPES.FRAGMENT, fragment, constructor);

    if (!Reflect.getMetadata(META_TYPES.HANDLER, constructor)) throw new Error(`@handler decorator not added to data service(${constructor.name}) handler method`);

    IOC.register(constructor);
  }
}

/**
 * @description Sets class as render provider for fragment
 * @param fragment
 * @param renderOptions
 */
function render(fragment: string, renderOptions?: RenderOptions) {
  if (!fragment) throw new Error('Fragment name must be provided');

  return <T extends { new(...args: any[]): {} }>(constructor: T) => {
    Reflect.defineMetadata(META_TYPES.TYPE, SERVICE_TYPE.RENDER_ENGINE, constructor);
    Reflect.defineMetadata(META_TYPES.FRAGMENT, fragment, constructor);
    Reflect.defineMetadata(META_TYPES.CONFIGURATION, renderOptions, constructor);
    Reflect.defineMetadata(META_TYPES.FILE_PATH, getDecoratedFile(), constructor);

    if (!Reflect.getMetadata(META_TYPES.HANDLER, constructor)) throw new Error(`@handler decorator not added to render service(${constructor.name}) handler method`);

    IOC.register(constructor);
  }
}

/**
 * @description Handler method for data or render service
 * @param target
 * @param propertyKey
 */
function handler(target: any, propertyKey: string) {
  Reflect.defineMetadata(META_TYPES.HANDLER, propertyKey, target.constructor);
}

/**
 * @description Sets method as http GET handler
 * @param path
 */
function get(path: string) {
  if (!path) throw new Error('Get path must be provided');

  return function (target: any, propertyKey: string) {
    addRouteType(target.constructor, path, propertyKey, 'get');
  };
}

/**
 * @description Sets method as http PUT handler
 * @param path
 */
function put(path: string) {
  if (!path) throw new Error('Put path must be provided');

  return function (target: any, propertyKey: string) {
    addRouteType(target.constructor, path, propertyKey, 'put');
  };
}

/**
 * @description Sets method as http DELETE handler
 * @param path
 */
function del(path: string) {
  if (!path) throw new Error('Del path must be provided');

  return function (target: any, propertyKey: string) {
    addRouteType(target.constructor, path, propertyKey, 'delete');
  };
}

/**
 * @description Sets method as http POST handler
 * @param path
 */
function post(path: string) {
  if (!path) throw new Error('Post path must be provided');

  return function (target: any, propertyKey: string) {
    addRouteType(target.constructor, path, propertyKey, 'post');
  };
}

/**
 * @description Checks if class is marked as type
 * @param target
 * @param type
 * @param error
 */
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
  render,
  handler,
  api,
  get,
  post,
  data,
  put,
  del,
  assertType
}
