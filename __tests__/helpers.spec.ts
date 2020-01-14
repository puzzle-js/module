import {expect} from "chai";
import {detectDevelopmentMode, getDecoratedFile} from "../src/helpers";
import * as path from "path";
import * as sinon from "sinon";

const sandbox = sinon.createSandbox();

describe('[helpers.ts]', () => {
  it('should get decorated file', (done) => {
    // Arrange
    function classDecorator(constructor: Function) {
      expect(getDecoratedFile()).to.eq(__filename);
      done();
    }

    @classDecorator
    class DecoratedClass {
    }
  });

  it('should detect development mode', () => {
    // Arrange
    const parent = {
      parent: {
        id: path.join(__dirname, '../src', 'index.js'),
        parent: {
          id: '.'
        }
      }
    };

    // Act
    const isDevelopmentMode = detectDevelopmentMode(parent as any);

    // Assert
    expect(isDevelopmentMode).to.eq(true);
  });


  it('should detect development mode without mocking', () => {
    // Act
    const isDevelopmentMode = detectDevelopmentMode();

    // Assert
    expect(isDevelopmentMode).to.eq(false);
  });
});
