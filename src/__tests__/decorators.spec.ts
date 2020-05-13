import {expect} from "chai";
import {
  api,
  assertType,
  del,
  error,
  get,
  fragment,
  handler,
  injectable,
  module,
  partials,
  post,
  put,
} from "../decorators";
import * as sinon from "sinon";
import {IOC} from "../ioc";
import * as faker from "faker";
import {META_TYPES, SERVICE_TYPE} from "../enums";
import {Adaptor, ApiHandler, Constructor} from "../types";


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
      bootstrap: [],
      adaptor: sandbox.stub() as unknown as Constructor<Adaptor>
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
      @fragment()
      class FragmentData {
      }
    };

    // Assert
    expect(test).to.throw('@handler decorator not added to fragment');
  });

  it('should mark class fragment', () => {
    // Arrange
    const stub = sandbox.stub(IOC, 'register');

    // Act
    @fragment({
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
    expect(meta).to.eq(SERVICE_TYPE.FRAGMENT);
    expect(stub.calledWithExactly(FragmentData)).to.eq(true);
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
          @del(endpoint, {})
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
          @put(endpoint, {})
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
          @post(endpoint, {})
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
          @get(endpoint, {})
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


  it('should ', () => {
    // Arrange


    // Act


    // Assert
  });
})
;
