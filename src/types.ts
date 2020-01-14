import {Schema} from "fast-json-stringify";

type constructor = new(...args: any[]) => any;

type HTTP_METHODS = 'get' | 'post' | 'delete' | 'put';

type Stringifier = (doc: object | any[] | string | number | boolean | null) => string;

interface ModuleConfiguration {
  name: string;
  bootstrap: Array<constructor>;
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

type ParsableParamsObject =  {
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

type RenderResponse = {
  [key: string]: string | number;
  main: string;
};

interface EndpointOptions {
  schema?: Schema;
}

interface WorkerProps {
  decoratedFile: string,
  serviceName: string,
  handler: string,
  errorHandler: string
}


export {
  WorkerProps,
  DataOptions,
  Stringifier,
  EndpointOptions,
  constructor,
  ApiHandler,
  DataRequest,
  DataResponse,
  RenderResponse,
  HTTP_METHODS,
  RenderOptions,
  ModuleConfiguration,
  ParsableParamsObject,
  ParsableParams
}
