import {JSONObject, JSONValue, ProcedureResponse} from './types';
import {ProcedureActionType} from './enums';

class ProcedureResponseBuilder {
  protected doneCallback: (procedureResponse: ProcedureResponse) => void;
  protected buildParams: ProcedureResponse = {};

  static create(
    type: ProcedureActionType,
    doneCallback: (procedureResponse: ProcedureResponse) => void
  ):
    | FragmentProcedureResponseBuilder
    | ApiProcedureResponseBuilder {

    if (type === ProcedureActionType.FRAGMENT) {
      return new FragmentProcedureResponseBuilder(doneCallback);
    } else {
      return new ApiProcedureResponseBuilder(doneCallback);
    }
  }

  constructor(doneCallback: (procedureResponse: ProcedureResponse) => void) {
    this.doneCallback = doneCallback;
  }

  protected createFragmentConfig() {
    return {
      meta: {
        statusCode: 200,
        headers: {}
      }
    }
  }

  protected createApiConfig() {
    return {
      meta: {
        headers: {},
        statusCode: 200
      }
    }
  }

  status(statusCode: number) {
    if (!this.buildParams.fragment) this.buildParams.fragment = this.createFragmentConfig();

    this.buildParams.fragment.meta.statusCode = statusCode;
    return this;
  }

  header(name: string, value: string) {
    if (!this.buildParams.fragment) this.buildParams.fragment = this.createFragmentConfig();

    this.buildParams.fragment.meta.headers[name] = value;
    return this;
  }

  headers(headerMap: Record<string, string>) {
    if (!this.buildParams.fragment) this.buildParams.fragment = this.createFragmentConfig();

    this.buildParams.fragment.meta.headers = {
      ...this.buildParams.fragment.meta.headers,
      ...headerMap,
    };
    return this;
  }

  redirect(status: 301 | 302, target: string) {
    this.buildParams = {};
    this.buildParams.fragment = this.createFragmentConfig();
    this.buildParams.fragment.meta.statusCode = status;
    this.buildParams.fragment.meta.headers.location = target;
    this.done();
  }

  upgradeVersion(configuration: JSONObject) {
    this.buildParams = {};
    this.buildParams.__upgrade__version = configuration;
    this.done();
  }

  done() {
    this.doneCallback(this.buildParams);
  }
}

class ApiProcedureResponseBuilder extends ProcedureResponseBuilder {
  json(value: JSONValue) {
    this.buildParams.api = this.createApiConfig();
    this.buildParams.api.data = value;
    this.done();
  }
}

class FragmentProcedureResponseBuilder extends ProcedureResponseBuilder {
  partial(name: string, html: string) {
    if (!this.buildParams.fragment) this.buildParams.fragment = this.createFragmentConfig();
    this.buildParams.fragment.html = {
      [name]: html,
      ...(this.buildParams.fragment.html || {}),
    };
    return this;
  }
}

export {
  ProcedureResponseBuilder,
  ApiProcedureResponseBuilder,
  FragmentProcedureResponseBuilder,
};
