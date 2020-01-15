import * as sinon from "sinon";
import {expect} from "chai";
import {Module} from "../module";

const sandbox = sinon.createSandbox();

let PuzzleModule: Module;

describe('[module.ts]', () => {
  beforeEach(() => {
    PuzzleModule = new Module()
  });

  afterEach(() => {
    sandbox.verifyAndRestore();
  });

  it('should create new Module', () => {
    // Arrange
    const module = new Module();

    // Assert
    expect(module).to.be.instanceOf(Module);
  });

  // it('should return http router for module', () => {
  //   // Arrange
  //   const module = new Module();
  //
  //   // Act
  //   const router = module.getRouter();
  //
  //   // Assert
  //   expect(router).to.be.a('function');
  // });
});
