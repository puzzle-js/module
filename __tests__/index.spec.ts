import {expect} from "chai";
import {module, apiService, dataService, del, get, injectable, post, put} from "../src/decorators";
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
      injectable,
      dataService,
      apiService,
      module
    });
  });
});
