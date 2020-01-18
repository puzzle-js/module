import { JSONObject, JSONValue, ProcedureResponse } from './types';
import { ProcedureActionType } from './enums';

class ProcedureResponseBuilder {
  protected doneCallback: (procedureResponse: ProcedureResponse) => void;
  protected buildParams: ProcedureResponse = {
    meta: {
      statusCode: 200,
      headers: {},
    },
  };

  static create(
    type: ProcedureActionType,
    doneCallback: (procedureResponse: ProcedureResponse) => void
  ):
    | FragmentProcedureResponseBuilder
    | ApiProcedureResponseBuilder
    | ProcedureResponseBuilder {
    if (type === ProcedureActionType.FRAGMENT) {
      return new FragmentProcedureResponseBuilder(doneCallback);
    } else if (type === ProcedureActionType.API) {
      return new ApiProcedureResponseBuilder(doneCallback);
    }

    return new ProcedureResponseBuilder(doneCallback);
  }

  constructor(doneCallback: (procedureResponse: ProcedureResponse) => void) {
    this.doneCallback = doneCallback;
  }

  status(statusCode: number) {
    this.buildParams.meta.statusCode = statusCode;
    return this;
  }

  header(name: string, value: string) {
    this.buildParams.meta.headers[name] = value;
    return this;
  }

  headers(headerMap: Record<string, string>) {
    this.buildParams.meta.headers = {
      ...this.buildParams.meta.headers,
      ...headerMap,
    };
    return this;
  }

  redirect(status: 301 | 302, target: string) {
    this.buildParams.meta.headers.location = target;
    return this;
  }

  upgradeVersion(configuration: JSONObject) {
    this.buildParams.__upgrade__version = configuration;
    this.done();
  }

  done() {
    this.doneCallback(this.buildParams);
  }
}

class ApiProcedureResponseBuilder extends ProcedureResponseBuilder {
  json(value: JSONValue) {
    this.buildParams.data = value;
    return this;
  }
}

class FragmentProcedureResponseBuilder extends ProcedureResponseBuilder {
  partial(name: string, html: string) {
    this.buildParams.html = {
      [name]: html,
      ...(this.buildParams.html || {}),
    };
    return this;
  }
}

export {
  ProcedureResponseBuilder,
  ApiProcedureResponseBuilder,
  FragmentProcedureResponseBuilder,
};
