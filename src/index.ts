import {apiService, module, get, injectable, put, post, del} from "./decorators";
import {Module} from "./module";

export = {
  // Abstracts
  Module,

  // Decorators
  module,
  apiService,
  get,
  injectable,
  put,
  post,
  del
};
