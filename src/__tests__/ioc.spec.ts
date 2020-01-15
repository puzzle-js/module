import * as sinon from "sinon";
import {expect} from "chai";
import {IOC} from "../ioc";
import {injectable} from "../decorators";

const sandbox = sinon.createSandbox();
let ioc: IOC;


describe('[ioc.ts]', () => {
  beforeEach(() => {
    ioc = new IOC()
  });

  afterEach(() => {
    IOC.clear();
    sandbox.verifyAndRestore();
  });

  const createClass = () => class Main {
  };

  it('should create new IOC', () => {
    // Arrange
    const ioc = new IOC();

    // Assert
    expect(ioc).to.be.instanceOf(IOC);
  });

  it('should clear IOC registries', () => {
    // Arrange
    const ctor = createClass();

    IOC.register(ctor);

    // Act
    IOC.clear();

    // Assert
    expect(IOC.IOC_REGISTRIES.size).to.eq(0);
  });

  it('should register IOC class', () => {
    // Arrange
    const ctor = createClass();


    // Act
    IOC.register(ctor);

    // Assert
    expect(IOC.IOC_REGISTRIES.get(ctor.name)).to.deep.eq({
      ctor
    });
  });

  it('should get instance of class without dependencies', () => {
    // Arrange
    const ctor = createClass();

    IOC.register(ctor);

    // Act
    const instance = IOC.get(ctor);

    // Assert
    expect(instance).to.be.instanceOf(ctor);
  });

  it('should throw error if class is not registered', () => {
    // Arrange
    const ctor = createClass();

    // Act
    const test = () => {
      IOC.get(ctor);
    };

    // Assert
    expect(test).to.throw(`${ctor.name} is not marked as injectable`);
  });

  it('should return same instance if the class instance generated before', () => {
    // Arrange
    const ctor = createClass();

    IOC.register(ctor);
    // Act
    const instance1 = IOC.get(ctor);
    const instance2 = IOC.get(ctor);

    // Assert
    expect(instance1).to.eq(instance2);
  });

  it('should return instance with dependencies injected', () => {
    // Arrange
    @injectable //Required for reflection
    class Dependency {

    }

    @injectable //Required for reflection
    class Main {
      constructor(public dep: Dependency) {
      }
    }

    // Act
    const mainInstance = IOC.get<Main>(Main);

    // Assert
    expect(mainInstance).to.be.instanceOf(Main);
    expect(mainInstance.dep).to.be.instanceOf(Dependency);
  });

  it('should return instance with dependencies injected with deeper injection', () => {
    // Arrange
    @injectable //Required for reflection
    class Dependency2 {

    }

    @injectable //Required for reflection
    class Dependency {
      constructor(public dep: Dependency2) {

      }
    }

    @injectable //Required for reflection
    class Main {
      constructor(public dep: Dependency) {
      }
    }

    // Act
    const mainInstance = IOC.get<Main>(Main);

    // Assert
    expect(mainInstance).to.be.instanceOf(Main);
    expect(mainInstance.dep).to.be.instanceOf(Dependency);
    expect(mainInstance.dep.dep).to.be.instanceOf(Dependency2);
  });
});
