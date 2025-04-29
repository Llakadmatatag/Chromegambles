/**
 * Firebase configuration for RAINGG project
 */

// Initialize RAINGG Firebase with a custom name
let rainggFirebaseApp;
let rainggDb;

try {
    // Check if firebase is defined
    if (typeof firebase !== 'undefined') {
        // Try to get the existing app first
        try {
            rainggFirebaseApp = firebase.app('raingg');
            console.log('Using existing RAINGG Firebase app');
        } catch (e) {
            // If it doesn't exist, create it
            if (typeof window.getFirebaseConfig === 'function') {
                const rainggFirebaseConfig = window.getFirebaseConfig('raingg');
                rainggFirebaseApp = firebase.initializeApp(rainggFirebaseConfig, 'raingg');
                console.log('RAINGG Firebase app initialized successfully');
            } else {
                console.error('Secure Firebase config not available');
            }
        }

        // Initialize Firestore
        if (rainggFirebaseApp) {
            rainggDb = rainggFirebaseApp.firestore();
            console.log('RAINGG Firestore initialized successfully');
        } else {
            console.error('RAINGG Firebase app initialization failed');
        }
    } else {
        console.error('Firebase SDK not loaded');
    }
} catch (error) {
    console.error('Error initializing RAINGG Firebase:', error);
}

/**
 * Function to securely fetch RAINGG leaderboard data
 * @param {string} docId - Document ID (e.g., '2025-04-29')
 * @param {function} callback - Callback function for data
 * @param {function} errorCallback - Callback function for errors
 * @returns {function} - Unsubscribe function
 */
function getRainggLeaderboardData(docId, callback, errorCallback) {
    try {
        // Check if Firebase was initialized successfully
        if (!rainggDb) {
            console.error('RAINGG Firebase not initialized');
            if (typeof errorCallback === 'function') {
                errorCallback(new Error('RAINGG Firebase not initialized'));
            }
            return () => {};
        }

        console.log(`Fetching RAINGG leaderboard data: ${docId}`);

        // Add debug logging to list all available documents
        rainggDb.collection('leaderboards').get()
            .then(snapshot => {
                console.log(`Available RAINGG leaderboard documents: ${snapshot.docs.map(doc => doc.id).join(', ')}`);

                // If the specified docId doesn't exist, try to use the most recent one
                if (!snapshot.docs.some(doc => doc.id === docId) && snapshot.docs.length > 0) {
                    // Sort documents by ID in descending order (assuming date-based IDs)
                    const sortedDocs = snapshot.docs.sort((a, b) => b.id.localeCompare(a.id));
                    const newDocId = sortedDocs[0].id;
                    console.log(`Document ${docId} not found, using most recent: ${newDocId}`);
                    docId = newDocId;
                }

                // Now get the document
                return rainggDb.collection('leaderboards').doc(docId).get();
            })
            .then(doc => {
                if (!doc.exists) {
                    console.error(`RAINGG document ${docId} does not exist`);
                    if (typeof errorCallback === 'function') {
                        errorCallback(new Error(`Document ${docId} does not exist`));
                    }
                    return;
                }

                // Log the document data structure for debugging
                const data = doc.data();
                console.log(`RAINGG document structure:`, Object.keys(data));

                // Set up the listener
                return rainggDb.collection('leaderboards')
                    .doc(docId)
                    .onSnapshot((doc) => {
                        if (doc.exists) {
                            const data = doc.data();

                            // Debug log the data structure
                            console.log(`RAINGG data structure:`, Object.keys(data));

                            // Check if data has the expected structure
                            if (data.data && Array.isArray(data.data)) {
                                console.log(`RAINGG data array has ${data.data.length} entries`);
                                // Log the first entry structure if available
                                if (data.data.length > 0) {
                                    console.log(`First entry structure:`, Object.keys(data.data[0]));
                                }
                            } else {
                                console.warn(`RAINGG data does not have expected structure`);
                                // Try to adapt to the actual structure
                                const adaptedData = adaptRainggData(data);
                                callback(adaptedData);
                                return;
                            }

                            callback(data);
                        } else {
                            console.error('RAINGG leaderboard document does not exist');
                            if (typeof errorCallback === 'function') {
                                errorCallback(new Error('Document does not exist'));
                            }
                        }
                    }, (error) => {
                        console.error('Error fetching RAINGG leaderboard data:', error);
                        if (typeof errorCallback === 'function') {
                            errorCallback(error);
                        }
                    });
            })
            .catch(error => {
                console.error(`Error checking RAINGG documents:`, error);
                if (typeof errorCallback === 'function') {
                    errorCallback(error);
                }
            });

        // Return a dummy unsubscribe function
        return () => {};
    } catch (error) {
        console.error('Error setting up RAINGG leaderboard listener:', error);
        if (typeof errorCallback === 'function') {
            errorCallback(error);
        }
        return null;
    }
}

/**
 * Adapts RAINGG data to the expected structure
 * @param {Object} data - The raw data from Firestore
 * @returns {Object} - Adapted data with the expected structure
 */
function adaptRainggData(data) {
    // Create a result object with the expected structure
    const result = {
        data: [],
        timestamp: Date.now()
    };

    // Check if data is directly an array
    if (Array.isArray(data)) {
        result.data = data;
        return result;
    }

    // Check if data has numeric keys (0, 1, 2, etc.)
    const numericKeys = Object.keys(data).filter(key => !isNaN(parseInt(key)));
    if (numericKeys.length > 0) {
        // Convert object with numeric keys to array
        result.data = numericKeys.map(key => data[key]);
        return result;
    }

    // Check for other common structures
    if (data.users && Array.isArray(data.users)) {
        result.data = data.users;
        return result;
    }

    if (data.entries && Array.isArray(data.entries)) {
        result.data = data.entries;
        return result;
    }

    if (data.leaderboard && Array.isArray(data.leaderboard)) {
        result.data = data.leaderboard;
        return result;
    }

    // If we can't find a suitable array, create an empty one
    console.warn('Could not adapt RAINGG data to expected structure');
    return result;
}
