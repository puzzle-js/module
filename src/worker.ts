import {IOC} from "./ioc";

const {parentPort, workerData} = require('worker_threads');
const Worker = require('worker-threads-promise');
Worker.connect(parentPort);

const renderService = require(workerData.decoratedFile);

const serviceConstructor = renderService[workerData.serviceName];

const service = IOC.get(serviceConstructor) as any;

parentPort.on('message', (data: any) => {
  return service[workerData.handler](data);
});
