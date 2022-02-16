// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");
const versions = require('./versions.json');

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
          path: '/',
          routeBasePath: "/",
          // editUrl: "https://github.com/facebook/docusaurus/edit/main/website/",
          lastVersion: versions[0],
          includeCurrentVersion: false,
        },
        blog: false,
        pages: false,
        theme: {
          customCss: [ require.resolve('./swagger/overwrite.css')]
        }
      }),
    ],
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
            type: 'docsVersionDropdown',
            position: 'right',
            // dropdownActiveClassDisabled: true,
          },
          {
            type: "localeDropdown",
            position: "right"
          }
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
    }),
  // plugins: ["docusaurus-plugin-relative-paths"],
};

module.exports = config;
