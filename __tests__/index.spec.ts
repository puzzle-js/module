import {expect} from "chai";
import {
  module,
  api,
  data,
  del,
  get,
  injectable,
  post,
  put,
  handler,
  render
} from "../src/decorators";
import {Module} from "../src/module";

describe('[index.ts]', () => {
  it('should export lib contents', () => {
    // Act
    const exports = require('../src');


    // Assert
    expect(exports).to.deep.eq({
      get,
      post,
      put,
      del,
      Module,
      render,
      handler,
      injectable,
      data,
      api,
      module
    });
  });
});
