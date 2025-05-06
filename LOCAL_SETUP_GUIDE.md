
# Local Setup Guide for Base Care Central Admin Portal

This guide provides instructions for working with the Base Care Central admin portal locally and connecting it to Firebase and Google Maps.

## Setup Steps

### 1. Clone the Repository
```bash
git clone [your-repository-url]
cd base-care-central
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```

### 4. Firebase Configuration
The application is now configured to use your Firebase database with these credentials:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyA1DC-1OJ36uJ7BJDbfisH9r0EuDxSfpCQ",
  authDomain: "doctracker-4f1da.firebaseapp.com",
  projectId: "doctracker-4f1da",
  storageBucket: "doctracker-4f1da.appspot.com",
  messagingSenderId: "852669042127",
  appId: "1:852669042127:web:2ff1811ac22f2ad5fdd6ba"
};
```

### 5. Configure Google Maps
1. Obtain a Google Maps API key from the Google Cloud Console
2. Add the key to the app using the "Configure API Keys" button
3. Or add it manually to localStorage:
```javascript
localStorage.setItem("google_maps_apiKey", "YOUR_GOOGLE_MAPS_API_KEY");
```

## Database Structure

For the admin portal to work properly with your Firebase database, ensure you have the following collections:

### Doctors Collection
Each document should have these fields:
- name: string
- email: string
- phone: string
- specialty: string
- status: "active" | "suspended"
- rating: number
- joinedDate: timestamp or string
- city: string
- lat: number
- lng: number

### Specialties Collection
Each document should have these fields:
- name: string
- description: string
- doctorCount: number

## Project Structure

- `/src/components` - UI components organized by feature
- `/src/pages` - Main application pages
- `/src/lib` - Utility functions and Firebase services
- `/src/data` - Type definitions and interfaces

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
