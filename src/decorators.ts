import "reflect-metadata";
import {
  ApiHandler,
  Constructor,
  DataOptions,
  EndpointOptions,
  HTTP_METHODS,
  ModuleConfiguration,
  RenderOptions
} from "./types";
import {META_TYPES, SERVICE_TYPE} from "./enums";
import {IOC} from "./ioc";
import {getDecoratedFile} from "./helpers";
import fastJsonStringify from "fast-json-stringify";

/**
 * @description Sets class as Base Module which will be bootstrapped
 * @param configuration
 */
function module(configuration: ModuleConfiguration) {
  return <T extends { new(...args: unknown[]): {} }>(constructor: T) => {
    Reflect.defineMetadata(META_TYPES.TYPE, SERVICE_TYPE.MODULE, constructor);
    Reflect.defineMetadata(META_TYPES.CONFIGURATION, configuration, constructor);
  }
}

/**
 * @description Makes class injectable
 * @param constructor
 */
// tslint:disable-next-line:no-any
function injectable<T extends Constructor>(constructor: T) {
  Reflect.defineMetadata(META_TYPES.TYPE, SERVICE_TYPE.INJECTABLE, constructor);
  IOC.register(constructor);
}

/**
 * @description Sets class as api
 * @param path
 */
function api(path: string) {
  if (!path) throw new Error('Api path must be provided');

  return <T extends { new(...args: unknown[]): {} }>(constructor: T) => {
    Reflect.defineMetadata(META_TYPES.TYPE, SERVICE_TYPE.API, constructor);
    Reflect.defineMetadata(META_TYPES.PATH, path, constructor);

    IOC.register(constructor);
  }
}

/**
 * @description Sets class as data provider for fragment
 * @param dataOptions
 */
function data(dataOptions: DataOptions) {
  return <T extends { new(...args: unknown[]): {} }>(constructor: T) => {
    Reflect.defineMetadata(META_TYPES.TYPE, SERVICE_TYPE.DATA_PROVIDER, constructor);
    Reflect.defineMetadata(META_TYPES.CONFIGURATION, dataOptions || {}, constructor);
    Reflect.defineMetadata(META_TYPES.FILE_PATH, getDecoratedFile(), constructor);


    if (!Reflect.getMetadata(META_TYPES.HANDLER, constructor)) throw new Error(`@handler decorator not added to data service(${constructor.name}) handler method`);

    if (JSON.stringify(Object.keys(dataOptions.mapper).sort()) !== JSON.stringify(Object.keys(dataOptions.params).sort())) {
      throw new Error(`@data params and mapper is not matching for service(${constructor.name})`);
    }

    IOC.register(constructor);
  }
}

/**
 * @description Sets class as render provider for fragment
 * @param renderOptions
 */
function render(renderOptions?: RenderOptions) {
  return <T extends { new(...args: unknown[]): {} }>(constructor: T) => {
    Reflect.defineMetadata(META_TYPES.TYPE, SERVICE_TYPE.RENDER_ENGINE, constructor);
    Reflect.defineMetadata(META_TYPES.CONFIGURATION, renderOptions || {}, constructor);
    Reflect.defineMetadata(META_TYPES.FILE_PATH, getDecoratedFile(), constructor);

    if (!Reflect.getMetadata(META_TYPES.HANDLER, constructor)) throw new Error(`@handler decorator not added to render service(${constructor.name}) handler method`);

    IOC.register(constructor);
  }
}

/**
 * Sets error handler for fragments
 */
function error(target: {}, propertyKey: string) {
  Reflect.defineMetadata(META_TYPES.ERROR_HANDLER, propertyKey, target.constructor);
}

/**
 * Exposes fragment partials from render process
 * @param partials
 */
function partials(partials: string[]) {
  return (target: object, propertyKey: string) => {
    console.log(propertyKey);
    Reflect.defineMetadata(META_TYPES.RENDER_PARTIALS, partials, target.constructor);

  };
}

/**
 * @description Handler method for data or render service
 * @param target
 * @param propertyKey
 */
function handler(target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
  Reflect.defineMetadata(META_TYPES.HANDLER, propertyKey, target.constructor);

  console.log(descriptor.value.arg);
}

/**
 * @description Sets method as http GET handler
 * @param path
 * @param options
 */

function get(path: string, options?: EndpointOptions) {
  if (!path) throw new Error('Get path must be provided');

  return (target: object, propertyKey: string) => {
    addRouteType(target.constructor, path, propertyKey, 'get', options);
  };
}

/**
 * @description Sets method as http PUT handler
 * @param path
 * @param options
 */
function put(path: string, options?: EndpointOptions) {
  if (!path) throw new Error('Put path must be provided');

  return (target: object, propertyKey: string) => {
    addRouteType(target.constructor, path, propertyKey, 'put', options);
  };
}

/**
 * @description Sets method as http DELETE handler
 * @param path
 * @param options
 */
function del(path: string, options?: EndpointOptions) {
  if (!path) throw new Error('Del path must be provided');

  return (target: object, propertyKey: string) => {
    addRouteType(target.constructor, path, propertyKey, 'delete', options);
  };
}

/**
 * @description Sets method as http POST handler
 * @param path
 * @param options
 */
function post(path: string, options?: EndpointOptions) {
  if (!path) throw new Error('Post path must be provided');

  return (target: object, propertyKey: string) => {
    addRouteType(target.constructor, path, propertyKey, 'post', options);
  };
}

/**
 * @description Checks if class is marked as type
 * @param target
 * @param type
 * @param error
 */
const assertType = (target: object, type: SERVICE_TYPE, error?: string) => {
  const attachedType = Reflect.getMetadata(META_TYPES.TYPE, target);
  if (attachedType !== type) {
    throw new Error(error || `Unexpected type ${attachedType} received, expected it to be ${type}`);
  }
};


const addRouteType = (target: object, path: string, handler: string, method: HTTP_METHODS, options?: EndpointOptions) => {
  const handlers = Reflect.getMetadata(META_TYPES.API_HANDLERS, target) as ApiHandler[] || [];

  const handlerMeta = {
    method,
    path,
    handler
  } as ApiHandler;

  if (options && options.schema) {
    handlerMeta.stringifier = fastJsonStringify(options.schema);
  }

  handlers.push(handlerMeta);

  Reflect.defineMetadata(META_TYPES.API_HANDLERS, handlers, target);
};

export {
  partials,
  injectable,
  module,
  error,
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
