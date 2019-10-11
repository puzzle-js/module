import path from "path";

const getDecoratedFile = () => {
  const error = new Error();
  const regex = /__decorate.\((.*?):.*/;
  return regex.exec(error.stack!)![1];
};

const detectDevelopmentMode = () => {
  try {
    let parent = module;
    while (parent.parent && parent.parent.id.length > 1) {
      parent = parent.parent;
    }

    const starterFile = parent.id;

    return starterFile === path.join(__dirname, 'index.js');
  } catch (e) {
    return false;
  }
};

export {
  detectDevelopmentMode,
  getDecoratedFile
}
