import {Schema} from "fast-json-stringify";
import {ProcedureActionType} from "./enums";

// tslint:disable-next-line:no-any
type Constructor<T = unknown> = new(...args: any[]) => T;

type HTTP_METHODS = 'get' | 'post' | 'delete' | 'put';

type Stringifier = (doc: object | unknown[] | string | number | boolean | null) => string;

interface ModuleConfiguration {
  name: string;
  bootstrap: Constructor[];
}

interface ApiHandler {
  handler: string;
  method: HTTP_METHODS;
  path: string;
  stringifier?: Stringifier;
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

interface DataOptions extends WorkerOptions {
  params: ParsableParamsObject;
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

interface EndpointOptions {
  schema?: Schema;
}

interface WorkerProps {
  decoratedFile: string,
  serviceName: string,
  handler: string,
  errorHandler: string
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
  command: string;
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

  start(): Promise<void>;
}


export {
  WorkerProps,
  DataOptions,
  Stringifier,
  EndpointOptions,
  Constructor,
  ApiHandler,
  DataRequest,
  DataResponse,
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
