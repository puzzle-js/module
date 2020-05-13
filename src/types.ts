import {ProcedureActionType, RENDER_TYPES} from "./enums";

// tslint:disable-next-line:no-any
type Constructor<T = unknown> = new(...args: any[]) => T;

type HTTP_METHODS = 'get' | 'post' | 'delete' | 'put';

type Stringifier = (doc: object | unknown[] | string | number | boolean | null) => string;

interface ModuleConfiguration {
  name: string;
  bootstrap: Constructor[];
  adaptor: Constructor<Adaptor>;
}

interface ApiHandler {
  handler: string;
  method: HTTP_METHODS;
  path: string;
}

interface WorkerOptions {
  workers?: number;
}

interface RenderOptions extends WorkerOptions {

}

type ParsableParams = 'string' | 'number' | 'boolean' | ParsableParamsObject;

interface ParsableParamsObject {
  [x: string]: ParsableParams;
}

type MapperTypes = 'query' | 'param' | 'body' | 'config' | 'header' | 'cookie';

interface MapperOptions {
  params: ParsableParamsObject;
  mapper: {
    [x: string]: MapperTypes | MapperTypes[];
  }
}

interface ApiOptions extends WorkerOptions, MapperOptions {

}

interface DataOptions extends WorkerOptions, MapperOptions {
  path: string;
}

interface DataRequest {
  params: Record<string, string>;
  body: Record<string, object>;
  query: Record<string, object>;
}

interface DataResponse {
  data?: object;
  $model?: Record<string, string>;
  $headers?: Record<string, string>;
  $status?: number;
}

interface RenderResponse {
  [key: string]: string | number;

  main: string;
}


interface WorkerProps {
  decoratedFile: string;
  serviceName: string;
}

interface WorkerMessage {
  handler: string;
  data: JSONValue;
}

type JSONPrimitive = string | number | boolean | null;
type JSONValue = JSONPrimitive | JSONObject | JSONArray;

interface JSONObject {
  [member: string]: JSONValue
}

interface JSONArray extends Array<JSONValue> {

}

interface Procedure {
  action: ProcedureActionType;
  api?: {
    base: string;
    endpoint: string;
  }
  params: Record<string, JSONValue | JSONObject | JSONArray>;
  version: string;
}

interface ProcedureResponse {
  fragment?: {
    meta: {
      statusCode: number,
      headers: Record<string, string>
    },
    html?: JSONObject;
  }
  api?: {
    data?: JSONValue,
    meta: {
      statusCode: number,
      headers: Record<string, string>
    }
  }
  __upgrade__version?: JSONObject;
}

type ProcedureCallback = (command: Procedure, responseHandler: (response: ProcedureResponse) => void) => Promise<void> | void;

interface Adaptor {
  init(cb: ProcedureCallback): Promise<void>;

  start(port: number): Promise<void>;
}

interface EndpointOptions {

}


export {
  WorkerProps,
  DataOptions,
  Stringifier,
  EndpointOptions,
  Constructor,
  ApiHandler,
  ApiOptions,
  DataRequest,
  DataResponse,
  WorkerMessage,
  RenderResponse,
  HTTP_METHODS,
  RenderOptions,
  ModuleConfiguration,
  ParsableParamsObject,
  ParsableParams,
  JSONPrimitive,
  JSONArray,
  JSONObject,
  JSONValue,
  Adaptor,
  Procedure,
  ProcedureResponse,
  ProcedureCallback
}
