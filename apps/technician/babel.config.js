module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          jsxImportSource: "nativewind",
          // React Compiler is OFF deliberately. It hoisted hook callbacks that
          // capture an enclosing factory function's parameter out to module
          // scope while still emitting the original identifier, e.g.
          // `mutationFn: (input) => api.create(input)` inside makeCrudHooks
          // became a module-level `function O(t){return api.create(t)}` where
          // `api` is undefined. Every master-data create/edit threw
          // `ReferenceError: api is not defined` before sending a request,
          // while list queries kept working. Re-enable only after verifying a
          // create form still saves.
          reactCompiler: false,
        },
      ],
      "nativewind/babel",
    ],
  };
};
