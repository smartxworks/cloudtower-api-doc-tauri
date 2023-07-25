// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");
const webpack = require("webpack");

if(!process.env.TAURI_ENV) {
  process.env = new Proxy(process.env, {
    get(target, prop) {
      if(prop === 'NODE_ENV') {
        return 'development'
      }
      return typeof target[prop] === 'function' ? target[prop].bind(target) : target[prop]
    }
  })
}

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
    localeConfigs: {
      zh: {
        label: '简体中文',
      },
    }
  },
  onBrokenLinks: "log",
  presets: [
    [
      "@docusaurus/preset-classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/docs",
          sidebarPath: require.resolve('./sidebar-default.js'),
        },
        blog: false,
        theme: {
          customCss: [
            require.resolve("./swagger/overwrite.css"),
            require.resolve('./custom.scss')
          ],
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
            ...(!process.env.TAURI_ENV && {
              output: {
                ...config.output,
                filename: '[name].[contenthash:8].js' ,
                chunkFilename: '[name].[contenthash:8].js',
              },
            }),
            plugins: [
              new webpack.ProvidePlugin({
                process: "process/browser.js",
              }),
            ],
            resolve: {
              fallback: {
                stream: require.resolve("stream-browserify"),
                util:  require.resolve("util/"),
                path: require.resolve("path-browserify"),
                os: require.resolve("os-browserify/browser"),
                tty: require.resolve("tty-browserify"),
                fs: false,
                http: require.resolve("stream-http")
              },
            },
          };
        },
      };
    },
    'docusaurus-plugin-sass',
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        logo: {
          alt: "Smartx - Make IT simple",
          src: "img/smartx-developer-badge-zh-CN.svg",
        },
        items: [
          {
            label: "文档" ,
            to: "/docs/getting-started/overview",
          },
          {
            to: "/",
            label: "API 参考",
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
        additionalLanguages: ['java']
      },
      colorMode: {
        disableSwitch: true,
        defaultMode: "light",
      }
    })
};

module.exports = config;
