const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    background: './src/background/index.ts',
    options: './src/options/index.ts',
    popup: './src/popup/index.tsx',
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
        { from: './src/popup/index.html', to: 'popup.html' },
        { from: './src/popup/popup.css', to: 'popup.css' },
        { from: './src/options/index.html', to: 'options.html' },
        { from: './src/assets/*', to: 'assets/[name][ext]' },
      ],
    }),
  ]
};