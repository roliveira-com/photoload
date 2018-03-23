module.exports = {
  "globDirectory": "public/",
  "globPatterns": [
    "**/*.{html,ico,json,css,js}",
    "src/images/*.{jpg,png}",
    "src/js/build/*.js"
  ],
  "swSrc": "./public/sw-base.js",
  "swDest": "./public/service-worker.js",
  "globIgnores": [
    "../workbox-cli-config.js",
    "help/**",
    "404.html"
  ]
};
