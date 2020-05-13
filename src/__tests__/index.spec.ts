import {expect} from "chai";
import {
  module,
  api,
  del,
  get,
  injectable,
  post,
  put,
  handler,
  partials,
  error,
  fragment
} from "../decorators";
import {Module} from "../module";
import {Uws} from "../adaptors/uws";

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
      error,
      partials,
      handler,
      injectable,
      fragment,
      api,
      module,

      adaptors: {
        Uws
      }
    });
  });
});
