import * as sinon from "sinon";
import * as faker from "faker";
import {expect} from "chai";
import {WorkerManager} from "../worker-manager";

const sandbox = sinon.createSandbox();
let workerManager: WorkerManager;

describe('[worker-manager.ts]', () => {
    beforeEach(() => {
        workerManager = new WorkerManager()
    });

    afterEach(() => {
        sandbox.verifyAndRestore();
    });

    it('should create new WorkerManager', () => {
        // Arrange
        const workerManager = new WorkerManager();

        // Assert
        expect(workerManager).to.be.instanceOf(WorkerManager);
    });
});
