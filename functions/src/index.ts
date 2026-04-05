import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Collection name constant
const COLLECTIONS = {
  USERS: 'users',
};

/**
 * Cloud Function to check if a phone number is registered
 * This runs with admin privileges, bypassing Firestore security rules
 */
export const checkPhoneNumberRegistered = functions.https.onCall(
  async (data, context) => {
    // Validate input
    const phoneNumber = data.phoneNumber;

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Phone number is required and must be a string'
      );
    }

    try {
      // Query Firestore for the phone number
      const usersRef = admin.firestore().collection(COLLECTIONS.USERS);
      const querySnapshot = await usersRef
        .where('phoneNumber', '==', phoneNumber)
        .limit(1)
        .get();

      // Return whether the phone number is registered
      return {
        isRegistered: !querySnapshot.empty,
      };
    } catch (error) {
      console.error('Error checking phone number:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to check phone number registration',
        error
      );
    }
  }
);
