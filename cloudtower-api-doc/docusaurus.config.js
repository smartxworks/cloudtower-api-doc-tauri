// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");
const webpack = require("webpack");
const versions = require("./versions.json");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "CloudTower API",
  url: "https://www.smartx.com/",
  baseUrl: "/",
  favicon: "img/favicon.ico",
  organizationName: "SmartX", // Usually your GitHub org/user name.
  projectName: "CloudTower APIs", // Usually your repo name.
  i18n: {
    defaultLocale: "zh",
    locales: ["zh", "en"],
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: "/",
          routeBasePath: "/",
          // editUrl: "https://github.com/facebook/docusaurus/edit/main/website/",
          lastVersion: versions[0],
          includeCurrentVersion: false,
        },
        blog: false,
        pages: false,
        theme: {
          customCss: [require.resolve("./swagger/overwrite.css")],
        },
      }),
    ],
  ],
  plugins: [
    (context, opts) => {
      return {
        name: "overwrite-config",
        configureWebpack(config, isServer, utils, content) {
          return {
            plugins: [
              new webpack.ProvidePlugin({
                process: "process/browser.js",
              }),
            ],
            resolve: {
              fallback: {
                path: require.resolve("path-browserify"),
                os: require.resolve("os-browserify/browser"),
                tty: require.resolve("tty-browserify"),
              },
            },
          };
        },
      };
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        style: "dark",
        logo: {
          alt: "Smartx - Make IT simple",
          src: "img/smartx.svg",
        },
        items: [
          {
            type: "docsVersion",
            to: "/",
            label: "通用指南" 
          },
          {
            type: "docsVersion",
            to: "/api",
            label: "CloudtTower API"
          },
          {
            label: "下载",
            items: [
              {
                type: "docsVersion",
                to: "/download",
                label: "概览"
              },
              {
                type: "docsVersion",
                to: "/java-sdk",
                label: "CloudTower Java SDK",
              },
              {
                to: "/python-sdk",
                type: "docsVersion",
                label: "CloudTower Python SDK"
              },
              {
                tl: "/go-sdk",
                type: "docsVersion",
                label: "CloudTower Go SDK"
              }
            ]
          },
          {
            type: "docsVersionDropdown",
            position: "right",
          },
          {
            type: "localeDropdown",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        copyright: `Copyright © ${new Date().getFullYear()} SmartX Inc`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    })
};

module.exports = config;
