import * as admin from "firebase-admin";
import type { UserRole } from "../../../../lib/types";
import * as functions from "firebase-functions";
import { verifyKiloToken } from "../../../../lib/jwt-utils";

const db = admin.firestore();

/**
 * Recursively deletes all documents in a collection.
 * @param {string} collectionPath - The path to the collection to delete.
 * @param {number} batchSize - The number of documents to delete per batch.
 */
export const deleteCollectionByPath = async (collectionPath: string, batchSize: number = 100): Promise<void> => {
  const collectionRef = db.collection(collectionPath);
  
  const query = collectionRef.limit(batchSize);
  
  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
};

async function deleteQueryBatch(query: admin.firestore.Query, resolve: () => void) {
  const snapshot = await query.get();
  
  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }
  
  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  
  // Recurse on the next process tick, to avoid exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

/**
 * Helper function to get a user's role from Firestore.
 * This is not a callable function, but a utility for other backend functions.
 * @param {string | undefined} uid The user's ID.
 * @return {Promise<UserRole | null>} The user's role or null if not found.
 */
export async function getRole(uid: string | undefined): Promise<UserRole | null> {
  if (!uid) {
    return null;
  }
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    const role = userDoc.data()?.primaryRole;
    return role ? (role as UserRole) : null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}

/**
 * Helper function to get a user's document from Firestore.
 * This is not a callable function, but a utility for other backend functions.
 * @param {string} uid The user's ID.
 * @return {Promise<FirebaseFirestore.DocumentSnapshot | null>} The user's document snapshot or null if not found.
 */
export async function getUserDocument(
  uid: string,
): Promise<admin.firestore.DocumentSnapshot | null> {
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    return userDoc.exists ? userDoc : null;
  } catch (error) {
    console.error("Error getting user document:", error);
    return null;
  }
}

/**
 * Checks if the user is authenticated.
 * This function first checks for Firebase Authentication tokens,
 * and if not found, checks for a JWT token in a custom header.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {string} The user's UID.
 * @throws {functions.https.HttpsError} Throws an error if the user is not authenticated.
 */
export const checkAuth = (context: functions.https.CallableContext): string => {
  // First, check for Firebase Authentication tokens
  if (context.auth) {
    return context.auth.uid;
  }
  
  // If not found, check for a JWT token in a custom header
  // This is for compatibility with systems that use JWT tokens
  const jwtToken = context.rawRequest?.headers['x-kilo-token'];
  if (jwtToken && typeof jwtToken === 'string') {
    const decodedToken = verifyKiloToken(jwtToken);
    if (decodedToken && decodedToken.kiloUserId) {
      return decodedToken.kiloUserId;
    }
  }
  
  // If neither authentication method is found, throw an error
  throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
};
