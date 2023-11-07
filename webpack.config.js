const path = require('path')
const { DefinePlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, 'www/js'),
    filename: 'index.bundle.js',
    publicPath: '/',
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
      ,
      {
        test: /\.(css)$/,
        use: ['style-loader','css-loader']
      }
      ,
      {
        test: /\.(woff|ttf|otf|eot|woff2|svg)$/i,
        loader: "file-loader",
        options: {
          outputPath: 'js',
        },
      }
    ]
  },
  plugins: [
    new DefinePlugin({
        ENV_API_ENDPOINT: JSON.stringify('https://127.0.0.1:8020/fr/api/'),
        //ENV_API_ENDPOINT: JSON.stringify('https://42morrow.biinflow.com/public/fr/api/'),
        ENV_API_KEY: JSON.stringify('3ca576c8-b9f3-47c9-9c83-8f669cb90694')
    }),
  ],
}



