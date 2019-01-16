const path = require("path");
const webpack = require("webpack");

const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CheckerPlugin = require("awesome-typescript-loader").CheckerPlugin;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const bundleOutputDir = "./wwwroot/dist";

module.exports = env => {
    const isDevBuild = !(env && env.prod);
    const isStatsBuild = !(env && env.stats);

    const cssLoader = {
        loader: 'css-loader',
        options: {
            modules: true,
            importLoaders: 1,
            localIdentName: '[name]__[local]___[hash:base64:5]',
            sourceMap: true
        }
    };
    return [{
        stats: {
            modules: false
        },
        entry: {
            root: [
                "stacktrace-js",
                "log4javascript",
                "./ClientApp/root.tsx",
            ],
            asset: "./ClientApp/pages/assets/boot.tsx",
            vendor: [
                "event-source-polyfill",
                "isomorphic-fetch",
                "moment",
                "react",
                "react-bootstrap-typeahead",
                "react-datepicker",
                "react-dom",
                "react-router-dom",
                "react-table",
                "reactstrap"
            ]
        },
        target: "web",
        resolve: {
            extensions: [".js", ".jsx", ".ts", ".tsx"]
        },
        output: {
            path: path.join(__dirname, bundleOutputDir),
            filename: "[name].js",
            publicPath: "/dist/"
        },
        module: {
            rules: [{
                    test: /\.tsx?$/,
                    include: /ClientApp/,
                    use: "awesome-typescript-loader?silent=true"
                },
                {
                    test: /\.css$/,
                    use: isDevBuild ?
                        ["style-loader", "css-loader"] :
                        ExtractTextPlugin.extract({
                            use: "css-loader?minimize"
                        })
                },
                {
                    test: /\.scss$/,
                    use: isDevBuild ? ['style-loader', 'css-loader', 'sass-loader'] : ExtractTextPlugin.extract({
                        use: ['css-loader', 'sass-loader']
                    })
                },
                {
                    test: /\.(png|jpg|jpeg|gif|svg)$/,
                    use: "url-loader?limit=25000"
                }
            ]
        },
        devtool: isDevBuild ? "inline-source-map" : "source-map",
        plugins: [
            new CheckerPlugin(),
            new webpack.DefinePlugin({
                "__DEV__": isDevBuild ? 'true' : 'false',
                "process.env.NODE_ENV": isDevBuild ? '"development"' : '"production"',
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: ["logger", "vendor", "root"],
                minChunks: Infinity
            }),
            // new webpack.SourceMapDevToolPlugin({
            //     filename: "[file].map", // Remove this line if you prefer inline source maps
            //     moduleFilenameTemplate: path.relative(
            //         bundleOutputDir,
            //         "[resourcePath]"
            //     ) // Point sourcemap entries to the original file locations on disk
            // }),
            // ignore moment locales
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        ].concat(
            isDevBuild ?
            [
                // Plugins that apply in development builds only
            ] :
            [
                // Plugins that apply in production builds only
                new UglifyJsPlugin(),
                new ExtractTextPlugin({
                    filename: '[name].css',
                    allChunks: true
                }),
            ]
        ).concat(
            isStatsBuild ? 
            [
                new BundleAnalyzerPlugin()
            ]
            : []
        )
    }];
};
