import {expect} from "chai";
import {injectable} from "../src/decorators";
import sinon from "sinon";
import {IOC} from "../src/ioc";
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
});
