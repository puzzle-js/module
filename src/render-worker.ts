import {IOC} from "./ioc";

const {parentPort, workerData} = require('worker_threads');
const Worker = require('worker-threads-promise');
Worker.connect(parentPort);

const renderService = require(workerData.decoratedFile);

const renderClassConstructor = renderService[workerData.serviceName];

const renderInstance = IOC.get(renderClassConstructor) as any;

parentPort.on('message', (data: any) => {
  return renderInstance[workerData.renderHandler](data);
});
