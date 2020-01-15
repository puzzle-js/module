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
  partials,
  error,
  render
} from "../decorators";
import {Module} from "../module";

describe('[index.ts]', () => {
  it('should export lib contents', () => {
    // Act
    const exports = require('../index');


    // Assert
    expect(exports).to.deep.eq({
      get,
      post,
      put,
      del,
      Module,
      render,
      error,
      partials,
      handler,
      injectable,
      data,
      api,
      module
    });
  });
});
