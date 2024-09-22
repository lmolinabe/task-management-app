const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    env: {
      APP_FRONTEND_URL: 'http://localhost:3000',
    },
    setupNodeEvents(on, config) {
      config.baseUrl = config.env.APP_FRONTEND_URL; 
      return config;
    },
  },
});