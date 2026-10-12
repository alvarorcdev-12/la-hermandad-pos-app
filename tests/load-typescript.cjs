const fs = require('node:fs');
const ts = require('typescript');
module.exports = function loadTypeScript(path, mocks = {}) {
  const compiled = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const loaded = { exports: {} };
  new Function('require', 'exports', 'module', compiled.outputText)(
    (id) => Object.hasOwn(mocks, id) ? mocks[id] : require(id), loaded.exports, loaded,
  );
  return loaded.exports;
};
