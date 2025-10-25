import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Import Firebase and initialize
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Import your AuthService to inject the Auth instance
import { FirebaseAuthService } from './app/services/firebase-auth.service';

// Your actual Firebase configuration object
const firebaseConfig = {
  // Add your Firebase project's configuration here
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
  // measurementId is optional for web apps
};

bootstrapApplication(App, appConfig)
  .then(appRef => {
    // Get the FirebaseAuthService instance from the Angular injector
    const authService = appRef.injector.get(FirebaseAuthService);
    
    // Initialize Firebase App
    const app = initializeApp(firebaseConfig);
    
    // Get the Auth instance
    const auth = getAuth(app);
    
    // Pass the initialized Auth instance to your service
    authService.initializeAuth(auth);
    
  })
  .catch((err) => console.error(err));
```

src/app/services/firebase-auth.service.ts
