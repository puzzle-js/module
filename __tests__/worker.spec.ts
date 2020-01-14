import * as sinon from "sinon";
import * as faker from "faker";
import {expect} from "chai";
import {WorkerThread} from "../src/worker";
import {IOC} from "../src/ioc";

const sandbox = sinon.createSandbox();
let workerThread: WorkerThread;

const service = {
  handler: () => {
    throw new Error('Mocked method call');
  },
  error: () => {
    throw new Error('Mocked method call');
  }
};

const workerData = {
  decoratedFile: 'fs',
  serviceName: 'readFile',
  handler: 'handler',
  errorHandler: 'error'
};

let serviceMock: sinon.SinonMock;
let iocMock: sinon.SinonMock;

describe('[worker.ts]', () => {
  const createPortMock = () => {
    return {
      on: sandbox.stub()
    }
  };

  beforeEach(() => {
    serviceMock = sandbox.mock(service);
    iocMock = sandbox.mock(IOC);
    iocMock.expects('get').returns(service);

    workerThread = new WorkerThread(createPortMock(), workerData);
  });

  afterEach(() => {
    sandbox.verifyAndRestore();
  });

  it('should create new WorkerThread', () => {
    // Arrange
    iocMock.expects('get').returns(service);
    const workerThread = new WorkerThread(createPortMock(), workerData);

    // Assert
    expect(workerThread).to.be.instanceOf(WorkerThread);
  });
});
