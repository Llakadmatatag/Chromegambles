/**
 * Simple Leaderboard
 * A simplified version of the leaderboard that directly uses Firebase
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Simple leaderboard script loaded');

    // Add click handlers to the leaderboard tabs with enhanced security
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', function(event) {
            // Prevent default behavior
            event.preventDefault();

            // Verify the event target is legitimate
            if (event.currentTarget !== tab) {
                console.warn('Suspicious event target detected');
                return;
            }

            // Sanitize the platform value
            const platform = sanitize.escapeHTML(this.dataset.tab || '');
            if (!platform || (platform !== 'xfun' && platform !== 'raingg')) {
                console.warn('Invalid platform:', platform);
                return;
            }

            console.log(`Tab clicked: ${platform}`);

            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');

            // Hide all content
            document.querySelectorAll('.leaderboard-content').forEach(content => {
                content.classList.remove('active');
            });

            // Show selected content - use getElementById for safety
            const content = document.getElementById(platform);
            if (content) {
                content.classList.add('active');

                // Load data for the selected platform
                loadLeaderboardData(platform);
            }
        });
    });

    // Check if Firebase is already ready
    if (window.xfunDb && window.rainggDb) {
        console.log('Firebase is already initialized, loading default data');
        loadLeaderboardData('xfun');
    } else {
        console.log('Waiting for Firebase to be ready...');
        // Show loading message
        showLoadingMessage('xfun');
        showLoadingMessage('raingg');
    }
});

// Listen for the firebase-ready event
document.addEventListener('firebase-ready', function() {
    console.log('Firebase ready event received, loading default data');
    loadLeaderboardData('xfun');
});

/**
 * Show loading message in the leaderboard containers
 * @param {string} platform - The platform (xfun, raingg)
 */
function showLoadingMessage(platform) {
    const topContainer = document.getElementById(`${platform}-top-winners`);
    const otherContainer = document.getElementById(`${platform}-other-winners`);

    // Create loading message elements using sanitize utility
    if (topContainer) {
        // Clear existing content
        while (topContainer.firstChild) {
            topContainer.removeChild(topContainer.firstChild);
        }

        const loadingDiv = sanitize.createSafeElement('div', {
            'class': 'loading-message'
        });

        const spinner = sanitize.createSafeElement('i', {
            'class': 'fas fa-spinner fa-spin'
        });

        loadingDiv.appendChild(spinner);
        loadingDiv.appendChild(document.createTextNode(' Loading leaderboard data...'));

        topContainer.appendChild(loadingDiv);
    }

    if (otherContainer) {
        // Clear existing content
        while (otherContainer.firstChild) {
            otherContainer.removeChild(otherContainer.firstChild);
        }

        const loadingDiv = sanitize.createSafeElement('div', {
            'class': 'loading-message'
        });

        const spinner = sanitize.createSafeElement('i', {
            'class': 'fas fa-spinner fa-spin'
        });

        loadingDiv.appendChild(spinner);
        loadingDiv.appendChild(document.createTextNode(' Loading leaderboard data...'));

        otherContainer.appendChild(loadingDiv);
    }
}

/**
 * Load leaderboard data for the specified platform
 * @param {string} platform - The platform to load data for (xfun, raingg)
 */
function loadLeaderboardData(platform) {
    console.log(`Loading leaderboard data for ${platform}`);

    // Show loading message
    showLoadingMessage(platform);

    // Create mock data for RAINGG only as fallback
    const mockRainggData = [
        { username: 'RainPlayer1', wagered_: 45000, avatar: '', id: '1' },
        { username: 'RainPlayer2', wagered_: 37500, avatar: '', id: '2' },
        { username: 'RainPlayer3', wagered_: 30000, avatar: '', id: '3' },
        { username: 'RainPlayer4', wagered_: 22500, avatar: '', id: '4' },
        { username: 'RainPlayer5', wagered_: 18000, avatar: '', id: '5' },
        { username: 'RainPlayer6', wagered_: 15000, avatar: '', id: '6' },
        { username: 'RainPlayer7', wagered_: 12000, avatar: '', id: '7' },
        { username: 'RainPlayer8', wagered_: 9000, avatar: '', id: '8' },
        { username: 'RainPlayer9', wagered_: 7500, avatar: '', id: '9' },
        { username: 'RainPlayer10', wagered_: 6000, avatar: '', id: '10' }
    ];

    // Check if Firebase is available
    if (!window.xfunDb || !window.rainggDb) {
        console.error('Firebase is not initialized yet');
        setTimeout(() => {
            if (window.xfunDb && window.rainggDb) {
                console.log('Firebase is now available, retrying...');
                loadLeaderboardData(platform);
            } else {
                showNoDataMessage(platform, 'Firebase is not available. Please refresh the page and try again.');
            }
        }, 2000);
        return;
    }

    // Check which platform to load
    if (platform === 'xfun') {
        // For XFUN, use Firebase as it's working correctly
        loadXfunData();
    } else if (platform === 'raingg') {
        // For RAINGG, try to use Firebase with the updated security rules
        // but fall back to mock data if needed
        loadRainggData(mockRainggData);
    } else {
        showNoDataMessage(platform);
    }
}

/**
 * Shows the last updated time for a leaderboard
 * @param {string} platform - The platform (xfun, raingg)
 * @param {string} source - The source of the data (document ID, etc.)
 */
function showLastUpdated(platform, source) {
    // Find the tab header for this platform
    const tabHeader = document.querySelector(`#${platform} .tab-header`);
    if (!tabHeader) return;

    // Check if we already have a last-updated element
    let lastUpdated = tabHeader.querySelector('.last-updated');
    if (!lastUpdated) {
        // Create a new element
        lastUpdated = document.createElement('div');
        lastUpdated.className = 'last-updated';
        tabHeader.appendChild(lastUpdated);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .last-updated {
                font-size: 0.8rem;
                color: #888;
                margin-top: 5px;
                display: flex;
                align-items: center;
            }
            .last-updated i {
                margin-right: 5px;
                color: #4CAF50;
            }
        `;
        document.head.appendChild(style);
    }

    // Update the content with UTC timestamp using sanitize utility
    const utcTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

    // Clear existing content
    while (lastUpdated.firstChild) {
        lastUpdated.removeChild(lastUpdated.firstChild);
    }

    // Create icon element
    const icon = sanitize.createSafeElement('i', {
        'class': 'fas fa-sync-alt'
    });

    // Create text element
    const text = sanitize.createSafeElement('span', {},
        `Last updated: ${sanitize.escapeHTML(utcTimestamp)} (Source: ${sanitize.escapeHTML(source)})`
    );

    // Append elements
    lastUpdated.appendChild(icon);
    lastUpdated.appendChild(text);
}

/**
 * Format a number with commas as thousands separators
 * @param {number|string} number - The number to format
 * @returns {string} - The formatted number
 */
function formatNumber(number) {
    // Use the sanitize utility to ensure the number is safe
    const safeNumber = sanitize.sanitizeNumber(number, 0);

    // Format the number with commas
    return safeNumber.toLocaleString();
}

/**
 * Shows a notification that demo data is being displayed
 */
function showDemoDataNotification() {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('demo-data-notification');
    if (!notification) {
        // Use sanitize utility to create safe elements
        notification = sanitize.createSafeElement('div', {
            'id': 'demo-data-notification',
            'class': 'demo-data-notification'
        });

        // Create icon element
        const icon = sanitize.createSafeElement('i', {
            'class': 'fas fa-info-circle'
        });

        // Create message element
        const message = sanitize.createSafeElement('span', {},
            'Showing demo data for RAIN.GG leaderboard. We\'re having trouble accessing the live data.'
        );

        // Create close button
        const closeBtn = sanitize.createSafeElement('button', {
            'class': 'close-btn'
        });

        // Create close icon
        const closeIcon = sanitize.createSafeElement('i', {
            'class': 'fas fa-times'
        });

        // Assemble the elements
        closeBtn.appendChild(closeIcon);
        notification.appendChild(icon);
        notification.appendChild(message);
        notification.appendChild(closeBtn);

        // Add styles for the notification
        const style = sanitize.createSafeElement('style');
        style.textContent = `
            .demo-data-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: #333;
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 1000;
                display: flex;
                align-items: center;
                max-width: 300px;
                animation: slideIn 0.3s ease-out;
            }
            .demo-data-notification i {
                margin-right: 10px;
                color: #ffcc00;
            }
            .demo-data-notification .close-btn {
                background: none;
                border: none;
                color: white;
                margin-left: 10px;
                cursor: pointer;
                padding: 5px;
            }
            @keyframes slideIn {
                from { transform: translateY(100px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        // Add to document
        document.body.appendChild(notification);

        // Add close button functionality using a secure event listener
        if (closeBtn) {
            closeBtn.addEventListener('click', function(event) {
                // Prevent default behavior
                event.preventDefault();

                // Verify the event target is legitimate
                if (event.currentTarget === closeBtn) {
                    notification.style.display = 'none';
                }
            });
        }
    } else {
        // Show the notification if it exists but is hidden
        notification.style.display = 'flex';
    }
}

/**
 * Load XFUN leaderboard data directly from Firestore Database
 */
function loadXfunData() {
    console.log('Loading XFUN data from Firestore Database');

    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK is not available');
        showNoDataMessage('xfun', 'Firebase SDK is not available');
        return;
    }

    try {
        // Get Firestore Database instance
        let db;
        try {
            // Try to use the global instance first
            if (window.xfunDb) {
                db = window.xfunDb;
                console.log('Using global XFUN Firestore instance');
            } else {
                // Fall back to creating a new instance
                const app = firebase.app();
                console.log('Got Firebase app:', app.name);
                db = app.firestore();
                // Apply settings with merge: true to avoid overriding host
                db.settings({
                    ignoreUndefinedProperties: true,
                    merge: true
                });
                console.log('Created new Firestore instance with merge settings');
            }
        } catch (e) {
            console.error('Error getting Firestore instance:', e);
            showNoDataMessage('xfun', 'Error accessing Firestore Database');
            return;
        }

        console.log('Attempting to fetch XFUN data from Firestore Database...');

        // Based on the correct structure:
        // collection: leaderboards -> document: april-2025 -> collection: entries -> documents: 1, 2, 3, etc. -> fields: deposited, name, rank, timestamp, wagered

        // We need to get all documents in the entries collection
        console.log('Fetching all entries from leaderboards/april-2025/entries');

        // Try with lowercase first
        db.collection('leaderboards').doc('april-2025').collection('entries').get()
            .then(snapshot => {
                console.log(`Found ${snapshot.size} documents in entries collection (lowercase)`);

                if (!snapshot.empty) {
                    // Process all documents
                    const entries = [];

                    snapshot.forEach(doc => {
                        const data = doc.data();
                        console.log(`Processing document with ID: ${doc.id}`, data);

                        // Create an entry from the document fields
                        entries.push({
                            name: data.name || 'Unknown',
                            wagered: data.wagered || 0,
                            deposited: data.deposited || 0,
                            rank: data.rank || parseInt(doc.id) || entries.length + 1,
                            timestamp: data.timestamp || Date.now()
                        });
                    });

                    console.log(`Created ${entries.length} entries from documents:`, entries);

                    // Sort entries by wagered amount (descending)
                    entries.sort((a, b) => b.wagered - a.wagered);

                    // Add timestamp to show when data was last updated
                    showLastUpdated('xfun', 'april-2025');

                    // Render the leaderboard with all entries
                    renderLeaderboard('xfun', entries);
                    return;
                }

                // If no documents found with lowercase, try with uppercase first letter
                console.log('No documents found with lowercase, trying uppercase');
                return db.collection('leaderboards').doc('April-2025').collection('entries').get()
                    .then(snapshot => {
                        console.log(`Found ${snapshot.size} documents in entries collection (uppercase)`);

                        if (!snapshot.empty) {
                            // Process all documents
                            const entries = [];

                            snapshot.forEach(doc => {
                                const data = doc.data();
                                console.log(`Processing document with ID: ${doc.id}`, data);

                                // Create an entry from the document fields
                                entries.push({
                                    name: data.name || 'Unknown',
                                    wagered: data.wagered || 0,
                                    deposited: data.deposited || 0,
                                    rank: data.rank || parseInt(doc.id) || entries.length + 1,
                                    timestamp: data.timestamp || Date.now()
                                });
                            });

                            console.log(`Created ${entries.length} entries from documents:`, entries);

                            // Sort entries by wagered amount (descending)
                            entries.sort((a, b) => b.wagered - a.wagered);

                            // Add timestamp to show when data was last updated
                            showLastUpdated('xfun', 'April-2025');

                            // Render the leaderboard with all entries
                            renderLeaderboard('xfun', entries);
                            return;
                        }

                        // If we still can't find anything, try one more approach - check if entries are stored as a subcollection
                        console.log('No documents found in entries collection, checking if entries are stored in the document itself');

                        return db.collection('leaderboards').doc('april-2025').get()
                            .then(doc => {
                                if (doc.exists) {
                                    const data = doc.data();
                                    console.log('april-2025 document data:', data);

                                    // Check if the document has an entries field with an array
                                    if (data && data.entries && Array.isArray(data.entries)) {
                                        console.log('Found entries array in document with', data.entries.length, 'items');
                                        processXfunEntries(data.entries);
                                        return;
                                    }
                                }

                                // Try uppercase
                                return db.collection('leaderboards').doc('April-2025').get()
                                    .then(doc => {
                                        if (doc.exists) {
                                            const data = doc.data();
                                            console.log('April-2025 document data:', data);

                                            // Check if the document has an entries field with an array
                                            if (data && data.entries && Array.isArray(data.entries)) {
                                                console.log('Found entries array in document with', data.entries.length, 'items');
                                                processXfunEntries(data.entries);
                                                return;
                                            }
                                        }

                                        // If we still can't find anything, show no data message
                                        console.log('No entries found in any location');
                                        showNoDataMessage('xfun', 'No leaderboard data found');
                                    });
                            });
                    });
            })
            .catch(error => {
                console.error('Error getting XFUN document:', error);
                showNoDataMessage('xfun', 'Error fetching leaderboard data');
            });
    } catch (error) {
        console.error('Error in loadXfunData:', error);

        showNoDataMessage('xfun', 'Unexpected error loading leaderboard');
    }
}

/**
 * Process XFUN entries array and render it
 * @param {Array} entriesArray - The array of XFUN entries
 */
function processXfunEntries(entriesArray) {
    console.log('Processing XFUN entries array:', entriesArray);

    try {
        // Process the data
        const entries = entriesArray.map((item, index) => {
            console.log(`Processing XFUN item ${index}:`, item);

            // Try to extract name
            let name = 'Unknown';
            if (typeof item === 'object') {
                name = item.name || item.username || 'Unknown';
            }

            // Try to extract wagered amount
            let wagered = 0;
            if (typeof item === 'object') {
                wagered = item.wagered || item.wager || 0;
            }

            // Try to extract deposited amount
            let deposited = 0;
            if (typeof item === 'object') {
                deposited = item.deposited || item.deposit || 0;
            }

            return {
                name: name,
                wagered: wagered,
                deposited: deposited,
                rank: item.rank || index + 1,
                timestamp: item.timestamp || Date.now()
            };
        });

        console.log('Processed XFUN entries:', entries);

        // Add timestamp to show when data was last updated
        showLastUpdated('xfun', 'april-2025');

        // Render the data
        renderLeaderboard('xfun', entries);
    } catch (error) {
        console.error('Error processing XFUN entries:', error);
        showNoDataMessage('xfun');
    }
}

/**
 * Load RAINGG leaderboard data from Firestore Database
 * @param {Array} mockData - Mock data to use as fallback
 */
function loadRainggData(mockData) {
    console.log('Attempting to load RAINGG data from Firestore Database');

    // Use the provided mock data or create a default one if not provided
    if (!mockData) {
        console.log('Creating default mock data for RAINGG as fallback');
        mockData = [
            { username: 'RainPlayer1', wagered_: 45000, avatar: '', id: '1' },
            { username: 'RainPlayer2', wagered_: 37500, avatar: '', id: '2' },
            { username: 'RainPlayer3', wagered_: 30000, avatar: '', id: '3' },
            { username: 'RainPlayer4', wagered_: 22500, avatar: '', id: '4' },
            { username: 'RainPlayer5', wagered_: 18000, avatar: '', id: '5' },
            { username: 'RainPlayer6', wagered_: 15000, avatar: '', id: '6' },
            { username: 'RainPlayer7', wagered_: 12000, avatar: '', id: '7' },
            { username: 'RainPlayer8', wagered_: 9000, avatar: '', id: '8' },
            { username: 'RainPlayer9', wagered_: 7500, avatar: '', id: '9' },
            { username: 'RainPlayer10', wagered_: 6000, avatar: '', id: '10' }
        ];
    }

    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK is not available');
        showDemoDataNotification();
        processRainggData(mockData);
        return;
    }

    try {
        // Get Firestore Database instance
        let db;
        try {
            // Try to use the global instance first
            if (window.rainggDb) {
                db = window.rainggDb;
                console.log('Using global RAINGG Firestore instance');
            } else {
                // Fall back to creating a new instance
                const app = firebase.app('raingg') || firebase.app();
                console.log('Got RAINGG Firebase app:', app.name);
                db = app.firestore();
                // Apply settings with merge: true to avoid overriding host
                db.settings({
                    ignoreUndefinedProperties: true,
                    merge: true,
                    experimentalForceLongPolling: true,
                    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
                });
                console.log('Created new RAINGG Firestore instance with special settings');
            }
        } catch (e) {
            console.error('Error getting RAINGG Firestore instance:', e);
            showDemoDataNotification();
            processRainggData(mockData);
            return;
        }

        console.log('Attempting to fetch RAINGG data from Firestore Database...');

        // Find the most recent document in the leaderboards collection
        db.collection('leaderboards').get()
            .then(snapshot => {
                if (snapshot.empty) {
                    console.log('No documents found in leaderboards collection, using mock data');
                    showDemoDataNotification();
                    processRainggData(mockData);
                    return;
                }

                const docIds = snapshot.docs.map(doc => doc.id);
                console.log('Available RAINGG leaderboard documents:', docIds.join(', '));

                // Try to find the most recent document based on date format in document ID
                // Assuming document IDs are in format YYYY-MM-DD or similar
                const dateRegex = /\d{4}-\d{2}-\d{2}/;
                const dateDocs = docIds.filter(id => dateRegex.test(id));

                let docIdToFetch = 'may-2025'; // Default fallback

                if (dateDocs.length > 0) {
                    // Sort in descending order to get the most recent date first
                    dateDocs.sort((a, b) => b.localeCompare(a));
                    docIdToFetch = dateDocs[0];
                    console.log('Most recent RAINGG document by date format:', docIdToFetch);
                } else {
                    console.log('No date-formatted documents found, using the first available document');
                    docIdToFetch = docIds[0];
                }

                // Fetch the document
                db.collection('leaderboards').doc(docIdToFetch).get()
                    .then(doc => {
                        if (!doc.exists) {
                            console.log(`Document ${docIdToFetch} does not exist, using mock data`);
                            showDemoDataNotification();
                            processRainggData(mockData);
                            return;
                        }

                        const data = doc.data();
                        console.log(`RAINGG document ${docIdToFetch} data:`, data);

                        // Log the raw data for debugging
                        console.log('Raw RAINGG document data:', data);

                        // Check if the document has the expected structure
                        if (data && data.data && Array.isArray(data.data)) {
                            console.log('Found data array with', data.data.length, 'entries');

                            // Log the first few entries to see their structure
                            if (data.data.length > 0) {
                                console.log('Sample entries:', data.data.slice(0, 3));
                            }

                            // Add timestamp to show when data was last updated
                            showLastUpdated('raingg', docIdToFetch);

                            // Process the data
                            processRainggData(data.data);
                        } else if (data && typeof data === 'object') {
                            // Try to adapt the data structure
                            try {
                                console.log('Trying to adapt data structure...');
                                const adaptedData = [];

                                // Check if the data is directly an object with entries
                                if (Object.keys(data).length > 0) {
                                    console.log('Data has keys:', Object.keys(data));

                                    // Try different approaches to extract data

                                    // Approach 1: Direct object entries
                                    Object.entries(data).forEach(([key, value], index) => {
                                        if (typeof value === 'object') {
                                            console.log(`Processing entry with key ${key}:`, value);
                                            adaptedData.push({
                                                username: value.name || value.username || key,
                                                wagered_: value.wagered || value.wagered_ || value.amount || 0,
                                                id: key,
                                                rank: index + 1
                                            });
                                        }
                                    });

                                    // Approach 2: Check for specific fields that might contain the data
                                    const possibleDataFields = ['entries', 'users', 'players', 'leaderboard'];
                                    for (const field of possibleDataFields) {
                                        if (data[field] && Array.isArray(data[field])) {
                                            console.log(`Found array in field '${field}' with ${data[field].length} entries`);
                                            data[field].forEach((item, index) => {
                                                adaptedData.push({
                                                    username: item.name || item.username || `Player${index+1}`,
                                                    wagered_: item.wagered || item.wagered_ || item.amount || 0,
                                                    id: item.id || index.toString(),
                                                    rank: index + 1
                                                });
                                            });
                                            break;
                                        } else if (data[field] && typeof data[field] === 'object') {
                                            console.log(`Found object in field '${field}'`);
                                            Object.entries(data[field]).forEach(([key, value], index) => {
                                                if (typeof value === 'object') {
                                                    adaptedData.push({
                                                        username: value.name || value.username || key,
                                                        wagered_: value.wagered || value.wagered_ || value.amount || 0,
                                                        id: key,
                                                        rank: index + 1
                                                    });
                                                }
                                            });
                                            break;
                                        }
                                    }
                                }

                                if (adaptedData.length > 0) {
                                    console.log('Successfully adapted data with', adaptedData.length, 'entries');
                                    console.log('Sample adapted entries:', adaptedData.slice(0, 3));

                                    // Add timestamp to show when data was last updated
                                    showLastUpdated('raingg', docIdToFetch);

                                    processRainggData(adaptedData);
                                } else {
                                    console.log('Could not adapt data structure, using mock data');
                                    showDemoDataNotification();
                                    processRainggData(mockData);
                                }
                            } catch (error) {
                                console.error('Error adapting data structure:', error);
                                showDemoDataNotification();
                                processRainggData(mockData);
                            }
                        } else {
                            console.log('Document has unexpected structure, using mock data');
                            showDemoDataNotification();
                            processRainggData(mockData);
                        }
                    })
                    .catch(error => {
                        console.error(`Error fetching document ${docIdToFetch}:`, error);
                        showDemoDataNotification();
                        processRainggData(mockData);
                    });
            })
            .catch(error => {
                console.error('Error listing RAINGG documents:', error);
                showDemoDataNotification();
                processRainggData(mockData);
            });
    } catch (error) {
        console.error('Error in RAINGG data fetch:', error);
        showDemoDataNotification();
        processRainggData(mockData);
    }
}

/**
 * Process RAINGG data and render it
 * @param {Array} dataArray - The array of RAINGG data
 */
function processRainggData(dataArray) {
    console.log('Processing RAINGG data array:', dataArray);

    try {
        // Make sure dataArray is an array
        if (!Array.isArray(dataArray)) {
            console.error('Expected an array but got:', typeof dataArray);
            showNoDataMessage('raingg', 'Invalid data format');
            return;
        }

        // Process the data
        const entries = dataArray.map((item, index) => {
            console.log(`Processing RAINGG item ${index}:`, item);

            // Try to extract username
            let username = 'Unknown';
            if (typeof item === 'object') {
                username = item.username || item.user || item.name || 'Unknown';
            }

            // Try to extract wagered amount
            let wagered = 0;
            if (typeof item === 'object') {
                // Try all possible field names for wagered amount
                wagered = item.wagered_ || item.wagered || item.amount || item.wager ||
                          (item.stats && item.stats.wagered) || 0;

                // Convert to number if it's a string
                if (typeof wagered === 'string') {
                    wagered = parseFloat(wagered.replace(/[^0-9.-]+/g, '')) || 0;
                }
            }

            return {
                name: username,
                wagered: wagered,
                avatar: item.avatar || '',
                id: item.id || '',
                rank: 0 // Will be assigned after sorting
            };
        });

        // Sort entries by wagered amount (descending)
        entries.sort((a, b) => b.wagered - a.wagered);

        // Assign ranks after sorting
        entries.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        console.log('Processed and sorted RAINGG entries:', entries);

        // Check if we have the container for RAINGG
        const topContainer = document.getElementById('raingg-top-winners');
        const otherContainer = document.getElementById('raingg-other-winners');

        if (!topContainer || !otherContainer) {
            console.error('RAINGG containers not found in the DOM');
            console.log('topContainer:', topContainer);
            console.log('otherContainer:', otherContainer);
        }

        // If we don't already have a timestamp, add one now
        if (!document.querySelector('#raingg .tab-header .last-updated')) {
            showLastUpdated('raingg', 'latest data');
        }

        // Render the data
        renderLeaderboard('raingg', entries);
    } catch (error) {
        console.error('Error processing RAINGG data:', error);
        showNoDataMessage('raingg');
    }
}

/**
 * Render leaderboard data
 * @param {string} platform - The platform (xfun, raingg)
 * @param {Array} entries - The leaderboard entries
 */
function renderLeaderboard(platform, entries) {
    console.log(`Rendering ${platform} leaderboard with ${entries.length} entries`);

    // Define prize structure based on platform
    let prizes;

    if (platform === 'raingg') {
        prizes = {
            1: "500 Coins",
            2: "300 Coins",
            3: "100 Coins",
            4: "50 Coins",
            5: "50 Coins",
            default: "" // Empty for ranks beyond 5
        };
    } else {
        // Default prize structure for other platforms (XFUN, etc.)
        prizes = {
            1: "200 Coins",
            2: "125 Coins",
            3: "75 Coins",
            4: "Personal Tips",
            5: "Personal Tips",
            6: "Personal Tips",
            default: "" // Empty for ranks beyond 6
        };
    }

    // Get containers
    const topContainer = document.getElementById(`${platform}-top-winners`);
    const otherContainer = document.getElementById(`${platform}-other-winners`);

    // Clear containers
    if (topContainer) topContainer.innerHTML = '';
    if (otherContainer) otherContainer.innerHTML = '';

    // Split entries into top 3 and others
    const topEntries = entries.slice(0, 3);
    let otherEntries = entries.slice(3);

    // For RAINGG, ensure we always have 10 entries total (3 top + 7 others)
    if (platform === 'raingg' && entries.length < 10) {
        console.log(`Padding RAINGG entries to ensure 10 total entries`);

        // Calculate how many empty entries we need to add
        const currentTotal = entries.length;
        const emptyEntriesNeeded = 10 - currentTotal;

        // Create empty entries with increasing ranks
        for (let i = 0; i < emptyEntriesNeeded; i++) {
            const rank = currentTotal + i + 1;
            otherEntries.push({
                name: "---",
                wagered: 0,
                rank: rank,
                empty: true // Mark as empty for special styling
            });
        }
    }

    // Render top winners
    if (topContainer && topEntries.length > 0) {
        // Create and append elements for positions 2, 1, and 3 in that order
        const positions = [2, 1, 3];
        const positionClasses = ['second', 'first', 'third'];

        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            const entry = topEntries[pos - 1];
            if (!entry) continue;

            // Use the sanitize utility to create safe elements
            const winnerDiv = sanitize.createSafeElement('div', {
                'class': `winner ${positionClasses[i]}`
            });

            const crownDiv = sanitize.createSafeElement('div', {
                'class': 'crown'
            });

            const crownIcon = sanitize.createSafeElement('i', {
                'class': 'fas fa-crown'
            });
            crownDiv.appendChild(crownIcon);

            const positionDiv = sanitize.createSafeElement('div', {
                'class': 'position'
            }, pos.toString());

            const usernameDiv = sanitize.createSafeElement('div', {
                'class': 'username'
            }, sanitize.escapeHTML(entry.name || ''));

            const amountDiv = sanitize.createSafeElement('div', {
                'class': 'amount'
            }, `${Number(entry.wagered || 0).toLocaleString()} coins`);

            const prizeDiv = sanitize.createSafeElement('div', {
                'class': 'prize'
            }, prizes[pos] || prizes.default);

            winnerDiv.appendChild(crownDiv);
            winnerDiv.appendChild(positionDiv);
            winnerDiv.appendChild(usernameDiv);
            winnerDiv.appendChild(amountDiv);
            winnerDiv.appendChild(prizeDiv);

            topContainer.appendChild(winnerDiv);
        }
    }

    // Render other winners
    if (otherContainer && otherEntries.length > 0) {
        // Create header row using sanitize utility
        const headerRow = sanitize.createSafeElement('div', {
            'class': 'winner-row-header'
        });

        const headerRank = sanitize.createSafeElement('span', {
            'class': 'header-rank'
        }, 'Rank');

        const headerUsername = sanitize.createSafeElement('span', {
            'class': 'header-username'
        }, 'Username');

        const headerAmount = sanitize.createSafeElement('span', {
            'class': 'header-amount'
        }, 'Amount');

        const headerPrize = sanitize.createSafeElement('span', {
            'class': 'header-prize'
        }, 'Prize');

        headerRow.appendChild(headerRank);
        headerRow.appendChild(headerUsername);
        headerRow.appendChild(headerAmount);
        headerRow.appendChild(headerPrize);

        otherContainer.appendChild(headerRow);

        // Create rows for other winners
        otherEntries.forEach((entry, index) => {
            const position = entry.rank || (index + 4); // Use entry.rank if available, otherwise start from position 4

            // Use sanitize utility to create safe elements
            const winnerRow = sanitize.createSafeElement('div', {
                'class': entry.empty ? 'winner-row empty' : 'winner-row'
            });

            // Add CSS for empty rows if not already added
            if (entry.empty && !document.getElementById('empty-row-style')) {
                const style = sanitize.createSafeElement('style', {
                    'id': 'empty-row-style'
                });
                style.textContent = `
                    .winner-row.empty {
                        opacity: 0.5;
                        color: #999;
                        font-style: italic;
                    }
                `;
                document.head.appendChild(style);
            }

            const positionSpan = sanitize.createSafeElement('span', {
                'class': 'position'
            }, position.toString());

            const usernameSpan = sanitize.createSafeElement('span', {
                'class': 'username'
            }, sanitize.escapeHTML(entry.name || ''));

            const amountSpan = sanitize.createSafeElement('span', {
                'class': 'amount'
            }, entry.empty ? '---' : `${Number(entry.wagered || 0).toLocaleString()} coins`);

            const prizeSpan = sanitize.createSafeElement('span', {
                'class': 'prize'
            }, entry.empty ? '' : (prizes[position] || prizes.default));

            winnerRow.appendChild(positionSpan);
            winnerRow.appendChild(usernameSpan);
            winnerRow.appendChild(amountSpan);
            winnerRow.appendChild(prizeSpan);

            otherContainer.appendChild(winnerRow);
        });

        // Removed duplicate timestamp
    }
}

/**
 * Show a message when no data is available
 * @param {string} platform - The platform (xfun, raingg)
 * @param {string} [errorMessage] - Optional error message to display
 */
function showNoDataMessage(platform, errorMessage) {
    console.log(`Showing no data message for ${platform}${errorMessage ? ': ' + errorMessage : ''}`);

    // Get containers
    const topContainer = document.getElementById(`${platform}-top-winners`);
    const otherContainer = document.getElementById(`${platform}-other-winners`);

    // Clear containers
    if (topContainer) topContainer.innerHTML = '';
    if (otherContainer) otherContainer.innerHTML = '';

    // Default message if none provided
    const defaultMessage = 'No leaderboard data available at the moment. Please check back later.';
    const message = errorMessage || defaultMessage;

    // Show message in top container using sanitize utility
    if (topContainer) {
        const messageDiv = sanitize.createSafeElement('div', {
            'class': 'no-data-message'
        });

        const icon = sanitize.createSafeElement('i', {
            'class': 'fas fa-exclamation-circle'
        });

        const text = sanitize.createSafeElement('p', {},
            sanitize.escapeHTML(message)
        );

        messageDiv.appendChild(icon);
        messageDiv.appendChild(text);
        topContainer.appendChild(messageDiv);
    }

    // Show message in other container using sanitize utility
    if (otherContainer) {
        const messageRow = sanitize.createSafeElement('div', {
            'class': 'winner-row no-data'
        });

        const messageText = sanitize.createSafeElement('span', {
            'class': 'no-data-text'
        }, 'Leaderboard data will be updated soon.');

        messageRow.appendChild(messageText);
        otherContainer.appendChild(messageRow);
    }
}
