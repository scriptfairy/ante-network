const HtmlWebpackPlugin = require("html-webpack-plugin");

const templateContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>D3 Force Directed Graph</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body, html {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      #app {
        width: 90vw;
        height: 90vh;
        border: 1px solid #aaa;
      }

      .link {
        stroke: #c1c1c1;
        stroke-width: 2px;
        pointer-events: all;
      }

      .node circle {
        pointer-events: all;
        stroke: #777;
        stroke-width: 1px;
      }
      
      div.tooltip {
        position: absolute;
        background-color: white;
        max-width; 200px;
        height: auto;
        padding: 1px;
        border-style: solid;
        border-radius: 4px;
        border-width: 1px;
        box-shadow: 3px 3px 10px rgba(0, 0, 0, .5);
        pointer-events: none;
      }
    </style>
  </head>
  <body>
    <div id="app" />
  </body>
</html>
`;

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
  },
  plugins: [new HtmlWebpackPlugin({ templateContent })],
};
