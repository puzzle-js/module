import * as sinon from "sinon";
import {expect} from "chai";
import {
  ApiProcedureResponseBuilder,
  FragmentProcedureResponseBuilder,
  ProcedureResponseBuilder
} from "../procedure-response-builder";
import {ProcedureActionType} from "../enums";
import * as faker from "faker";
import {JSONObject, JSONValue} from "../types";

const sandbox = sinon.createSandbox();
let procedureResponseBuilder: ProcedureResponseBuilder;

describe('[procedure-response-build.ts]', () => {
  beforeEach(() => {
    const callback = sandbox.stub();
    procedureResponseBuilder = new ProcedureResponseBuilder(callback);
  });

  afterEach(() => {
    sandbox.verifyAndRestore();
  });

  it('should create new ProcedureResponseBuilder', () => {
    // Arrange
    const callback = sandbox.stub();
    const procedureResponseBuilder = new ProcedureResponseBuilder(callback);

    // Assert
    expect(procedureResponseBuilder).to.be.instanceOf(ProcedureResponseBuilder);
  });

  describe('ProcedureResponseBuilder Factory', () => {
    const callback = sandbox.stub();

    it('should create new Fragment response builder', () => {
      // Act
      const fragmentResponseBuilder = ProcedureResponseBuilder.create(ProcedureActionType.FRAGMENT, callback);

      // Assert
      expect(fragmentResponseBuilder).to.be.instanceOf(FragmentProcedureResponseBuilder)
    });

    it('should create new Api response builder', () => {
      // Act
      const apiResponseBuilder = ProcedureResponseBuilder.create(ProcedureActionType.API, callback);

      // Assert
      expect(apiResponseBuilder).to.be.instanceOf(ApiProcedureResponseBuilder)
    });
  });

  describe('Meta Status', () => {
    it('should create new configuration', () => {
      // Arrange
      const statusCode = Math.random();
      const doneStub = sandbox.stub();

      // Act
      const procedureResponseBuilder = new ProcedureResponseBuilder(doneStub);
      procedureResponseBuilder
        .status(statusCode)
        .done();

      // Assert
      expect(doneStub.firstCall.args[0]).to.deep.eq({
        fragment: {
          meta: {
            statusCode,
            headers: {}
          },
        }
      });
    });

    it('should update status of existing configuration', () => {
      // Arrange
      const statusCode = Math.random();
      const headerName = faker.random.word();
      const headerValue = faker.random.word();
      const doneStub = sandbox.stub();

      // Act
      const procedureResponseBuilder = new ProcedureResponseBuilder(doneStub);
      procedureResponseBuilder
        .header(headerName, headerValue)
        .status(statusCode)
        .done();

      // Assert
      expect(doneStub.firstCall.args[0]).to.deep.eq({
        fragment: {
          meta: {
            statusCode,
            headers: {
              [headerName]: headerValue
            }
          },
        }
      });
    });
  });

  describe('Header Single Value', () => {
    it('should create new configuration', () => {
      // Arrange
      const headerName = faker.random.word();
      const headerValue = faker.random.word();
      const doneStub = sandbox.stub();

      // Act
      const procedureResponseBuilder = new ProcedureResponseBuilder(doneStub);
      procedureResponseBuilder
        .header(headerName, headerValue)
        .done();

      // Assert
      expect(doneStub.firstCall.args[0]).to.deep.eq({
        fragment: {
          meta: {
            statusCode: 200,
            headers: {
              [headerName]: headerValue
            }
          },
        }
      });
    });

    it('should update status of existing configuration', () => {
      // Arrange
      const statusCode = Math.random();
      const headerName = faker.random.word();
      const headerValue = faker.random.word();
      const header2Name = `${faker.random.word()}2`;
      const header2Value = `${faker.random.word()}2`;
      const doneStub = sandbox.stub();

      // Act
      const procedureResponseBuilder = new ProcedureResponseBuilder(doneStub);
      procedureResponseBuilder
        .status(statusCode)
        .header(header2Name, header2Value)
        .header(headerName, headerValue)
        .done();

      // Assert
      expect(doneStub.firstCall.args[0]).to.deep.eq({
        fragment: {
          meta: {
            statusCode,
            headers: {
              [header2Name]: header2Value,
              [headerName]: headerValue
            }
          },
        }
      });
    });
  });

  describe('Headers Merge', () => {
    it('should create new configuration', () => {
      // Arrange
      const headerName = faker.random.word();
      const headerValue = faker.random.word();
      const header = {
        [headerName]: headerValue
      };
      const doneStub = sandbox.stub();

      // Act
      const procedureResponseBuilder = new ProcedureResponseBuilder(doneStub);
      procedureResponseBuilder
        .headers(header)
        .done();

      // Assert
      expect(doneStub.firstCall.args[0]).to.deep.eq({
        fragment: {
          meta: {
            statusCode: 200,
            headers: header
          },
        }
      });
    });

    it('should update status of existing configuration', () => {
      // Arrange
      const statusCode = Math.random();
      const headerName = faker.random.word();
      const headerValue = faker.random.word();
      const header2Name = `${faker.random.word()}2`;
      const header2Value = `${faker.random.word()}2`;
      const header = {
        [header2Name]: header2Value
      };
      const doneStub = sandbox.stub();

      // Act
      const procedureResponseBuilder = new ProcedureResponseBuilder(doneStub);
      procedureResponseBuilder
        .status(statusCode)
        .header(header2Name, header2Value)
        .headers(header)
        .done();

      // Assert
      expect(doneStub.firstCall.args[0]).to.deep.eq({
        fragment: {
          meta: {
            statusCode,
            headers: {
              [header2Name]: header2Value,
              ...header
            }
          },
        }
      });
    });
  });

  it('should create redirection request', () => {
    // Arrange
    const status = Math.random();
    const target = faker.internet.url();
    const doneStub = sandbox.stub();

    // Act
    const procedureResponseBuilder = new ProcedureResponseBuilder(doneStub);
    procedureResponseBuilder
      .redirect(status as unknown as 301, target);

    // Assert
    expect(doneStub.firstCall.args[0]).to.deep.eq({
      fragment: {
        meta: {
          statusCode: status,
          headers: {
            location: target
          }
        },
      }
    });
  });

  it('should send upgrade version response', () => {
    const configuration = faker.helpers.createCard() as unknown as JSONObject;
    const doneStub = sandbox.stub();

    // Act
    const procedureResponseBuilder = new ProcedureResponseBuilder(doneStub);
    procedureResponseBuilder
      .upgradeVersion(configuration);

    // Assert
    expect(doneStub.firstCall.args[0]).to.deep.eq({
      __upgrade__version: configuration
    });
  });

  it('should end response and call callback', () => {
    // Arrange
    const doneStub = sandbox.stub();

    // Act
    const procedureResponseBuilder = new ProcedureResponseBuilder(doneStub);
    procedureResponseBuilder
      .done();

    // Assert
    expect(doneStub.firstCall.args[0]).to.deep.eq({});
  });

  describe('ApiProcedureResponseBuilder', () => {
    it('should send json data', () => {
      // Arrange
      const obj = faker.helpers.createCard() as unknown as JSONValue;
      const doneStub = sandbox.stub();

      // Act
      const procedureResponseBuilder = new ApiProcedureResponseBuilder(doneStub);
      procedureResponseBuilder
        .json(obj);

      // Assert
      expect(doneStub.firstCall.args[0]).to.deep.eq({
        api: {
          meta: {
            headers: {},
            statusCode: 200
          },
          data: obj,
        }
      });
    });
  });

  describe('FragmentProcedureResponseBuilder', () => {
    describe('Partials', () => {
      // it('should create new partial html without existing configuration', () => {
      //   // Arrange
      //   const partialName = faker.random.word();
      //   const partialHtml = faker.random.word();
      //   const doneStub = sandbox.stub();
      //
      //   // Act
      //   const procedureResponseBuilder = new FragmentProcedureResponseBuilder(doneStub);
      //   procedureResponseBuilder
      //     .render(partialName, partialHtml)
      //     .done();
      //
      //   // Assert
      //   expect(doneStub.firstCall.args[0]).to.deep.eq({
      //     fragment: {
      //       meta: {
      //         headers: {},
      //         statusCode: 200
      //       },
      //       html: {
      //         [partialName]: partialHtml
      //       },
      //     }
      //   });
      // });
      //
      // it('should create new partial html with existing configuration', () => {
      //   // Arrange
      //   const partialName = faker.random.word();
      //   const partialHtml = faker.random.word();
      //   const partial2Name = `${faker.random.word()}2`;
      //   const status = faker.random.number();
      //   const partial2Html = `${faker.random.word()}2`;
      //   const doneStub = sandbox.stub();
      //
      //   // Act
      //   const procedureResponseBuilder = new FragmentProcedureResponseBuilder(doneStub);
      //   procedureResponseBuilder
      //     .status(status)
      //     .render(partial2Name, partial2Html)
      //     .render(partialName, partialHtml)
      //     .done();
      //
      //   // Assert
      //   expect(doneStub.firstCall.args[0]).to.deep.eq({
      //     fragment: {
      //       meta: {
      //         statusCode: status,
      //         headers: {}
      //       },
      //       html: {
      //         [partial2Name]: partial2Html,
      //         [partialName]: partialHtml
      //       },
      //     }
      //   });
      // });
    });

  });
});
