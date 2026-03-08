// Firebase configuration with security best practices
const firebaseConfig = {
    apiKey: "AIzaSyDJ48tFQgIWlNXP7xwJ3kYkZvSSMhWAOpI",
    authDomain: "cv-maker-36bb8.firebaseapp.com",
    projectId: "cv-maker-36bb8",
    storageBucket: "cv-maker-36bb8.firebasestorage.app",
    messagingSenderId: "253428490647",
    appId: "1:253428490647:web:3f08b518ee970aeb79a4d2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Enable persistence with security
db.enablePersistence({ synchronizeTabs: true })
    .catch(err => {
        if (err.code === 'failed-precondition') {
            console.warn('Multiple tabs open, persistence disabled');
        }
    });

// Security: Set up Firestore security rules (to be applied in Firebase console)
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection: users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Exams collection: public read, write restricted to admins
    match /exams/{exam} {
      allow read: if true;
      allow write: if false; // Admin only
    }
    
    // Categories: public read
    match /categories/{category} {
      allow read: if true;
      allow write: if false;
    }
    
    // Questions: public read
    match /questions/{question} {
      allow read: if true;
      allow write: if false;
    }
    
    // Purchases: users can only read their own purchases
    match /users/{userId}/purchases/{purchaseId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Written by functions only
    }
  }
}
*/

// Export for use in other files
window.auth = auth;
window.db = db;