/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: "https://permanent-halle.de",
  generateRobotsTxt: false,
  exclude: [
    "/admin",
    "/admin/*",
    "/api",
    "/api/*",
    "/appointments",
    "/appointments/*",
    "/booking",
    "/booking/*",
    "/coming-soon",
    "/for-masters",
    "/login",
    "/privacy",
    "/register",
    "/terms",
    "/users",
  ],
};

export default config;
