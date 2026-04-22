import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as puppeteer from 'puppeteer';

// Initialize Firebase Admin
admin.initializeApp();

// Collection name constant
const COLLECTIONS = {
  USERS: 'users',
  LANDING_PAGE_SNAPSHOTS: 'landing_page_snapshots',
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

/**
 * Cloud Function to capture website snapshot
 * Takes a screenshot and extracts section coordinates from the landing page
 */
export const capturePageSnapshot = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https.onCall(async (data, context) => {
    // Validate authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { pageSlug, pageUrl } = data;

    if (!pageSlug || !pageUrl) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'pageSlug and pageUrl are required'
      );
    }

    try {
      console.log(`Capturing snapshot for ${pageSlug} from ${pageUrl}`);

      // Launch headless Chrome
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto(pageUrl, { waitUntil: 'networkidle0', timeout: 60000 });

      // Extract section information
      const snapshot = await page.evaluate(() => {
        const sections = document.querySelectorAll('[data-section-key]');
        const sectionMap = Array.from(sections).map((section) => {
          const rect = section.getBoundingClientRect();
          return {
            key: section.getAttribute('data-section-key'),
            rect: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            },
            html: section.outerHTML
          };
        });

        return {
          html: document.documentElement.outerHTML,
          sections: sectionMap,
          timestamp: Date.now(),
          url: window.location.href
        };
      });

      await browser.close();

      // Save to Firestore
      const snapshotRef = admin
        .firestore()
        .collection(COLLECTIONS.LANDING_PAGE_SNAPSHOTS)
        .doc(pageSlug);

      await snapshotRef.set({
        ...snapshot,
        pageSlug,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: context.auth.uid
      });

      console.log(`Snapshot captured successfully for ${pageSlug}`);

      return {
        success: true,
        pageSlug,
        sectionCount: snapshot.sections.length,
        timestamp: snapshot.timestamp
      };
    } catch (error) {
      console.error('Error capturing snapshot:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to capture page snapshot',
        error
      );
    }
  });
