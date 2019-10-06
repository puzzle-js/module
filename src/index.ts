import {apiService, dataService, del, get, injectable, module, post, put} from "./decorators";
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
  dataService,
  del
};
