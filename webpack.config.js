const DefinePlugin = require('webpack').DefinePlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');

const RESPONSIVE_SIZES = [250, 320, 400, 500, 640, 800];
const GDRIVE_API_KEY = 'AIzaSyAsggoUe5zy3jLXhAo-kYQ8xmgpTi377Ec';
const DIST_DIR = __dirname + '/dist';
const API_HOST = 'http://localhost:1337/';

module.exports = {
    mode: 'development',
    entry: {
        index: './js/main.js',
        restaurant: './js/restaurant.js'
    },
    output: {
        path: DIST_DIR,
        filename: 'js/[name].[hash].js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: { presets: ['env'] }
                }
            },
            {
                test: /\.scss$/,
                use: [
                  {
                    loader: "style-loader" // creates style nodes from JS strings
                  },
                  {
                    loader: "css-loader" // translates CSS into CommonJS
                  },
                  {
                    loader: "sass-loader" // compiles Sass to CSS
                  }
                ]
              },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    { loader: 'css-loader' }
                ]
            },
            {
                test: /\.(jpg|png)$/,
                use: [
                    {
                        loader: 'responsive-loader',
                        options: {
                            name: 'img/[name]-[width].[ext]',
                            sizes: RESPONSIVE_SIZES,
                            adapter: require('responsive-loader/sharp'),
                            quality: 65
                        }
                    }
                ]
            }
        ]
    },
    devtool: 'cheap-module-eval-source-map',
    devServer: {
        host: '127.0.0.1',
        port: 8000,
        contentBase: '.',
        compress: true,
        headers: { 'Access-Control-Allow-Origin': '*' },
        open: true
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            minSize: 3000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '~',
            name: true,
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].[hash].css",
            chunkFilename: "[id].[hash].css"
        }),
        new DefinePlugin({
            WEBPACK_GDRIVE_API_KEY: JSON.stringify(GDRIVE_API_KEY),
            WEBPACK_RESPONSIVE_SIZES: JSON.stringify(RESPONSIVE_SIZES),
            WEBPACK_API_HOST: JSON.stringify(API_HOST)
        }),
        new HtmlWebpackPlugin({
            template: './html/index.html',
            filename: 'index.html',
            excludeChunks: ['restaurant'],
            WEBPACK_GDRIVE_API_KEY: GDRIVE_API_KEY
        }),
        new HtmlWebpackPlugin({
            template: './html/restaurant.html',
            filename: 'restaurant.html',
            excludeChunks: ['index'],
            WEBPACK_GDRIVE_API_KEY: GDRIVE_API_KEY
        }),
        new CopyWebpackPlugin(['data/**/*', 'img/**/*', 'img-svg/**/*']),
        new CompressionPlugin(),
        new GenerateSW({
            skipWaiting: true,
            ignoreUrlParametersMatching: [/./],
            exclude: [
                new RegExp('^data\/'),
                new RegExp('^img\/')
            ],
            runtimeCaching: [
                {
                    urlPattern: new RegExp('^' + API_HOST),
                    handler: 'staleWhileRevalidate',
                    options: {
                        cacheName: 'data-cache'
                    }
                },
                {
                    urlPattern: new RegExp('^http://127.0.0.1:8000/img/'),
                    handler: 'cacheFirst',
                    options: {
                        cacheName: 'image-cache'
                    }
                },
                {
                    urlPattern: new RegExp('^https://maps.googleapis.com/|^https://maps.gstatic.com/'),
                    handler: 'networkFirst',
                    options: {
                        cacheName: 'google-maps-cache'
                    }
                }
            ]
        }),
        new WebpackPwaManifest({
            name: 'Restaurant Reviews Progressive Web App',
            filename: "manifest.json",
            short_name: 'MWSApp',
            orientation: "portrait",
            display: "standalone",
            start_url: "/",
            description: 'Restaurant Reviews Progressive Web App',
            background_color: '#2774a3',
            theme_color: '#2774a3',
            icons: [
                {
                    src: __dirname + '/img/icon-large.png',
                    sizes: [96, 128, 192, 256, 384, 512]
                }
            ]
        })
    ]
};
