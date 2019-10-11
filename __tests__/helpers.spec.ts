import {expect} from "chai";
import {getDecoratedFile} from "../src/helpers";


describe('[helpers.ts]', () => {
  it('should create new ', (done) => {
    // Arrange
    function classDecorator(constructor: Function) {
      expect(getDecoratedFile()).to.eq(__filename);
      done();
    }

    @classDecorator
    class DecoratedClass {
    }
  });
});
