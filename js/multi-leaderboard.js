/**
 * Multi-Leaderboard Service
 * This file handles connections to multiple Firebase databases and populates leaderboards with real data
 */

// Initialize Firebase when DOM is ready
document.addEventListener('DOMContentLoaded', function() {

    // Firebase configuration for the new project
    const multiLeaderboardConfig = {
        apiKey: "AIzaSyAVUqUZvYLOfglGRdgKrIsG6k6KDAxvFu4",
        authDomain: "xfun-lb-web-chrome.firebaseapp.com",
        projectId: "xfun-lb-web-chrome",
        storageBucket: "xfun-lb-web-chrome.firebasestorage.app",
        messagingSenderId: "749066968777",
        appId: "1:749066968777:web:1482e4011829dbce35f718",
        measurementId: "G-BFDDTMSPX3"
    };

    // Initialize the secondary Firebase app
    try {
        // Initialize with a unique name to avoid conflicts with the primary Firebase app
        let multiLeaderboardApp;
        if (!firebase.apps.find(app => app.name === 'multiLeaderboard')) {
            multiLeaderboardApp = firebase.initializeApp(multiLeaderboardConfig, 'multiLeaderboard');
        } else {
            multiLeaderboardApp = firebase.app('multiLeaderboard');
        }

        // Create the multi-leaderboard service
        window.multiLeaderboardService = {
            renderLeaderboard: renderMultiLeaderboard
        };

        // Check if we need to load any leaderboards on page load
        checkAndLoadLeaderboards();

        // Add click handlers to tabs to load data when clicked
        addTabClickHandlers();
    } catch (error) {
        console.error('Error initializing Multi-leaderboard Firebase:', error);
    }
});

/**
 * Check if any supported leaderboards are active and load them
 */
function checkAndLoadLeaderboards() {
    // Check XFUN May 2025 - Currently in "Coming Soon" state
    // We'll still initialize the Firebase connection but won't display the data
    const xfunMayContent = document.getElementById('xfun-may2025');
    if (xfunMayContent && xfunMayContent.classList.contains('active')) {
        // The containers are hidden with CSS, but we'll still connect to Firebase
        // to keep the configuration ready for when the leaderboard goes live
        const topContainer = document.getElementById('xfun-may2025-top-winners');
        const otherContainer = document.getElementById('xfun-may2025-other-winners');
        if (topContainer) topContainer.innerHTML = '';
        if (otherContainer) otherContainer.innerHTML = '';

        // Initialize Firebase connection but don't render the data
        // This keeps the configuration ready for when the leaderboard goes live
    }

    // Check RAIN.GG
    const rainggContent = document.getElementById('raingg');
    if (rainggContent && rainggContent.classList.contains('active')) {
        // Clear any existing content first
        const topContainer = document.getElementById('raingg-top-winners');
        const otherContainer = document.getElementById('raingg-other-winners');
        if (topContainer) topContainer.innerHTML = '';
        if (otherContainer) otherContainer.innerHTML = '';

        renderMultiLeaderboard('raingg', 'raingg-top-winners', 'raingg-other-winners');
    }

    // Check DICEBLOX
    const dicebloxContent = document.getElementById('diceblox');
    if (dicebloxContent && dicebloxContent.classList.contains('active')) {
        // Clear any existing content first
        const topContainer = document.getElementById('diceblox-top-winners');
        const otherContainer = document.getElementById('diceblox-other-winners');
        if (topContainer) topContainer.innerHTML = '';
        if (otherContainer) otherContainer.innerHTML = '';

        renderMultiLeaderboard('diceblox', 'diceblox-top-winners', 'diceblox-other-winners');
    }
}

/**
 * Add click handlers to tabs to load data when clicked
 */
function addTabClickHandlers() {
    // XFUN tab for May 2025
    const xfunTab = document.querySelector('.tab-btn[data-tab="xfun"]');
    if (xfunTab) {
        xfunTab.addEventListener('click', function() {
            // Check if May 2025 is the active period
            const mayOption = document.querySelector('.period-option[data-period="may2025"]');
            if (mayOption && mayOption.classList.contains('active')) {
                setTimeout(() => {
                    // May 2025 is in "Coming Soon" state - no need to render data
                    // We could initialize Firebase here if needed in the future
                    // For now, we'll just show the Coming Soon message which is already in the HTML
                }, 100); // Small delay to ensure DOM is updated
            }
        });
    }

    // RAIN.GG tab
    const rainggTab = document.querySelector('.tab-btn[data-tab="raingg"]');
    if (rainggTab) {
        rainggTab.addEventListener('click', function() {
            setTimeout(() => {
                // Clear any existing content first
                const topContainer = document.getElementById('raingg-top-winners');
                const otherContainer = document.getElementById('raingg-other-winners');
                if (topContainer) topContainer.innerHTML = '';
                if (otherContainer) otherContainer.innerHTML = '';

                renderMultiLeaderboard('raingg', 'raingg-top-winners', 'raingg-other-winners');
            }, 100); // Small delay to ensure DOM is updated
        });
    }

    // DICEBLOX tab
    const dicebloxTab = document.querySelector('.tab-btn[data-tab="diceblox"]');
    if (dicebloxTab) {
        dicebloxTab.addEventListener('click', function() {
            setTimeout(() => {
                // Clear any existing content first
                const topContainer = document.getElementById('diceblox-top-winners');
                const otherContainer = document.getElementById('diceblox-other-winners');
                if (topContainer) topContainer.innerHTML = '';
                if (otherContainer) otherContainer.innerHTML = '';

                renderMultiLeaderboard('diceblox', 'diceblox-top-winners', 'diceblox-other-winners');
            }, 100); // Small delay to ensure DOM is updated
        });
    }

    // Period selector for XFUN May 2025
    const mayOption = document.querySelector('.period-option[data-period="may2025"]');
    if (mayOption) {
        mayOption.addEventListener('click', function() {
            // Check if XFUN is the active tab
            const xfunContent = document.getElementById('xfun');
            if (xfunContent && xfunContent.classList.contains('active')) {
                setTimeout(() => {
                    // May 2025 is in "Coming Soon" state - no need to render data
                    // We could initialize Firebase here if needed in the future
                    // For now, we'll just show the Coming Soon message which is already in the HTML
                }, 100); // Small delay to ensure DOM is updated
            }
        });
    }
}

/**
 * Render leaderboard data from the appropriate Firestore database
 * @param {string} platform - The platform identifier (e.g., 'xfun-may2025', 'raingg', 'diceblox')
 * @param {string} topContainerId - ID of the container for top 3 winners
 * @param {string} otherContainerId - ID of the container for other winners
 */
async function renderMultiLeaderboard(platform, topContainerId, otherContainerId) {

    // Check if this is a platform we can handle
    const supportedPlatforms = ['xfun-may2025', 'raingg', 'diceblox'];
    if (!supportedPlatforms.includes(platform)) {
        if (typeof window.showEmptyLeaderboard === 'function') {
            window.showEmptyLeaderboard(platform);
        }
        return;
    }

    // Get containers
    const topContainer = document.getElementById(topContainerId);
    const otherContainer = document.getElementById(otherContainerId);

    if (!topContainer || !otherContainer) {
        console.error(`Containers not found for ${platform}`);
        return;
    }

    // Clear containers completely
    topContainer.innerHTML = '';
    otherContainer.innerHTML = '';

    // Show loading indicator
    showLoadingIndicator(topContainer, otherContainer);

    try {
        // Get Firestore instance from the secondary app
        const db = firebase.app('multiLeaderboard').firestore();

        // Determine which database to use based on platform
        let databaseName;
        if (platform === 'xfun-may2025') {
            databaseName = 'x_fun';
        } else if (platform === 'raingg') {
            databaseName = 'rain_gg';
        } else if (platform === 'diceblox') {
            databaseName = 'diceblox';
        }

        // Get all documents from the collection without ordering
        const timestampRef = db.collection(databaseName);

        // Get all documents without ordering to avoid index requirement
        const allDocs = await timestampRef.get();

        // Manually find the appropriate timestamp document
        let targetTimestamp = '';
        let targetDoc = null;

        // For XFUN May 2025, we specifically want the May document
        // For other platforms, we want the latest document
        if (platform === 'xfun-may2025') {
            // Look for a document with May 2025 in the ID
            allDocs.forEach(doc => {
                const docId = doc.id;

                // Check if the document ID contains "2025-05" (May 2025)
                if (docId.includes('2025-05')) {
                    // If we find multiple May documents, use the latest one
                    if (docId > targetTimestamp) {
                        targetTimestamp = docId;
                        targetDoc = doc;
                    }
                }
            });
        }

        // If we didn't find a specific document (or for other platforms), use the latest one
        if (!targetDoc) {
            allDocs.forEach(doc => {
                const docId = doc.id;

                // Compare document IDs to find the latest timestamp
                if (docId > targetTimestamp) {
                    targetTimestamp = docId;
                    targetDoc = doc;
                }
            });
        }

        // Create a mock snapshot with the target document
        const timestampDocs = {
            empty: allDocs.empty || !targetDoc,
            docs: targetDoc ? [targetDoc] : []
        };

        if (timestampDocs.empty) {
            clearLoadingIndicators(topContainer, otherContainer);
            showNoDataMessage(platform, `No leaderboard data available for ${platform}`);
            return;
        }

        const latestTimestampDoc = timestampDocs.docs[0];

        // Get the document data first to see what fields it has
        const docData = await latestTimestampDoc.ref.get();

        // Check if the document has a 'rankings' field that is a map
        const docDataObj = docData.data();
        if (!docDataObj || !docDataObj.rankings) {
            clearLoadingIndicators(topContainer, otherContainer);
            showNoDataMessage(platform, `No leaderboard data available for ${platform}`);
            return;
        }

        // Process the data
        let entries = [];

        if (docDataObj && docDataObj.rankings) {
            // Convert the rankings map to an array of entries
            const rankingsArray = [];
            for (let i = 0; i <= 10; i++) {
                if (docDataObj.rankings[i]) {
                    rankingsArray.push({
                        id: i.toString(),
                        ...docDataObj.rankings[i]
                    });
                }
            }

            // Sort by wagered amount (descending)
            rankingsArray.sort((a, b) => {
                const aWagered = a.wagered !== undefined ? a.wagered : 0;
                const bWagered = b.wagered !== undefined ? b.wagered : 0;
                return bWagered - aWagered;
            });

            // Use the rankings array
            entries = rankingsArray;
        }

        // Clear loading indicators
        clearLoadingIndicators(topContainer, otherContainer);

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
        } else if (platform === 'diceblox') {
            prizes = {
                1: "$200",
                2: "$100",
                3: "$50",
                4: "$25",
                5: "$25",
                default: "" // Empty for ranks beyond 5
            };
        } else {
            // Default prize structure for XFUN
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

        // Render top 3 winners
        if (entries.length >= 3) {
            // Make sure the container is empty before adding elements
            topContainer.innerHTML = '';

            // Create and append elements for positions 2, 1, and 3 in that order
            const positions = [2, 1, 3];
            const positionClasses = ['second', 'first', 'third'];

            for (let i = 0; i < positions.length; i++) {
                const pos = positions[i];
                const entryIndex = pos - 1; // Convert position to array index
                const entry = entries[entryIndex];

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

                // Handle username - check if it exists
                const username = entry.username || 'Unknown';

                const usernameDiv = sanitize.createSafeElement('div', {
                    'class': 'username'
                }, sanitize.escapeHTML(username));

                // Handle wagered amount - check if it exists
                const wagered = entry.wagered !== undefined ? entry.wagered : 0;

                const amountDiv = sanitize.createSafeElement('div', {
                    'class': 'amount'
                }, formatNumber(wagered) + ' coins');

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

        // Render other winners (positions 4-10)
        if (entries.length > 3) {
            // Make sure the container is empty before adding elements
            otherContainer.innerHTML = '';

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
            }, 'Wagered');

            const headerPrize = sanitize.createSafeElement('span', {
                'class': 'header-prize'
            }, 'Prize');

            headerRow.appendChild(headerRank);
            headerRow.appendChild(headerUsername);
            headerRow.appendChild(headerAmount);
            headerRow.appendChild(headerPrize);

            otherContainer.appendChild(headerRow);

            // Create rows for positions 4-10
            for (let i = 3; i < entries.length; i++) {
                const pos = i + 1; // Convert array index to position
                const entry = entries[i];

                const winnerRow = sanitize.createSafeElement('div', {
                    'class': 'winner-row'
                });

                const positionSpan = sanitize.createSafeElement('span', {
                    'class': 'position'
                }, pos.toString());

                // Handle username - check if it exists
                const username = entry.username || 'Unknown';

                const usernameSpan = sanitize.createSafeElement('span', {
                    'class': 'username'
                }, sanitize.escapeHTML(username));

                // Handle wagered amount - check if it exists
                const wagered = entry.wagered !== undefined ? entry.wagered : 0;

                const amountSpan = sanitize.createSafeElement('span', {
                    'class': 'amount'
                }, formatNumber(wagered));

                const prizeSpan = sanitize.createSafeElement('span', {
                    'class': 'prize'
                }, prizes[pos] || prizes.default);

                winnerRow.appendChild(positionSpan);
                winnerRow.appendChild(usernameSpan);
                winnerRow.appendChild(amountSpan);
                winnerRow.appendChild(prizeSpan);

                otherContainer.appendChild(winnerRow);
            }
        }

        } catch (error) {
            console.error('Error rendering multi-leaderboard:', error);
            console.error('Error stack:', error.stack);

            // Log additional information for debugging
            console.log('Platform:', platform);
            console.log('Database name:', databaseName);
            console.log('Containers:', { topContainer, otherContainer });

            // Clear loading indicators
            clearLoadingIndicators(topContainer, otherContainer);

            // Show error message
            showNoDataMessage(platform, `Error loading leaderboard data: ${error.message}`);
        }
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
 * Show loading indicator while fetching data
 * @param {HTMLElement} topContainer - Container for top winners
 * @param {HTMLElement} otherContainer - Container for other winners
 */
function showLoadingIndicator(topContainer, otherContainer) {
    // Make sure containers are empty first
    topContainer.innerHTML = '';
    otherContainer.innerHTML = '';

    // Remove any existing loading indicators from anywhere in the DOM
    const existingTopLoading = document.getElementById('multi-top-loading-indicator');
    const existingOtherLoading = document.getElementById('multi-other-loading-indicator');

    if (existingTopLoading && existingTopLoading.parentNode) {
        existingTopLoading.parentNode.removeChild(existingTopLoading);
    }

    if (existingOtherLoading && existingOtherLoading.parentNode) {
        existingOtherLoading.parentNode.removeChild(existingOtherLoading);
    }

    // Create loading indicator for top container
    const topLoading = sanitize.createSafeElement('div', {
        'class': 'loading-indicator',
        'id': 'multi-top-loading-indicator'
    });

    const topSpinner = sanitize.createSafeElement('i', {
        'class': 'fas fa-spinner fa-spin'
    });

    const topText = sanitize.createSafeElement('span', {}, 'Loading leaderboard data...');

    topLoading.appendChild(topSpinner);
    topLoading.appendChild(topText);
    topContainer.appendChild(topLoading);

    // Create loading indicator for other container
    const otherLoading = sanitize.createSafeElement('div', {
        'class': 'loading-indicator',
        'id': 'multi-other-loading-indicator'
    });

    const otherSpinner = sanitize.createSafeElement('i', {
        'class': 'fas fa-spinner fa-spin'
    });

    const otherText = sanitize.createSafeElement('span', {}, 'Loading leaderboard data...');

    otherLoading.appendChild(otherSpinner);
    otherLoading.appendChild(otherText);
    otherContainer.appendChild(otherLoading);
}

/**
 * Clear loading indicators from containers
 * @param {HTMLElement} topContainer - Container for top winners
 * @param {HTMLElement} otherContainer - Container for other winners
 */
function clearLoadingIndicators(topContainer, otherContainer) {
    // Remove loading indicators
    const topLoading = document.getElementById('multi-top-loading-indicator');
    const otherLoading = document.getElementById('multi-other-loading-indicator');

    // Remove from top container if it exists
    if (topLoading) {
        if (topLoading.parentNode === topContainer) {
            topContainer.removeChild(topLoading);
        } else if (topLoading.parentNode) {
            topLoading.parentNode.removeChild(topLoading);
        }
    }

    // Remove from other container if it exists
    if (otherLoading) {
        if (otherLoading.parentNode === otherContainer) {
            otherContainer.removeChild(otherLoading);
        } else if (otherLoading.parentNode) {
            otherLoading.parentNode.removeChild(otherLoading);
        }
    }
}

/**
 * Show a message when no data is available
 * @param {string} platform - The platform (xfun-may2025, raingg, diceblox)
 * @param {string} [errorMessage] - Optional error message to display
 */
function showNoDataMessage(platform, errorMessage) {
    console.log(`Showing no data message for ${platform}${errorMessage ? ': ' + errorMessage : ''}`);

    // Get containers
    const topContainer = document.getElementById(`${platform}-top-winners`);
    const otherContainer = document.getElementById(`${platform}-other-winners`);

    // Make sure containers are completely empty
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
