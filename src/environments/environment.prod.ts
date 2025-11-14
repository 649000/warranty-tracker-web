export const environment = {
  production: true,
  apiBaseUrl: 'https://your-production-api.com',
  firebase: {
    // TODO: Add your Firebase production project configuration here
    // These values should be set via your CI/CD pipeline or build process
    // and not committed to version control.
    apiKey: process.env['FIREBASE_API_KEY'] || 'DEFAULT_PROD_API_KEY_PLACEHOLDER',
    authDomain: process.env['FIREBASE_AUTH_DOMAIN'] || 'DEFAULT_PROD_AUTH_DOMAIN_PLACEHOLDER',
    projectId: process.env['FIREBASE_PROJECT_ID'] || 'DEFAULT_PROD_PROJECT_ID_PLACEHOLDER',
    storageBucket: process.env['FIREBASE_STORAGE_BUCKET'] || 'DEFAULT_PROD_STORAGE_BUCKET_PLACEHOLDER',
    messagingSenderId: process.env['FIREBASE_MESSAGING_SENDER_ID'] || 'DEFAULT_PROD_MESSAGING_SENDER_ID_PLACEHOLDER',
    appId: process.env['FIREBASE_APP_ID'] || 'DEFAULT_PROD_APP_ID_PLACEHOLDER'
    // measurementId is optional for web apps
  }
};
