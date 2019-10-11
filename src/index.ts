import {api, data, del, get, injectable, module, post, put, render, handler} from "./decorators";
import {Module} from "./module";

export = {
  // Abstracts
  Module,

  // Decorators
  module,
  data,
  api,
  handler,
  get,
  injectable,
  put,
  post,
  render,
  del,
};
