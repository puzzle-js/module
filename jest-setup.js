jest.mock('worker-threads-promise', _ => {
  class Worker {
    postMessageAsync(){}
  }

  return Worker;
});
