import {api, del, error, fragment, get, handler, injectable, module, partials, post, put} from "./decorators";
import {Module} from "./module";
import {Uws} from "./adaptors/uws";
import {ApiProcedureResponseBuilder, FragmentProcedureResponseBuilder} from "./procedure-response-builder";

export = {
  // Abstracts
  Module,

  // Decorators
  module,
  api,
  handler,
  get,
  injectable,
  put,
  post,
  error,
  fragment,
  del,
  partials,
  ApiProcedureResponseBuilder,
  FragmentProcedureResponseBuilder,

  adaptors: {
    Uws
  }
};
