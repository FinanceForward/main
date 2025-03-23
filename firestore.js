import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase config (replace with your actual credentials)
const firebaseConfig = {
    apiKey: "AIzaSyClsnse44vK0tAFnQJckA5BuFlvh0bpGTo",
    authDomain: "financeforwardmain.firebaseapp.com",
    projectId: "financeforwardmain",
    storageBucket: "financeforwardmain.firebasestorage.app",
    messagingSenderId: "231522398265",
    appId: "1:231522398265:web:9147a7e9f4ffa218b55de8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DB Functions (Only using Firestore SDK functions)
let DB = {
    'user': {
        'create': async (hash) => {
            // Create a new user document in Firestore
            await addDoc(collection(db, "users"), { hash });
        },
        'get': async (hash) => {
            // Query users by hash, return first matching document
            const q = query(collection(db, "users"), where("hash", "==", hash));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                return null; // No user found
            }
            return querySnapshot.docs[0].data(); // Return the first matched document
        },
        'update': async (hash, updates) => {
            // Query for the user with the given hash
            const q = query(collection(db, "users"), where("hash", "==", hash));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;
                // Update the user document with the provided updates
                await updateDoc(docRef, updates);
                return true; // Successfully updated
            }
            return false; // No matching user found
        },
        'exists': async (hash) => {
            // Check if the user with the given hash exists
            const q = query(collection(db, "users"), where("hash", "==", hash));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty; // Returns true if user exists
        },
        'delete': async (hash) => {
            // Query for the user with the given hash
            const q = query(collection(db, "users"), where("hash", "==", hash));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                // Delete the document if it exists
                await deleteDoc(querySnapshot.docs[0].ref);
                return true; // Successfully deleted
            }
            return false; // No matching user found
        }
    },
    'u': {
        'create': async (hash) => {
            // Create and return a new user document ID
            const docRef = await addDoc(collection(db, "users"), { hash });
            return docRef.id; // Return the document ID of the newly created user
        },
        'get': async (hash) => {
            // Query for a user and return the data
            const q = query(collection(db, "users"), where("hash", "==", hash));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                return null; // No user found
            }
            return querySnapshot.docs[0].data(); // Return the first matched document data
        },
        'update': async (hash, updates) => {
            // Query for the user and update their data
            const q = query(collection(db, "users"), where("hash", "==", hash));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;
                await updateDoc(docRef, updates);
                return true; // Successfully updated
            }
            return false; // No matching user found
        },
        'exists': async (hash) => {
            // Check if the user exists
            const q = query(collection(db, "users"), where("hash", "==", hash));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty; // Return true if user exists
        },
        'delete': async (hash) => {
            // Delete a user document
            const q = query(collection(db, "users"), where("hash", "==", hash));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                await deleteDoc(querySnapshot.docs[0].ref);
                return null; // Successfully deleted
            }
            return null; // No matching user found
        }
    },
    'uCompute': {
        'add': async (hash, collectionName, documentName, field, value) => {
            try {
                // Step 1: Query the 'users' collection to find the document with the matching 'hash' field
                const usersRef = collection(db, "users");
                const userQuery = query(usersRef, where("hash", "==", hash));
                const userSnap = await getDocs(userQuery);
        
                if (userSnap.empty) {
                    console.error("User not found with hash:", hash);
                    return false; // No user found
                }
        
                // Step 2: Get the actual user document reference (assuming hash is unique, so taking the first match)
                const userDocRef = userSnap.docs[0].ref;
        
                // Step 3: Reference the subcollection and document inside the found user document
                const subCollectionRef = collection(userDocRef, collectionName);
                const documentRef = doc(subCollectionRef, documentName);
        
                // Step 4: Set the field inside the document (merge to prevent overwriting)
                await setDoc(documentRef, { [field]: value }, { merge: true });
        
                return true; // Successfully added/updated
            } catch (error) {
                console.error("Error adding field:", error);
                return false; // Error occurred
            }
        },

        'get': async (hash, collectionName, documentName, field) => {
            try {
                // Step 1: Query the 'users' collection to find the document with the matching 'hash' field
                const usersRef = collection(db, "users");
                const userQuery = query(usersRef, where("hash", "==", hash));
                const userSnap = await getDocs(userQuery);
        
                if (userSnap.empty) {
                    console.error("User not found with hash:", hash);
                    return null; // User not found
                }
        
                // Step 2: Get the actual user document reference
                const userDocRef = userSnap.docs[0].ref;
        
                // Step 3: Reference the subcollection and document
                const subCollectionRef = collection(userDocRef, collectionName);
                const documentRef = doc(subCollectionRef, documentName);
                
                // Step 4: Get the document
                const docSnap = await getDoc(documentRef);
        
                if (!docSnap.exists()) {
                    console.error("Document not found:", documentName);
                    return null; // Document doesn't exist
                }
        
                // Step 5: Return the specific field (or null if not found)
                return docSnap.data()[field] ?? null;
            } catch (error) {
                console.error("Error getting field:", error);
                return null; // Error occurred
            }
        }
    },
    'runQ': (query) => {
        // Run a custom query (for use with querying data)
        return getDocs(query);
    }
};

let version = "BETA 1.2";

// Export the DB functions for use in the global scope
window.DB = DB;
window.version = version;
export { DB, version };