/**
 * Firebase Authentication Helper
 * This file provides utility functions for Firebase authentication
 * and handling permissions issues with enhanced security.
 */

// Function to check if Firebase is properly initialized
function isFirebaseInitialized() {
    return typeof firebase !== 'undefined' &&
           firebase.apps &&
           firebase.apps.length > 0;
}

// Function to check if Firestore is available
function isFirestoreAvailable() {
    return isFirebaseInitialized() &&
           typeof firebase.firestore === 'function';
}

// Function to handle Firebase permissions errors
function handleFirebasePermissionsError(error, platform, fallbackCallback) {
    console.error(`Firebase permissions error for ${platform}:`, error);

    // Log detailed error information for debugging
    if (error && error.code) {
        console.log(`Error code: ${error.code}`);
    }

    // Check if this is a permissions error
    const isPermissionsError = error &&
                              (error.code === 'permission-denied' ||
                               (error.message && error.message.toLowerCase().includes('permission')));

    if (isPermissionsError) {
        console.log(`Detected permissions error for ${platform}, using fallback data`);

        // Call the fallback function if provided
        if (typeof fallbackCallback === 'function') {
            fallbackCallback();
        }

        return true; // Indicate that we handled the error
    }

    return false; // Indicate that we did not handle the error
}

// Function to apply optimal Firestore settings for permissions and security
function applyOptimalFirestoreSettings(db) {
    if (!db || typeof db.settings !== 'function') {
        console.error('Invalid Firestore instance provided');
        return false;
    }

    try {
        // Apply settings that help with permissions issues
        db.settings({
            ignoreUndefinedProperties: true,
            merge: true,
            experimentalForceLongPolling: true,
            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
        });

        console.log('Applied optimal Firestore settings for permissions');
        return true;
    } catch (error) {
        console.error('Error applying Firestore settings:', error);
        return false;
    }
}

// Function to securely authenticate with Firebase
function secureAuthenticate(app, authType = 'anonymous') {
    if (!app || typeof app.auth !== 'function') {
        console.error('Invalid Firebase app instance provided');
        return Promise.reject(new Error('Invalid Firebase app instance'));
    }

    try {
        const auth = app.auth();

        // Set persistence to session only for security
        return auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
            .then(() => {
                if (authType === 'anonymous') {
                    return auth.signInAnonymously();
                } else {
                    return Promise.reject(new Error('Unsupported auth type'));
                }
            })
            .then(userCredential => {
                console.log('Authentication successful');
                return userCredential.user;
            })
            .catch(error => {
                console.error('Authentication error:', error);
                throw error;
            });
    } catch (error) {
        console.error('Error in secureAuthenticate:', error);
        return Promise.reject(error);
    }
}

// Function to validate Firebase data
function validateFirebaseData(data, schema = {}) {
    if (!data) {
        return false;
    }

    try {
        // Simple schema validation
        for (const [key, type] of Object.entries(schema)) {
            if (type === 'string' && typeof data[key] !== 'string') {
                return false;
            } else if (type === 'number' && typeof data[key] !== 'number') {
                return false;
            } else if (type === 'boolean' && typeof data[key] !== 'boolean') {
                return false;
            } else if (type === 'array' && !Array.isArray(data[key])) {
                return false;
            } else if (type === 'object' && (typeof data[key] !== 'object' || data[key] === null || Array.isArray(data[key]))) {
                return false;
            }
        }

        return true;
    } catch (error) {
        console.error('Error validating Firebase data:', error);
        return false;
    }
}

// Function to securely fetch data from Firestore
function secureFirestoreFetch(db, collection, document, options = {}) {
    if (!db || typeof db.collection !== 'function') {
        console.error('Invalid Firestore instance provided');
        return Promise.reject(new Error('Invalid Firestore instance'));
    }

    // Sanitize inputs
    const sanitizedCollection = typeof collection === 'string' ? collection.trim() : '';
    const sanitizedDocument = typeof document === 'string' ? document.trim() : '';

    if (!sanitizedCollection) {
        return Promise.reject(new Error('Invalid collection path'));
    }

    try {
        let query = db.collection(sanitizedCollection);

        if (sanitizedDocument) {
            return query.doc(sanitizedDocument).get()
                .then(doc => {
                    if (!doc.exists) {
                        console.log(`Document ${sanitizedDocument} does not exist`);
                        return null;
                    }

                    const data = doc.data();

                    // Validate data if schema is provided
                    if (options.schema && !validateFirebaseData(data, options.schema)) {
                        console.warn('Data validation failed for document:', sanitizedDocument);
                    }

                    return data;
                })
                .catch(error => {
                    console.error('Error fetching document:', error);
                    throw error;
                });
        } else {
            // Apply query options
            if (options.where && Array.isArray(options.where)) {
                options.where.forEach(condition => {
                    if (Array.isArray(condition) && condition.length === 3) {
                        query = query.where(condition[0], condition[1], condition[2]);
                    }
                });
            }

            if (options.orderBy) {
                query = query.orderBy(options.orderBy, options.orderDirection || 'asc');
            }

            if (options.limit && typeof options.limit === 'number') {
                query = query.limit(options.limit);
            }

            return query.get()
                .then(snapshot => {
                    if (snapshot.empty) {
                        console.log('No documents found in collection');
                        return [];
                    }

                    const results = [];

                    snapshot.forEach(doc => {
                        const data = doc.data();

                        // Validate data if schema is provided
                        if (options.schema && !validateFirebaseData(data, options.schema)) {
                            console.warn('Data validation failed for document:', doc.id);
                        }

                        results.push({
                            id: doc.id,
                            ...data
                        });
                    });

                    return results;
                })
                .catch(error => {
                    console.error('Error fetching collection:', error);
                    throw error;
                });
        }
    } catch (error) {
        console.error('Error in secureFirestoreFetch:', error);
        return Promise.reject(error);
    }
}

// Export functions for use in other files
window.firebaseAuthHelper = {
    isFirebaseInitialized,
    isFirestoreAvailable,
    handleFirebasePermissionsError,
    applyOptimalFirestoreSettings,
    secureAuthenticate,
    validateFirebaseData,
    secureFirestoreFetch
};
