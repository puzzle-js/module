type constructor = new(...args: any[]) => any;

type HTTP_METHODS = 'get' | 'post' | 'delete' | 'put';

type FRAGMENT_SERVICE = {
  data?: any;
  render?: any;
};

interface ModuleConfiguration {
  name: string;
  bootstrap: Array<constructor>;
}

interface ApiHandler {
  handler: string;
  method: HTTP_METHODS;
  path: string;
}

interface RenderOptions {
  workers?: number;
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
  [key: string]: string;
  main: string;
};


export {
  constructor,
  ApiHandler,
  DataRequest,
  DataResponse,
  RenderResponse,
  HTTP_METHODS,
  RenderOptions,
  FRAGMENT_SERVICE,
  ModuleConfiguration
}
