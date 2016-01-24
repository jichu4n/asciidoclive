/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'amoya',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },
    contentSecurityPolicy: {
      'default-src': "'none'",
      'script-src': "'self' 'unsafe-inline' 'unsafe-eval' https://www.dropbox.com https://apis.google.com",
      'font-src': "'self'",
      'connect-src': "'self' ws://localhost:8001 localhost:8001",
      'img-src': "'self' data:",
      'report-uri':"'localhost'",
      'style-src': "'self' 'unsafe-inline'",
      'frame-src': "'self' https://accounts.google.com",
      'child-src': "'self' ws://localhost:8001 localhost:8001"
    },

    i18n: {
      defaultLocale: 'en'
    },
    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      DROPBOX_APP_KEY: '***REMOVED***',
      GOOGLE_CLIENT_ID: '***REMOVED***' +
        '.apps.googleusercontent.com',
      GOOGLE_APP_ID: '***REMOVED***',
      GOOGLE_API_KEY: '***REMOVED***'
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.APP.SERVER_URL = 'http://localhost:8001';
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    ENV.APP.SERVER_URL = 'https://asciidoclive.com';
  }

  return ENV;
};
