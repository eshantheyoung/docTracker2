// src/data/mockData.ts

// Define the structure for a Doctor document fetched from Firestore
export interface Doctor {
  id: string; // Firestore document ID
  name: string;
  email: string;
  phone: string;
  specialty: string;
  rating: number;
  status: "active" | "suspended"; // Assuming these are the possible statuses
  image: string; // URL of the profile image
  joinedDate: string; // Assuming date is stored as a string (e.g., ISO format)

  // Location is stored as a nested object in Firestore
  location: {
    address: string; // The address string (e.g., city or full address)
    coordinates: {
      lat: number; // Latitude
      lng: number; // Longitude
    };
  };

  // Add other potential fields that might be in your Firestore documents
  // createdAt?: firebase.firestore.Timestamp; // If you store timestamps
  // updatedAt?: firebase.firestore.Timestamp;
  // city?: string; // If you still store city separately in Firestore
}

// Define the structure for a Specialty document fetched from Firestore
export interface Specialty {
  id: string; // Firestore document ID
  name: string;
  doctorCount: number; // Number of doctors in this specialty
  description: string; // Description of the specialty

  // Add other potential fields
  // createdAt?: firebase.firestore.Timestamp;
}

// Define the structure for a Report document
export interface Report {
  id: string;
  name: string;
  date: string; // Assuming date is stored as a string
  type: string; // e.g., "PDF", "Excel"
  downloadUrl: string; // URL to download the report
}

// --- Removed mock data arrays (mockDoctors, mockSpecialties, mockReports) ---
// Data will now be fetched directly from Firebase Firestore.

// You might still export empty arrays or null if components expect an initial value before fetching
// export const mockDoctors: Doctor[] = [];
// export const mockSpecialties: Specialty[] = [];
// export const mockReports: Report[] = [];

// Or simply remove the exports of the mock data arrays entirely if they are no longer used.
// The interfaces (Doctor, Specialty, Report) are the important part to keep.
