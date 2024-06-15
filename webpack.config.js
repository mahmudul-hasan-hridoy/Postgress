// webpack.config.js
const path = require("path");
const { styles } = require("@ckeditor/ckeditor5-dev-utils");
const CKEditorWebpackPlugin = require("@ckeditor/ckeditor5-dev-webpack-plugin");

module.exports = {
    entry: "./components/ckeditor.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "ckeditor.js",
        library: "ClassicEditor",
        libraryTarget: "umd",
        libraryExport: "default",
    },
    plugins: [
        new CKEditorWebpackPlugin({
            language: "en",
        }),
    ],
    module: {
        rules: [
            {
                test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
                use: ["raw-loader"],
            },
            {
                test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
                use: [
                    {
                        loader: "style-loader",
                        options: {
                            injectType: "singletonStyleTag",
                            attributes: {
                                "data-cke": true,
                            },
                        },
                    },
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: styles.getPostCssConfig({
                                themeImporter: {
                                    themePath: require.resolve(
                                        "@ckeditor/ckeditor5-theme-lark",
                                    ),
                                },
                                minify: true,
                            }),
                        },
                    },
                ],
            },
        ],
    },
};
