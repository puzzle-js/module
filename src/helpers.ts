import * as path from "path";

const getDecoratedFile = () => {
  const error = new Error();
  const regex = /__decorate.\((.*?):.*/;
  return regex.exec(error.stack!)![1];
};

const detectDevelopmentMode = (mainModule = module) => {
  while (mainModule.parent && mainModule.parent.id.length > 1) {
    mainModule = mainModule.parent;
  }

  return mainModule.id === path.join(__dirname, 'index.js');
};

export {
  detectDevelopmentMode,
  getDecoratedFile
}
