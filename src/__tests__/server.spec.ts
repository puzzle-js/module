import * as sinon from "sinon";
import * as faker from "faker";
import {expect} from "chai";
import {HttpServer} from "../adaptors/http-server";
import http from "http";
import {DEVELOPMENT_PORT} from "../enums";

const sandbox = sinon.createSandbox();
let server: HttpServer;

describe('[httpServer.ts]', () => {
  beforeEach(() => {
    server = new HttpServer()
  });

  afterEach(() => {
    sandbox.verifyAndRestore();
  });

  it('should create new HttpServer', () => {
    // Arrange
    const server = new HttpServer();

    // Assert
    expect(server).to.be.instanceOf(HttpServer);
  });

  it('should create with custom options', () => {
    // Arrange
    const options = {
      port: faker.random.number()
    };
    const handler = sandbox.stub();
    const instance = {
      listen: sandbox.stub()
    };
    const createServerStub = sandbox.stub(http, 'createServer').returns(instance as any);
    const server = new HttpServer(options);

    // Act
    server.listen(handler);

    // Assert
    expect(createServerStub.calledWithExactly(handler as any)).to.eq(true);
    expect(instance.listen.calledWithExactly(options.port, undefined)).to.eq(true);
  });

  it('should create with default port', () => {
    // Arrange
    const handler = sandbox.stub();
    const instance = {
      listen: sandbox.stub()
    };
    const createServerStub = sandbox.stub(http, 'createServer').returns(instance as any);
    const server = new HttpServer();

    // Act
    server.listen(handler);

    // Assert
    expect(createServerStub.calledWithExactly(handler as any)).to.eq(true);
    expect(instance.listen.calledWithExactly(DEVELOPMENT_PORT, undefined)).to.eq(true);
  });


  it('should create with environment port', () => {
    // Arrange
    const handler = sandbox.stub();
    const instance = {
      listen: sandbox.stub()
    };
    const port = faker.random.number();

    const createServerStub = sandbox.stub(http, 'createServer').returns(instance as any);


    // Act
    process.env.PORT = port.toString();
    const server = new HttpServer();
    delete process.env.PORT;
    server.listen(handler);

    // Assert
    expect(createServerStub.calledWithExactly(handler as any)).to.eq(true);
    expect(instance.listen.calledWithExactly(port, undefined)).to.eq(true);
  });

  it('should create with custom options with hostname', () => {
    // Arrange
    const options = {
      port: faker.random.number(),
      hostname: faker.random.word()
    };
    const handler = sandbox.stub();
    const instance = {
      listen: sandbox.stub()
    };
    const createServerStub = sandbox.stub(http, 'createServer').returns(instance as any);
    const server = new HttpServer(options);

    // Act
    server.listen(handler);

    // Assert
    expect(createServerStub.calledWithExactly(handler as any)).to.eq(true);
    expect(instance.listen.calledWithExactly(options.port, options.hostname, undefined)).to.eq(true);
  });
});
