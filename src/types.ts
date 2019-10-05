type constructor = new(...args: any[]) => any;

type HTTP_METHODS = 'get' | 'post' | 'delete' | 'put';

interface ModuleConfiguration {
  name: string;
  bootstrap: Array<constructor>;
}

interface ApiHandler {
  handler: string;
  method: HTTP_METHODS;
  path: string;
}

interface ApiConfiguration {

}


export {
  constructor,
  ApiHandler,
  HTTP_METHODS,
  ApiConfiguration,
  ModuleConfiguration
}
