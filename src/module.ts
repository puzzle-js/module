import "reflect-metadata";
import {assertType} from "./decorators";
import {API_PREFIX, DEVELOPMENT_PORT, META_TYPES, SERVICE_TYPE} from "./enums";
import {ApiHandler, constructor, ModuleConfiguration, Stringifier} from "./types";
import path from "path";
import {IOC} from "./ioc";
import {Fragment} from "./fragment";
import {detectDevelopmentMode} from "./helpers";
import {Server} from "./server";
import {Router} from "./router";


class Module {
  private fragment!: Fragment;
  private router: Router;
  private developmentModeEnabled = detectDevelopmentMode();

  constructor(
    router: Router
  ) {
    this.developmentMode();

    this.router = router;
  }

  public async init() {
    assertType(this.constructor, SERVICE_TYPE.MODULE);

    await this.onBeforeInit();
    const configuration = Reflect.getMetadata(META_TYPES.CONFIGURATION, this.constructor) as ModuleConfiguration;

    configuration.bootstrap.forEach(service => this.registerModules(service));

    this.connectFragmentToRouter();
    this.connectConfiguration();
  }

  public getConfiguration() {
    return {
      params: this.fragment.params
    };
  }

  async onBeforeInit(): Promise<any> {
    return;
  }

  private developmentMode() {
    if (this.developmentModeEnabled) {
      console.info('Development mode enabled, starting module in preview mode');

      this
        .init()
        .then(() => {
          const server = new Server(this.router.lookup.bind(this.router), {port: process.env.PORT ? +process.env.PORT : DEVELOPMENT_PORT});
          console.log(this.router.prettyPrint());
          server.listen(() => {
            console.log(`Server started listening on port ${DEVELOPMENT_PORT}`);
          });
        });
    }
  }

  private registerModules(service: constructor) {
    const type = Reflect.getMetadata(META_TYPES.TYPE, service);

    switch (type) {
      case SERVICE_TYPE.API:
        this.connectApi(service);
        break;
      case SERVICE_TYPE.DATA_PROVIDER:
      case SERVICE_TYPE.RENDER_ENGINE:
        this.connectFragmentService(service, type);
        break;
    }
  }

  private connectApi(service: constructor) {
    const handlers = Reflect.getMetadata(META_TYPES.API_HANDLERS, service) as ApiHandler[];
    const pathPrefix = Reflect.getMetadata(META_TYPES.PATH, service);

    const apiInstance = IOC.get(service) as any;

    handlers.forEach(apiHandler => {
      this.router[apiHandler.method](path.join(API_PREFIX, pathPrefix, apiHandler.path), this.handleApiResponse.bind(this, apiInstance, apiHandler));
    });
  };

  private handleApiResponse(instance: any, handlerMeta: ApiHandler, request: any, response: any) {
    let data = instance[handlerMeta.handler](request);

    if (typeof data.then === 'function') {
      data.then((resolved: any) => {
        response.end(this.mapResponseToHTTP(resolved, handlerMeta.stringifier))
      });
    } else {
      response.end(this.mapResponseToHTTP(data, handlerMeta.stringifier))
    }
  }

  private mapResponseToHTTP(data: any, stringifier?: Stringifier) {
    if (typeof data === 'object') {
      return stringifier ? stringifier(data) : JSON.stringify(data);
    } else {
      data.toString();
    }
  }

  private connectFragmentService(service: constructor, type: SERVICE_TYPE) {
    let fragment = this.fragment;
    if (!fragment) fragment = new Fragment();

    if (type === SERVICE_TYPE.DATA_PROVIDER) {
      fragment.setService(service);
    } else if (type === SERVICE_TYPE.RENDER_ENGINE) {
      fragment.setService(service);
    }

    this.fragment = fragment;
  }

  private connectFragmentToRouter() {
    this.fragment.validate();
    this.router.post('/fragment', (req, res) => {
      if (req.headers.version !== '2') {
        res.statusCode = 422;
        res.setHeader('content-type', 'application/json');
        res.setHeader('version', '2');
        res.end(JSON.stringify(this.getConfiguration()));
      } else {
        res.setHeader('content-type', 'application/json');
        this.fragment.render(req, res);
      }
    });
  }

  private connectConfiguration() {
    this.router.get('/__/configuration', (req, res) => {
      res.end(JSON.stringify(this.getConfiguration()));
    });
  }
}

export {
  Module
}

