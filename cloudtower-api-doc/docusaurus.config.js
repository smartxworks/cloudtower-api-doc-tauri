// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");
const webpack = require("webpack");
const fs = require("fs");
const path = require("path");


/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "CloudTower API",
  url: "https://www.smartx.com/",
  baseUrl: "/",
  staticDirectories: ["static"],
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
          routeBasePath: "/",
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
  customFields: {
    footer: {
      left: {
        items: [
          {
            type: 'logo',
            src: 'img/footer-badge.svg'
          },
          {
            type: 'logo-text',
            i18nKey: 'developer'
          }
        ]
      },
      right: {
        top: {
          items: [
            {
              type: 'copyright',
              i18nKey: 'copyright'
            },
            {
              type: 'link',
              href: 'https://www.smartx.com/legal/website-terms',
              i18nKey: 'user_term'
            },
            {
              type: 'link',
              href: 'https://www.smartx.com/legal/end-user-license-agreement',
              i18nKey: 'candidate'
            },
            {
              type: 'link',
              href: 'https://www.smartx.com/legal/privacy',
              i18nKey: 'privacy'
            },
            {
              type: 'link',
              href: 'https://www.smartx.com/legal',
              i18nKey: 'legal'
            }
          ]
        },
        bottom: {
          items: [
            {
              type: 'link',
              href: 'https://beian.mps.gov.cn',
              i18nKey: 'beian_mps'
            },
            {
              type: 'link',
              href: 'https://beian.miit.gov.cn',
              i18nKey: 'beian_miit'
            }
          ]
        }
      },
      separator: '·' // 可以自定义为 '|', '•', '·' 等
    },
  },
  plugins: [
    () => {
      return {
        name: "latest-swagger",
        async loadContent() {
          const specsDir = path.join(__dirname, "static/specs");
          const files = fs.readdirSync(specsDir).filter(f => /^\d+\.\d+\.\d+-swagger\.json$/.test(f));
          if (files.length === 0) return;
          const latest = files
            .map(f => ({ file: f, ver: f.replace("-swagger.json", "").split(".").map(Number) }))
            .sort((a, b) => b.ver[0] - a.ver[0] || b.ver[1] - a.ver[1] || b.ver[2] - a.ver[2])[0];
          fs.copyFileSync(
            path.join(specsDir, latest.file),
            path.join(specsDir, "latest-swagger.json")
          );
        },
      };
    },
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
              new webpack.DefinePlugin({
                ['process.env.DEFAULT_LNG']:  JSON.stringify('zh')
              }),
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
                http: require.resolve("stream-http"),
                https: require.resolve("https-browserify")
              },
            },
          };
        },
      };
    },
    'docusaurus-plugin-sass',
    'docusaurus2-dotenv'
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        logo: {
          alt: "Smartx - Make IT simple",
          src: "img/developer-badge-zh.svg",
        },
        items: [
          {
            label: "文档" ,
            to: "/",
          },
          {
            to: "/api",
            label: "API",
          },
          {
            type: "docsVersionDropdown",
            position: "right",
          },
          {
            type: "dropdown",
            label: "下载",
            position: "right",
            items: [
              { label: "桌面端", href: "https://github.com/smartxworks/cloudtower-api-doc-tauri/releases/tag/v2.18.0"}            ]
          },
          {
            type: "localeDropdown",
            position: "right",
          },
        ],
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
