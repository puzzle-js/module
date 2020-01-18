import * as sinon from "sinon";
import * as faker from "faker";
import {expect} from "chai";
import {ProcedureResponseBuilder} from "../procedure-response-builder";

const sandbox = sinon.createSandbox();
let procedureResponseBuilderSpec: ProcedureResponseBuilder;

describe('[procedure-response-build.ts]', () => {
    beforeEach(() => {
        const callback = sandbox.stub();
        procedureResponseBuilderSpec = new ProcedureResponseBuilder(callback);
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
});
