import * as sinon from "sinon";
import {expect} from "chai";
import {HttpAdaptor} from "../adaptors/http-adaptor";
import {HttpServer} from "../adaptors/http-server";
import {HttpRouter} from "../adaptors/http-router";

const sandbox = sinon.createSandbox();

let httpAdaptor: HttpAdaptor;

const server = new HttpServer();
const router = new HttpRouter();

let serverMock: sinon.SinonMock;
let routerMock: sinon.SinonMock;

describe('[http-adaptor.ts]', () => {
  beforeEach(() => {
    serverMock = sandbox.mock(server);
    routerMock = sandbox.mock(router);
    httpAdaptor = new HttpAdaptor(server, router)
  });

  afterEach(() => {
    sandbox.verifyAndRestore();
  });

  it('should create new HttpAdaptor', () => {
    // Arrange
    const httpAdaptor = new HttpAdaptor(server, router);

    // Assert
    expect(httpAdaptor).to.be.instanceOf(HttpAdaptor);
  });

  it('should start http server', async () => {
    // Arrange
    serverMock
      .expects('listen')
      .withExactArgs(httpAdaptor.handleIncomingRequest);

    // Act
    await httpAdaptor.start();
  });
});
