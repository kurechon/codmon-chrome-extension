const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    background: "./src/background.js",
    content: "./src/content.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "icons",
              name: "[name].[ext]",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "src/manifest.json",
          to: "manifest.json",
          transform(content) {
            const packageJson = require("./package.json");
            const manifestJson = JSON.parse(content);
            manifestJson.version = packageJson.version;
            manifestJson.name = packageJson.name;
            manifestJson.description = packageJson.description;
            return JSON.stringify(manifestJson, null, 2);
          },
        },
        { from: "src/icons", to: "icons" },
      ],
    }),
  ],
};
