import {expect} from "chai";
import {api, assertType, data, del, get, handler, injectable, module, post, put, render} from "../src/decorators";
import * as sinon from "sinon";
import {IOC} from "../src/ioc";
import * as faker from "faker";
import {META_TYPES, SERVICE_TYPE} from "../src/enums";

const sandbox = sinon.createSandbox();

let IOCMock: sinon.SinonMock;

describe('[decorators.ts]', () => {
  afterEach(() => {
    sandbox.verifyAndRestore()
  });

  beforeEach(() => {
    IOCMock = sandbox.mock(IOC);
  });

  const createClass = () => class Main {
  };

  it('should mark class as injectable and register to IOC', () => {
    // Arrange
    const ctor = createClass();
    IOCMock.expects('register').withExactArgs(ctor).once();

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

  it('should throw error if fragment name not provided', () => {
    // Arrange
    const test = () => {
      // @ts-ignore
      @data()
      class FragmentData {
      }
    };

    // Assert
    expect(test).to.throw('Fragment name must be provided');
  });

  it('should throw error if data handler not set', () => {
    // Arrange
    const fragmentName = faker.random.word();

    // Act
    const test = () => {
      // @ts-ignore
      @data(fragmentName)
      class FragmentData {
      }
    };

    // Assert
    expect(test).to.throw('@handler decorator not added to data service');
  });

  it('should mark class dataService', () => {
    // Arrange
    const fragmentName = faker.random.word();
    const stub = sandbox.stub(IOC, 'register');

    // Act
    @data(fragmentName)
    class FragmentData {
      @handler
      handler() {
      }
    }


    // Assert
    const meta = Reflect.getMetadata(META_TYPES.TYPE, FragmentData);
    const metaFragment = Reflect.getMetadata(META_TYPES.FRAGMENT, FragmentData);
    expect(meta).to.eq(SERVICE_TYPE.DATA_PROVIDER);
    expect(metaFragment).to.eq(fragmentName);
    expect(stub.calledWithExactly(FragmentData)).to.eq(true);
  });

  it('should mark class as renderService', () => {
    // Arrange
    const fragmentName = faker.random.word();
    const configuration = {
      workers: faker.random.number()
    };
    const stub = sandbox.stub(IOC, 'register');

    // Act
    @render(fragmentName, configuration)
    class FragmentRender {
      @handler
      render() {

      }
    }

    // Assert
    const meta = Reflect.getMetadata(META_TYPES.TYPE, FragmentRender);
    const metaFragment = Reflect.getMetadata(META_TYPES.FRAGMENT, FragmentRender);
    const metaFile = Reflect.getMetadata(META_TYPES.FILE_PATH, FragmentRender);
    const metaConfiguration = Reflect.getMetadata(META_TYPES.CONFIGURATION, FragmentRender);
    expect(meta).to.eq(SERVICE_TYPE.RENDER_ENGINE);
    expect(metaFragment).to.eq(fragmentName);
    expect(metaFile).to.eq(__filename);
    expect(metaConfiguration).to.eq(configuration);
    expect(stub.calledWithExactly(FragmentRender)).to.eq(true);
  });

  it('should throw error if render handler not registered', () => {
    // Arrange
    const fragmentName = faker.random.word();
    const configuration = {
      workers: faker.random.number()
    };

    // Act
    const test = () => {
      @render(fragmentName, configuration)
      class FragmentRender {

      }
    };

    // Assert
    expect(test).to.throw('@handler decorator not added to render service')
  });

  it('should throw error if render fragment name not provided', () => {
    // Act
    const test = () => {
      // @ts-ignore
      @render()
      class FragmentData {
      }
    };

    // Assert
    expect(test).to.throw('Fragment name must be provided');
  });

  it('should add handler method to class meta', () => {
    // Arrange
    const fragmentName = faker.random.word();

    // Act
    @render(fragmentName)
    class FragmentRender {
      @handler
      render() {

      }
    }

    // Assert
    const handlerMeta = Reflect.getMetadata(META_TYPES.HANDLER, FragmentRender);
    expect(handlerMeta).to.eq('render');
  });

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
    const error = faker.random.word();


    class AnyClass {

    }

    Reflect.defineMetadata(META_TYPES.TYPE, SERVICE_TYPE.API, AnyClass);

    // Act
    const test = () => {
      assertType(AnyClass, type, error);
    };

    // Assert
    expect(test).to.throw(error);
  });
});
