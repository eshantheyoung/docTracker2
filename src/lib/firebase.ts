// src/lib/firebase.js (or .ts)
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth"; // Import Auth type
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp,
  Firestore // Import Firestore type
} from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage"; // Import FirebaseStorage type
// Assuming Doctor and Specialty types are still needed for Firestore interactions
import { Doctor, Specialty } from "@/data/mockData";


// Your web app's Firebase configuration
// Using environment variables provided by Vite (prefixed with VITE_)
// This configuration is read directly from your .env.local file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // Uncomment the line below if you have a measurement ID in your .env.local
  // measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Declare and export variables using 'export let' at the top level
// Initialize them to undefined or null
export let app: ReturnType<typeof initializeApp> | undefined = undefined;
export let auth: Auth | undefined = undefined;
export let db: Firestore | undefined = undefined;
export let storage: FirebaseStorage | undefined = undefined;

try {
  // Basic check to ensure essential config is present from environment variables
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
    console.error("Firebase configuration is incomplete. Please ensure VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, and VITE_FIREBASE_APP_ID are set in your .env.local file.");
    // Variables remain undefined if config is missing
  } else {
    // Check if a Firebase app instance already exists
    // This is important for preventing errors in development with hot-reloading
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      console.log("Firebase app initialized from environment variables.");
    } else {
      app = getApp(); // Get the existing app instance
      console.log("Using existing Firebase app instance.");
    }

    // Assign values to the variables declared above
    // DO NOT use 'let', 'const', or 'var' here again, just assignment
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app); // Initialize and export the storage instance
    console.log("Firebase services initialized successfully.");
  }

} catch (error) {
  console.error("Error initializing Firebase:", error);
  // Log the config used (without exposing full keys) for debugging
  console.error("Config used:", {
    projectId: firebaseConfig.projectId,
    apiKey: firebaseConfig.apiKey ? "******" : "Missing", // Mask API Key
    authDomain: firebaseConfig.authDomain,
    storageBucket: firebaseConfig.storageBucket,
    appId: firebaseConfig.appId,
    // Add other non-sensitive or masked fields as needed for debugging
  });
}

// --- Firestore interaction functions ---
// These functions now check if 'db' and 'storage' are initialized before use.

/**
 * Fetch all doctors from Firestore
 * @returns {Promise<Doctor[]>} - Array of doctor objects
 */
export const fetchDoctors = async (): Promise<Doctor[]> => {
  // Ensure db is initialized before use
  if (!db) {
    console.error("Firestore not initialized. Cannot fetch doctors.");
    // Depending on your app's flow, you might throw an error or return empty
    // throw new Error("Firestore not initialized.");
    return [];
  }
  try {
    const doctorsCollection = collection(db, "doctors");
    const snapshot = await getDocs(doctorsCollection);

    console.log("Raw doctors data from Firestore:", snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    // Map the Firestore documents to Doctor objects
    // Ensure this mapping matches your Doctor interface in mockData.ts
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "Unknown",
        email: data.email || "",
        phone: data.phone || "",
        specialty: data.specialty || "",
        status: (data.status as "active" | "suspended") || "active",
        rating: data.rating || 0,
        joinedDate: data.joinedDate || new Date().toISOString(),
        // Map nested location object
        location: {
          address: data.location?.address || "",
          coordinates: {
            lat: data.location?.coordinates?.lat || 0,
            lng: data.location?.coordinates?.lng || 0,
          }
        },
        image: data.image || ""
      } as Doctor; // Cast to Doctor type
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return [];
  }
};

/**
 * Fetch all specialties from Firestore
 * @returns {Promise<Specialty[]>} - Array of specialty objects
 */
export const fetchSpecialties = async (): Promise<Specialty[]> => {
   // Ensure db is initialized before use
  if (!db) {
    console.error("Firestore not initialized. Cannot fetch specialties.");
    // throw new Error("Firestore not initialized.");
    return [];
  }
  try {
    console.log("Starting to fetch specialties from Firestore");
    // Changed collection name from "specialties" to "specialty" based on previous code
    const specialtiesCollection = collection(db, "specialty");
    const snapshot = await getDocs(specialtiesCollection);

    console.log("Raw specialties data:", snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    // Map the Firestore documents to Specialty objects
    // Refined mapping: Ensure name is a non-empty string
    const result = snapshot.docs.map(doc => {
      const data = doc.data();
      // Explicitly check if data.name is a non-empty string after trimming
      const specialtyName = typeof data.name === 'string' && data.name.trim() !== '' ? data.name.trim() : "Unknown Specialty";
      return {
        id: doc.id,
        name: specialtyName, // Use the guaranteed non-empty name
        doctorCount: data.doctorCount || 0,
        description: data.description || ""
      } as Specialty; // Cast to Specialty type
    });

    console.log("Processed specialties data:", result);
    return result;
  } catch (error) {
    console.error("Error fetching specialties:", error);
    return [];
  }
};

/**
 * Get or create a specialty by name
 * @param {string} specialtyName - The name of the specialty
 * @returns {Promise<string>} - The ID of the specialty
 */
const getOrCreateSpecialty = async (specialtyName: string): Promise<string> => {
   // Ensure db is initialized before use
  if (!db) {
    console.error("Firestore not initialized. Cannot get or create specialty.");
    throw new Error("Firestore not initialized.");
  }
  try {
    // Try to find an existing specialty with this name
    const specialtiesCollection = collection(db, "specialty");
    // Note: For large collections, fetching all docs and filtering in client is inefficient.
    // A query with `where("name", "==", specialtyName)` would be better if Firestore rules permit.
    const snapshot = await getDocs(specialtiesCollection);

    const existingSpecialty = snapshot.docs.find(
      doc => doc.data().name?.toLowerCase() === specialtyName.toLowerCase() // Use optional chaining and toLowerCase safely
    );

    if (existingSpecialty) {
      console.log(`Found existing specialty: ${existingSpecialty.id}`);
      return existingSpecialty.id;
    }

    // If not found, create a new one
    const specialtyDocRef = doc(specialtiesCollection); // Auto-generate ID
    const newSpecialtyData = {
      name: specialtyName,
      doctorCount: 1, // Start count at 1 for the new doctor
      description: "", // Default description
      createdAt: serverTimestamp() // Add server timestamp
    };
    await setDoc(specialtyDocRef, newSpecialtyData);
    console.log(`Created new specialty: ${specialtyDocRef.id}`);

    return specialtyDocRef.id;
  } catch (error) {
    console.error("Error in getOrCreateSpecialty:", error);
    throw error; // Re-throw to propagate the error
  }
};

/**
 * Increment specialty count by name
 * @param {string} specialtyName - The name of the specialty to increment
 */
const incrementSpecialtyCount = async (specialtyName: string): Promise<void> => {
   // Ensure db is initialized before use
  if (!db) {
    console.error("Firestore not initialized. Cannot increment specialty count.");
    throw new Error("Firestore not initialized.");
  }
  try {
    // Find the specialty by name
    const specialtiesCollection = collection(db, "specialty");
     // Again, a query would be more efficient here
    const snapshot = await getDocs(specialtiesCollection);

    const existingSpecialtyDoc = snapshot.docs.find(
      doc => doc.data().name?.toLowerCase() === specialtyName.toLowerCase()
    );

    if (existingSpecialtyDoc) {
      // Increment the counter
      const specialtyRef = doc(db, "specialty", existingSpecialtyDoc.id);
      await updateDoc(specialtyRef, {
        doctorCount: increment(1) // Use Firestore's increment
      });
      console.log(`Incremented count for specialty: ${specialtyName}`);
    } else {
      // If not found, create a new specialty with count 1
      console.log(`Specialty not found, creating and setting count to 1: ${specialtyName}`);
      await getOrCreateSpecialty(specialtyName); // getOrCreateSpecialty already sets count to 1
    }
  } catch (error) {
    console.error("Error incrementing specialty count:", error);
    throw error;
  }
};

/**
 * Decrement specialty count by name
 * @param {string} specialtyName - The name of the specialty to decrement
 */
const decrementSpecialtyCount = async (specialtyName: string): Promise<void> => {
   // Ensure db is initialized before use
  if (!db) {
    console.error("Firestore not initialized. Cannot decrement specialty count.");
    throw new Error("Firestore not initialized.");
  }
  try {
    // Find the specialty by name
    const specialtiesCollection = collection(db, "specialty");
     // Again, a query would be more efficient here
    const snapshot = await getDocs(specialtiesCollection);

    const existingSpecialtyDoc = snapshot.docs.find(
      doc => doc.data().name?.toLowerCase() === specialtyName.toLowerCase()
    );

    if (existingSpecialtyDoc) {
      const specialtyRef = doc(db, "specialty", existingSpecialtyDoc.id);
      const currentDocSnap = await getDoc(specialtyRef);
      const currentData = currentDocSnap.data();

      if (currentData && typeof currentData.doctorCount === 'number' && currentData.doctorCount > 1) {
        // Decrement the counter if > 1
        await updateDoc(specialtyRef, {
          doctorCount: increment(-1) // Use Firestore's increment
        });
        console.log(`Decremented count for specialty: ${specialtyName}`);
      } else {
        // Delete the specialty if count is 1 or less (or not a valid number)
        await deleteDoc(specialtyRef);
        console.log(`Deleted specialty (count <= 1 or invalid): ${specialtyName}`);
      }
    } else {
       console.warn(`Attempted to decrement count for non-existent specialty: ${specialtyName}`);
       // Optionally throw an error or log differently if this indicates a data inconsistency
    }
  } catch (error) {
    console.error("Error decrementing specialty count:", error);
    throw error;
  }
};

/**
 * Add a new doctor to Firestore
 * @param {Omit<Doctor, "id" | "rating" | "joinedDate">} doctorData - The doctor data to add (excluding auto-generated fields)
 * @returns {Promise<string>} - The ID of the new doctor
 */
export const addDoctor = async (doctorData: Omit<Doctor, "id" | "rating" | "joinedDate">): Promise<string> => {
   // Ensure db is initialized before use
  if (!db) {
    console.error("Firestore not initialized. Cannot add doctor.");
    throw new Error("Firestore not initialized.");
  }
  try {
    const doctorsCollection = collection(db, "doctors");
    const docRef = doc(doctorsCollection); // Auto-generate ID

    // Prepare data, ensuring required fields and adding defaults/timestamps
    const docData = {
      ...doctorData,
      // Ensure location coordinates are numbers and structure is correct
      location: {
         address: doctorData.location?.address || "",
         coordinates: {
            lat: typeof doctorData.location?.coordinates?.lat === 'number' ? doctorData.location.coordinates.lat : 0,
            lng: typeof doctorData.location?.coordinates?.lng === 'number' ? doctorData.location.coordinates.lng : 0,
         }
      },
      status: doctorData.status || "active", // Default status if not provided
      rating: 0, // New doctors start with rating 0
      joinedDate: new Date().toISOString(), // Set joined date to now
      createdAt: serverTimestamp() // Add server timestamp
    };

    await setDoc(docRef, docData);
    console.log("Added new doctor with ID:", docRef.id);

    // Increment specialty count if a specialty is provided
    if (doctorData.specialty) {
      await incrementSpecialtyCount(doctorData.specialty);
    }

    return docRef.id;
  } catch (error) {
    console.error("Error adding doctor:", error);
    throw error; // Re-throw to propagate the error
  }
};

/**
 * Update a doctor in Firestore
 * @param {string} id - The ID of the doctor to update
 * @param {Partial<Omit<Doctor, "id" | "rating" | "joinedDate">>} updatedData - The updated doctor data (partial update allowed)
 */
export const updateDoctor = async (id: string, updatedData: Partial<Omit<Doctor, "id" | "rating" | "joinedDate">>): Promise<void> => {
   // Ensure db is initialized before use
  if (!db) {
    console.error("Firestore not initialized. Cannot update doctor.");
    throw new Error("Firestore not initialized.");
  }
  try {
    const docRef = doc(db, "doctors", id);
    const currentDocSnap = await getDoc(docRef);

    if (!currentDocSnap.exists()) {
        console.error(`Doctor with ID ${id} not found for update.`);
        throw new Error("Doctor not found.");
    }

    const currentData = currentDocSnap.data();

    // If specialty is changing, handle specialty counts
    if (updatedData.specialty && currentData && currentData.specialty !== updatedData.specialty) {
      // Decrement old specialty count (if the old specialty existed)
      if (currentData.specialty) {
         await decrementSpecialtyCount(currentData.specialty);
      }

      // Increment new specialty count
      await incrementSpecialtyCount(updatedData.specialty);
      console.log(`Specialty changed from ${currentData.specialty} to ${updatedData.specialty} for doctor ${id}`);
    }

     // Ensure location coordinates are numbers if being updated and structure is correct
     const locationUpdate = updatedData.location ? {
         location: {
             ...currentData?.location, // Keep existing location fields if not updated
             ...updatedData.location, // Apply updated location fields
              coordinates: {
                ...currentData?.location?.coordinates, // Keep existing coordinates if not updated
                ...(updatedData.location.coordinates ? {
                     lat: typeof updatedData.location.coordinates.lat === 'number' ? updatedData.location.coordinates.lat : (currentData?.location?.coordinates?.lat || 0),
                     lng: typeof updatedData.location.coordinates.lng === 'number' ? updatedData.location.coordinates.lng : (currentData?.location?.coordinates?.lng || 0),
                } : {}) // Apply updated coordinates if provided
             }
         }
     } : {};


    // Prepare update data, adding timestamp
    const dataToUpdate = {
      ...updatedData,
      ...locationUpdate, // Include processed location update
      updatedAt: serverTimestamp() // Add server timestamp
    };

    await updateDoc(docRef, dataToUpdate);
    console.log("Updated doctor with ID:", id);

  } catch (error) {
    console.error("Error updating doctor:", error);
    throw error; // Re-throw to propagate the error
  }
};

/**
 * Delete a doctor from Firestore
 * @param {string} id - The ID of the doctor to delete
 */
export const deleteDoctor = async (id: string): Promise<void> => {
   // Ensure db is initialized before use
  if (!db) {
    console.error("Firestore not initialized. Cannot delete doctor.");
    throw new Error("Firestore not initialized.");
  }
  try {
    // Get the doctor data first to get the specialty
    const docRef = doc(db, "doctors", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const doctorData = docSnap.data();

      // Delete the doctor document
      await deleteDoc(docRef);
      console.log("Deleted doctor with ID:", id);

      // Decrement specialty count if the doctor had a specialty
      if (doctorData.specialty) {
        await decrementSpecialtyCount(doctorData.specialty);
      }
    } else {
      console.warn(`Attempted to delete non-existent doctor with ID: ${id}`);
      // Optionally throw an error or handle differently
      // throw new Error("Doctor not found");
    }
  } catch (error) {
    console.error("Error deleting doctor:", error);
    throw error; // Re-throw to propagate the error
  }
};

/**
 * Add a new specialty to Firestore
 * @param {Omit<Specialty, "id" | "doctorCount">} specialtyData - The specialty data to add (excluding auto-generated fields)
 * @returns {Promise<string>} - The ID of the new specialty
 */
export const addSpecialty = async (specialtyData: Omit<Specialty, "id" | "doctorCount">): Promise<string> => {
   // Ensure db is initialized before use
  if (!db) {
    console.error("Firestore not initialized. Cannot add specialty.");
    throw new Error("Firestore not initialized.");
  }
  try {
    // Changed collection name from "specialties" to "specialty"
    const specialtiesCollection = collection(db, "specialty");
    const docRef = doc(specialtiesCollection); // Auto-generate ID

    // Prepare data, adding defaults/timestamps
    const docData = {
        ...specialtyData,
        name: specialtyData.name || "New Specialty", // Ensure name exists
        description: specialtyData.description || "", // Ensure description exists
        doctorCount: 0, // New specialties start with count 0 (unless created via getOrCreateSpecialty)
        createdAt: serverTimestamp() // Add server timestamp
    };

    await setDoc(docRef, docData);
    console.log("Added new specialty with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding specialty:", error);
    throw error; // Re-throw to propagate the error
  }
};

/**
 * Update a specialty in Firestore
 * @param {string} id - The ID of the specialty to update
 * @param {Partial<Omit<Specialty, "id" | "doctorCount">>} updatedData - The updated specialty data (partial update allowed)
 */
export const updateSpecialty = async (id: string, updatedData: Partial<Omit<Specialty, "id" | "doctorCount">>): Promise<void> => {
   // Ensure db is initialized before use
  if (!db) {
    console.error("Firestore not initialized. Cannot update specialty.");
    throw new Error("Firestore not initialized.");
  }
  try {
    // Changed collection name from "specialties" to "specialty"
    const docRef = doc(db, "specialty", id);
     const currentDocSnap = await getDoc(docRef);

    if (!currentDocSnap.exists()) {
        console.error(`Specialty with ID ${id} not found for update.`);
        throw new Error("Specialty not found.");
    }

    // Prepare update data, adding timestamp
    const dataToUpdate = {
      ...updatedData,
      updatedAt: serverTimestamp() // Add server timestamp
    };

    await updateDoc(docRef, dataToUpdate);
    console.log("Updated specialty with ID:", id);
  } catch (error) {
    console.error("Error updating specialty:", error);
    throw error; // Re-throw to propagate the error
  }
};

/**
 * Delete a specialty from Firestore
 * @param {string} id - The ID of the specialty to delete
 */
export const deleteSpecialty = async (id: string): Promise<void> => {
   // Ensure db is initialized before use
  if (!db) {
    console.error("Firestore not initialized. Cannot delete specialty.");
    throw new Error("Firestore not initialized.");
  }
  try {
    // Changed collection name from "specialties" to "specialty"
    const docRef = doc(db, "specialty", id);
    const docSnap = await getDoc(docRef);

     if (!docSnap.exists()) {
        console.warn(`Attempted to delete non-existent specialty with ID: ${id}`);
        // Optionally throw an error or handle differently
        // throw new Error("Specialty not found");
        return; // Exit if not found
    }

    // Note: Deleting a specialty here does NOT automatically update doctors referencing it.
    // You might need additional logic to handle doctors whose specialty is deleted (e.g., set specialty to null/empty).

    await deleteDoc(docRef);
    console.log("Deleted specialty with ID:", id);
  } catch (error) {
    console.error("Error deleting specialty:", error);
    throw error; // Re-throw to propagate the error
  }
};
