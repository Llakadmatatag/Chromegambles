/**
 * Firebase configuration for XFUN project
 */

// Initialize XFUN Firebase with a custom name
let xfunFirebaseApp;
let xfunDb;

try {
    // Check if firebase is defined
    if (typeof firebase !== 'undefined') {
        // Try to get the existing app first
        try {
            xfunFirebaseApp = firebase.app('xfun');
            console.log('Using existing XFUN Firebase app');
        } catch (e) {
            // If it doesn't exist, create it
            if (typeof window.getFirebaseConfig === 'function') {
                const xfunFirebaseConfig = window.getFirebaseConfig('xfun');
                xfunFirebaseApp = firebase.initializeApp(xfunFirebaseConfig, 'xfun');
                console.log('XFUN Firebase app initialized successfully');
            } else {
                console.error('Secure Firebase config not available');
            }
        }

        // Initialize Firestore
        if (xfunFirebaseApp) {
            xfunDb = xfunFirebaseApp.firestore();
            console.log('XFUN Firestore initialized successfully');
        } else {
            console.error('XFUN Firebase app initialization failed');
        }
    } else {
        console.error('Firebase SDK not loaded');
    }
} catch (error) {
    console.error('Error initializing XFUN Firebase:', error);
}

/**
 * Function to securely fetch XFUN leaderboard data
 * @param {string} docId - Document ID (e.g., 'april-2025')
 * @param {string} collection - Collection name (e.g., 'entries')
 * @param {string} orderBy - Field to order by (e.g., 'wagered')
 * @param {function} callback - Callback function for data
 * @param {function} errorCallback - Callback function for errors
 * @returns {function} - Unsubscribe function
 */
function getXfunLeaderboardData(docId, collection, orderBy, callback, errorCallback) {
    try {
        // Check if Firebase was initialized successfully
        if (!xfunDb) {
            console.error('XFUN Firebase not initialized');
            if (typeof errorCallback === 'function') {
                errorCallback(new Error('XFUN Firebase not initialized'));
            }
            return () => {};
        }

        console.log(`Fetching XFUN leaderboard data: ${docId}/${collection} ordered by ${orderBy}`);

        // Add debug logging
        xfunDb.collection('leaderboards').get()
            .then(snapshot => {
                console.log(`Available XFUN leaderboard documents: ${snapshot.docs.map(doc => doc.id).join(', ')}`);
            })
            .catch(err => console.error('Error listing XFUN documents:', err));

        // Get the document first to check if it exists
        xfunDb.collection('leaderboards').doc(docId).get()
            .then(doc => {
                if (!doc.exists) {
                    console.error(`XFUN document ${docId} does not exist`);
                    if (typeof errorCallback === 'function') {
                        errorCallback(new Error(`Document ${docId} does not exist`));
                    }
                    return;
                }

                console.log(`XFUN document ${docId} exists, checking for collection ${collection}`);

                // Now set up the listener
                return xfunDb.collection('leaderboards')
                    .doc(docId)
                    .collection(collection)
                    .orderBy(orderBy, 'desc')
                    .onSnapshot(callback, (error) => {
                        console.error('Error fetching XFUN leaderboard data:', error);
                        if (typeof errorCallback === 'function') {
                            errorCallback(error);
                        }
                    });
            })
            .catch(error => {
                console.error(`Error checking XFUN document ${docId}:`, error);
                if (typeof errorCallback === 'function') {
                    errorCallback(error);
                }
            });

        // Return a dummy unsubscribe function
        return () => {};
    } catch (error) {
        console.error('Error setting up XFUN leaderboard listener:', error);
        if (typeof errorCallback === 'function') {
            errorCallback(error);
        }
        return null;
    }
}
