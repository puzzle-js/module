import {expect} from "chai";
import {
  api,
  assertType,
  data,
  del,
  error,
  get,
  handler,
  injectable,
  module,
  partials,
  post,
  put,
  render
} from "../decorators";
import * as sinon from "sinon";
import {IOC} from "../ioc";
import * as faker from "faker";
import {META_TYPES, SERVICE_TYPE} from "../enums";
import {ApiHandler} from "../types";


const sandbox = sinon.createSandbox();

let iocMock: sinon.SinonMock;

describe('[decorators.ts]', () => {
  afterEach(() => {
    sandbox.verifyAndRestore()
  });

  beforeEach(() => {
    iocMock = sandbox.mock(IOC);
  });

  const createClass = () => class Main {
  };

  it('should mark class as injectable and register to IOC', () => {
    // Arrange
    const ctor = createClass();
    iocMock.expects('register').withExactArgs(ctor).once();

    // Act
    injectable(ctor);

    // Assert
    const meta = Reflect.getMetadata(META_TYPES.TYPE, ctor);
    expect(meta).to.eq(SERVICE_TYPE.INJECTABLE);
  });

  it('should mark class as Module', () => {
    // Arrange
    const configuration = {
      name: faker.random.word(),
      bootstrap: []
    };

    // Act
    @module(configuration)
    class App {
    }


    // Assert
    const meta = Reflect.getMetadata(META_TYPES.TYPE, App);
    const metaConfiguration = Reflect.getMetadata(META_TYPES.CONFIGURATION, App);
    expect(meta).to.eq(SERVICE_TYPE.MODULE);
    expect(metaConfiguration).to.eq(configuration);
  });

  it('should mark class as apiService', () => {
    // Arrange
    const path = faker.random.word();
    const stub = sandbox.stub(IOC, 'register');

    // Act
    @api(path)
    class Api {
    }


    // Assert
    const meta = Reflect.getMetadata(META_TYPES.TYPE, Api);
    const metaPath = Reflect.getMetadata(META_TYPES.PATH, Api);
    expect(meta).to.eq(SERVICE_TYPE.API);
    expect(metaPath).to.eq(path);
    expect(stub.calledWithExactly(Api)).to.eq(true);
  });

  it('should throw error if service path prefix not provided', () => {
    // Arrange
    const test = () => {
      // @ts-ignore
      @api()
      class Api {
      }
    };

    // Assert
    expect(test).to.throw('Api path must be provided');
  });


  it('should throw error if data handler not set', () => {
    // Act
    const test = () => {
      // @ts-ignore
      @data()
      class FragmentData {
      }
    };

    // Assert
    expect(test).to.throw('@handler decorator not added to data service');
  });

  it('should mark class dataService', () => {
    // Arrange
    const stub = sandbox.stub(IOC, 'register');

    // Act
    @data({
      path: '',
      mapper: {},
      params: {}
    })
    class FragmentData {
      @handler
      handler() {
      }
    }


    // Assert
    const meta = Reflect.getMetadata(META_TYPES.TYPE, FragmentData);
    expect(meta).to.eq(SERVICE_TYPE.DATA_PROVIDER);
    expect(stub.calledWithExactly(FragmentData)).to.eq(true);
  });

  it('should mark class as renderService', () => {
    // Arrange
    const configuration = {
      workers: faker.random.number()
    };
    const stub = sandbox.stub(IOC, 'register');

    // Act
    @render(configuration)
    class FragmentRender {
      @handler
      render() {

      }
    }

    // Assert
    const meta = Reflect.getMetadata(META_TYPES.TYPE, FragmentRender);
    const metaFile = Reflect.getMetadata(META_TYPES.FILE_PATH, FragmentRender);
    const metaConfiguration = Reflect.getMetadata(META_TYPES.CONFIGURATION, FragmentRender);
    expect(meta).to.eq(SERVICE_TYPE.RENDER_ENGINE);
    expect(metaFile).to.eq(__filename);
    expect(metaConfiguration).to.eq(configuration);
    expect(stub.calledWithExactly(FragmentRender)).to.eq(true);
  });

  it('should throw error if render handler not registered', () => {
    // Arrange
    const configuration = {
      workers: faker.random.number()
    };

    // Act
    const test = () => {
      @render(configuration)
      class FragmentRender {

      }
    };

    // Assert
    expect(test).to.throw('@handler decorator not added to render service')
  });


  it('should add handler method to class meta', () => {
    // Act
    @render()
    class FragmentRender {
      @handler
      render() {

      }
    }

    // Assert
    const handlerMeta = Reflect.getMetadata(META_TYPES.HANDLER, FragmentRender);
    expect(handlerMeta).to.eq('render');
  });

  it('should add partials to render', () => {
    // Arrange
    const partial = faker.random.word();

    // Act
    @render()
    class FragmentRender {
      @handler
      @partials(['main', partial])
      render() {

      }
    }

    // Assert
    const handlerMeta = Reflect.getMetadata(META_TYPES.RENDER_PARTIALS, FragmentRender);
    expect(handlerMeta).to.deep.eq(['main', partial]);
  });

  it('should add error handler to service', () => {
    // Act
    @render()
    class FragmentRender {
      @handler
      render() {

      }

      @error
      error() {

      }
    }

    // Assert
    const handlerMeta = Reflect.getMetadata(META_TYPES.ERROR_HANDLER, FragmentRender);
    expect(handlerMeta).to.eq('error');
  });

  describe("Api meta decorators", () => {
    describe("delete", () => {
      it('should add delete route to api', () => {
        // Arrange
        const path = faker.random.word();
        const endpoint = faker.random.word();

        // Act
        @api(path)
        class Api {
          @del(endpoint)
          del() {

          }
        }

        // Assert
        const metaType = Reflect.getMetadata(META_TYPES.TYPE, Api);
        expect(metaType).to.eq(SERVICE_TYPE.API);
        const metaHandlers = Reflect.getMetadata(META_TYPES.API_HANDLERS, Api);
        expect(metaHandlers).to.deep.eq([
          {
            method: 'delete',
            path: endpoint,
            handler: 'del'
          }
        ])
      });

      it('should throw error when path not provided', () => {
        // Arrange
        const path = faker.random.word();

        // Act
        const test = () => {
          @api(path)
          class Api {
            @(del as any)()
            del() {

            }
          }
        };

        // Assert
        expect(test).to.throw('Del path must be provided');
      });
    });

    describe('put', () => {
      it('should add put route to api', () => {
        // Arrange
        const path = faker.random.word();
        const endpoint = faker.random.word();

        // Act
        @api(path)
        class Api {
          @put(endpoint)
          put() {

          }
        }

        // Assert
        const metaType = Reflect.getMetadata(META_TYPES.TYPE, Api);
        expect(metaType).to.eq(SERVICE_TYPE.API);
        const metaHandlers = Reflect.getMetadata(META_TYPES.API_HANDLERS, Api);
        expect(metaHandlers).to.deep.eq([
          {
            method: 'put',
            path: endpoint,
            handler: 'put'
          }
        ])
      });

      it('should throw error when path not provided', () => {
        // Arrange
        const path = faker.random.word();

        // Act
        const test = () => {
          @api(path)
          class Api {
            @(put as any)()
            put() {

            }
          }
        };

        // Assert
        expect(test).to.throw('Put path must be provided')
      });
    });

    describe('post', () => {
      it('should add post route to api', () => {
        // Arrange
        const path = faker.random.word();
        const endpoint = faker.random.word();

        // Act
        @api(path)
        class Api {
          @post(endpoint)
          post() {

          }
        }

        // Assert
        const metaType = Reflect.getMetadata(META_TYPES.TYPE, Api);
        expect(metaType).to.eq(SERVICE_TYPE.API);
        const metaHandlers = Reflect.getMetadata(META_TYPES.API_HANDLERS, Api);
        expect(metaHandlers).to.deep.eq([
          {
            method: 'post',
            path: endpoint,
            handler: 'post'
          }
        ])
      });


      it('should throw error when path not provided', () => {
        // Arrange
        const path = faker.random.word();

        // Act
        const test = () => {
          @api(path)
          class Api {
            @(post as any)()
            post() {

            }
          }
        };

        // Assert
        expect(test).to.throw('Post path must be provided')
      });
    });

    describe('get', () => {
      it('should add get route to api', () => {
        // Arrange
        const path = faker.random.word();
        const endpoint = faker.random.word();

        // Act
        @api(path)
        class Api {
          @get(endpoint)
          getMethod() {

          }
        }

        // Assert
        const metaType = Reflect.getMetadata(META_TYPES.TYPE, Api);
        expect(metaType).to.eq(SERVICE_TYPE.API);
        const metaHandlers = Reflect.getMetadata(META_TYPES.API_HANDLERS, Api);
        expect(metaHandlers).to.deep.eq([
          {
            method: 'get',
            path: endpoint,
            handler: 'getMethod'
          }
        ])
      });


      it('should throw error when path not provided', () => {
        // Arrange
        const path = faker.random.word();

        // Act
        const test = () => {
          @api(path)
          class Api {
            @(get as any)()
            getMethod() {

            }
          }
        };

        // Assert
        expect(test).to.throw('Get path must be provided');
      });
    })
  });

  it('should assert given constructor meta type', () => {
    // Arrange
    const type = SERVICE_TYPE.INJECTABLE;


    class AnyClass {

    }

    Reflect.defineMetadata(META_TYPES.TYPE, type, AnyClass);

    // Act
    assertType(AnyClass, type, 'Custom Error');
  });

  it('should assert given constructor meta type with throwing custom error', () => {
    // Arrange
    const type = SERVICE_TYPE.INJECTABLE;


    class AnyClass {

    }

    Reflect.defineMetadata(META_TYPES.TYPE, SERVICE_TYPE.API, AnyClass);

    // Act
    const test = () => {
      assertType(AnyClass, type);
    };

    // Assert
    expect(test).to.throw();
  });

  it('should set schema for the route', () => {
    // Arrange
    const path = faker.random.word();
    const endpoint = faker.random.word();

    // Act
    @api(path)
    class Api {
      @post(endpoint, {
        schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            }
          }
        }
      })
      post() {

      }
    }


    // Assert
    const metaType = Reflect.getMetadata(META_TYPES.TYPE, Api);
    expect(metaType).to.eq(SERVICE_TYPE.API);
    const metaHandlers = Reflect.getMetadata(META_TYPES.API_HANDLERS, Api) as ApiHandler[];
    expect(metaHandlers[0].stringifier).to.be.a('function');
  });

  it('should ', () => {
    // Arrange


    // Act


    // Assert
  });
})
;
