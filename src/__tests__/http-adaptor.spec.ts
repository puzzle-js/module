import * as sinon from "sinon";
import {expect} from "chai";
import {HttpAdaptor} from "../adaptors/http-adaptor";

const sandbox = sinon.createSandbox();

let httpAdaptor: HttpAdaptor;


describe('[http-adaptor.ts]', () => {
  beforeEach(() => {
    httpAdaptor = new HttpAdaptor();
  });

  afterEach(() => {
    sandbox.verifyAndRestore();
  });

  it('should create new HttpAdaptor', () => {
    // Arrange
    const httpAdaptor = new HttpAdaptor();

    // Assert
    expect(httpAdaptor).to.be.instanceOf(HttpAdaptor);
  });
});
