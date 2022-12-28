const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    background: './src/background/index.ts',
    sitecontent: './src/sitecontent/index.ts',
    options: './src/options/index.ts',
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        './src/manifest.json',
        { from: './src/options/index.html', to: 'options.html' },
        { from: './src/assets/*', to: 'assets/[name][ext]' },
      ],
    }),
  ]
};