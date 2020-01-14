jest.mock('worker-threads-promise', _ => {
  class Worker {
    postMessageAsync(){}
    static connect(){}
  }

  return Worker;
});

jest.mock('worker_threads', _ => {
  class Worker {
    postMessage(){}
  }

  return Worker;
});
