const webpackConfig = require("./webpack.config")();

var reporters = ["progress"];
if (process.env.APPVEYOR_API_URL) {
    reporters.push("appveyor");
}

module.exports = function(config) {
    config.set({
        frameworks: ["jasmine"],
        files: ["tests.js"],
        preprocessors: {
            "tests.js": ["webpack", "sourcemap"]
        },
        reporters: reporters,
        browsers: ["jsdom"],
        singleRun: true,
        webpack: {
            devtool: "inline-source-map",
            resolve: webpackConfig.resolve,
            module: webpackConfig.module,
            externals: {
                "react/addons": "react",
                "react/lib/ExecutionEnvironment": "react",
                "react/lib/ReactContext": "react"
            }
        },
        webpackMiddleware: {
            stats: "errors-only"
        }
    });
};
