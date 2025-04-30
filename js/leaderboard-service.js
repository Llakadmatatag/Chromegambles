/**
 * Leaderboard Service
 * Handles fetching and displaying leaderboard data from multiple sources
 * with fallback mechanisms for reliability
 */

// Define prize structure
const PRIZE_STRUCTURE = {
    1: "200 Coins",
    2: "125 Coins",
    3: "75 Coins",
    4: "Personal Tips",
    5: "Personal Tips",
    6: "Personal Tips",
    default: "" // Empty for ranks beyond 6
};

// Current document IDs for each platform
const CURRENT_DOC_IDS = {
    xfun: 'april-2025',
    raingg: '2025-04-29' // Use the most recent date
};

/**
 * Main function to fetch and render leaderboard data
 * @param {string} platform - The platform to fetch data for (xfun, raingg, etc.)
 * @param {string} topContainerId - ID of the container for top winners
 * @param {string} otherContainerId - ID of the container for other winners
 * @returns {Promise} - Promise that resolves when the leaderboard is rendered
 */
async function renderLeaderboard(platform, topContainerId, otherContainerId) {
    console.log(`Rendering leaderboard for ${platform} to containers: ${topContainerId}, ${otherContainerId}`);

    try {
        // Get data based on platform
        if (platform === 'xfun') {
            renderXfunLeaderboard(topContainerId, otherContainerId);
        } else if (platform === 'raingg') {
            renderRainggLeaderboard(topContainerId, otherContainerId);
        } else {
            // Try to get data from API as fallback
            try {
                const data = await fetchLeaderboardData(platform);

                // If we have data, render it
                if (data) {
                    renderLeaderboardUI(data, topContainerId, otherContainerId);
                    return;
                }

                // If we don't have data, show no data message
                showNoDataMessage(topContainerId, otherContainerId);
            } catch (apiError) {
                console.error(`Error fetching data for ${platform}:`, apiError);
                showNoDataMessage(topContainerId, otherContainerId);
            }
        }
    } catch (error) {
        console.error(`Error rendering leaderboard for ${platform}:`, error);
        showNoDataMessage(topContainerId, otherContainerId);
    }
}

/**
 * Render XFUN leaderboard
 * @param {string} topContainerId - ID of the container for top winners
 * @param {string} otherContainerId - ID of the container for other winners
 */
function renderXfunLeaderboard(topContainerId, otherContainerId) {
    try {
        // Check if XFUN Firebase is available
        if (typeof getXfunLeaderboardData !== 'function') {
            console.error('XFUN Firebase is not available');
            showNoDataMessage(topContainerId, otherContainerId);
            return;
        }

        // Get XFUN leaderboard data
        getXfunLeaderboardData(
            CURRENT_DOC_IDS.xfun,
            'entries',
            'wagered',
            (snapshot) => {
                console.log(`Received XFUN data: ${snapshot.size} entries`);

                // Check if we have data
                if (snapshot.empty) {
                    console.log('No XFUN leaderboard data found');
                    showNoDataMessage(topContainerId, otherContainerId);
                    return;
                }

                const topWinners = [];
                const otherWinners = [];

                let position = 1;
                snapshot.forEach(doc => {
                    const data = doc.data();

                    // Extract data with fallbacks for different field names
                    const username = data.name || data.username || data.user || 'Unknown';
                    const amount = typeof data.wagered === 'number' ? data.wagered :
                                  (typeof data.wager === 'number' ? data.wager :
                                  (typeof data.amount === 'number' ? data.amount : 0));
                    const deposited = typeof data.deposited === 'number' ? data.deposited :
                                     (typeof data.deposit === 'number' ? data.deposit : 0);

                    // Sanitize data
                    const winnerData = {
                        position: position,
                        username: sanitizeString(username),
                        amount: amount,
                        prize: PRIZE_STRUCTURE[position] || PRIZE_STRUCTURE.default,
                        deposited: deposited
                    };

                    if (position <= 3) {
                        topWinners.push(winnerData);
                    } else {
                        otherWinners.push(winnerData);
                    }
                    position++;
                });

                // Render the data
                renderLeaderboardUI({
                    topWinners,
                    otherWinners,
                    platform: 'xfun',
                    timestamp: Date.now()
                }, topContainerId, otherContainerId);
            },
            (error) => {
                console.error('Error in XFUN leaderboard data callback:', error);
                showNoDataMessage(topContainerId, otherContainerId);
            }
        );
    } catch (error) {
        console.error('Error rendering XFUN leaderboard:', error);
        showNoDataMessage(topContainerId, otherContainerId);
    }
}

/**
 * Render RAINGG leaderboard
 * @param {string} topContainerId - ID of the container for top winners
 * @param {string} otherContainerId - ID of the container for other winners
 */
function renderRainggLeaderboard(topContainerId, otherContainerId) {
    try {
        // Check if RAINGG Firebase is available
        if (typeof getRainggLeaderboardData !== 'function') {
            console.error('RAINGG Firebase is not available');
            showNoDataMessage(topContainerId, otherContainerId);
            return;
        }

        // Get RAINGG leaderboard data
        getRainggLeaderboardData(
            CURRENT_DOC_IDS.raingg,
            (data) => {
                console.log('Received RAINGG data');

                // Check if we have data
                if (!data || !data.data || !Array.isArray(data.data)) {
                    console.log('No RAINGG leaderboard data found');
                    showNoDataMessage(topContainerId, otherContainerId);
                    return;
                }

                const topWinners = [];
                const otherWinners = [];

                // Process each entry
                data.data.forEach((item, index) => {
                    const position = index + 1;

                    // Extract data with fallbacks for different field names
                    const username = item.username || item.name || item.user || 'Unknown';
                    const amount = typeof item.wagered === 'number' ? item.wagered :
                                  (typeof item.wager === 'number' ? item.wager :
                                  (typeof item.amount === 'number' ? item.amount : 0));

                    // Sanitize data
                    const winnerData = {
                        position: position,
                        username: sanitizeString(username),
                        amount: amount,
                        prize: PRIZE_STRUCTURE[position] || PRIZE_STRUCTURE.default
                    };

                    if (position <= 3) {
                        topWinners.push(winnerData);
                    } else {
                        otherWinners.push(winnerData);
                    }
                });

                // Render the data
                renderLeaderboardUI({
                    topWinners,
                    otherWinners,
                    platform: 'raingg',
                    timestamp: data.timestamp || Date.now()
                }, topContainerId, otherContainerId);
            },
            (error) => {
                console.error('Error in RAINGG leaderboard data callback:', error);
                showNoDataMessage(topContainerId, otherContainerId);
            }
        );
    } catch (error) {
        console.error('Error rendering RAINGG leaderboard:', error);
        showNoDataMessage(topContainerId, otherContainerId);
    }
}

/**
 * Fetches leaderboard data with fallback mechanisms
 * @param {string} platform - The platform to fetch data for
 * @returns {Promise} - Promise that resolves to the leaderboard data
 */
async function fetchLeaderboardData(platform) {
    try {
        // First try to get data from our secure API proxy
        return await fetchFromApiProxy(platform);
    } catch (apiError) {
        console.warn(`API proxy fetch failed for ${platform}, falling back to direct API:`, apiError);

        try {
            // If proxy fails, try direct API (if available)
            if (window.apiService && typeof window.apiService.getLeaderboardData === 'function') {
                return await window.apiService.getLeaderboardData(platform);
            }
        } catch (directApiError) {
            console.warn(`Direct API fetch failed for ${platform}, falling back to Firebase:`, directApiError);

            try {
                // If direct API fails, fall back to Firebase
                return await fetchFromFirebase(platform);
            } catch (firebaseError) {
                console.error(`All data sources failed for ${platform}:`, firebaseError);
                throw new Error('Failed to fetch leaderboard data from all sources');
            }
        }
    }
}

/**
 * Fetches leaderboard data from our secure API proxy
 * @param {string} platform - The platform to fetch data for
 * @returns {Promise} - Promise that resolves to the leaderboard data
 */
async function fetchFromApiProxy(platform) {
    try {
        // Construct the URL to our proxy
        const proxyUrl = `api/leaderboard-proxy.php?platform=${encodeURIComponent(platform)}`;

        // Set up fetch options with security best practices
        const fetchOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            mode: 'same-origin',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            signal: AbortSignal.timeout(10000) // 10 second timeout
        };

        // Make the request
        const response = await fetch(proxyUrl, fetchOptions);

        // Check if response is OK
        if (!response.ok) {
            throw new Error(`API proxy request failed with status: ${response.status}`);
        }

        // Parse response data
        const data = await response.json();

        // Process the data
        return processApiData(data, platform);
    } catch (error) {
        console.error(`Error fetching from API proxy for ${platform}:`, error);
        throw error;
    }
}

/**
 * Fetches leaderboard data from Firebase as a fallback
 * @param {string} platform - The platform to fetch data for
 * @returns {Promise} - Promise that resolves to the leaderboard data
 */
async function fetchFromFirebase(platform) {
    return new Promise((resolve, reject) => {
        try {
            // Check if Firebase is available
            if (!window.firebase || !window.db || !window.getLeaderboardData) {
                throw new Error('Firebase is not available');
            }

            // Determine document ID based on platform
            let docId = 'april-2025'; // Default

            // Set up callback to process data
            const callback = (snapshot) => {
                if (snapshot.empty) {
                    reject(new Error('No data found in Firebase'));
                    return;
                }

                const topWinners = [];
                const otherWinners = [];

                let position = 1;
                snapshot.forEach(doc => {
                    const data = doc.data();

                    // Sanitize data
                    const winnerData = {
                        position: position,
                        username: data.name ? sanitizeString(data.name) : 'Unknown',
                        amount: typeof data.wagered === 'number' ? data.wagered : 0,
                        prize: PRIZE_STRUCTURE[position] || PRIZE_STRUCTURE.default,
                        deposited: typeof data.deposited === 'number' ? data.deposited : 0
                    };

                    if (position <= 3) {
                        topWinners.push(winnerData);
                    } else {
                        otherWinners.push(winnerData);
                    }
                    position++;
                });

                resolve({
                    topWinners,
                    otherWinners,
                    timestamp: Date.now(),
                    totalEntries: topWinners.length + otherWinners.length
                });
            };

            // Set up error callback
            const errorCallback = (error) => {
                reject(error);
            };

            // Fetch data from Firebase
            window.getLeaderboardData(docId, 'entries', 'wagered', callback, errorCallback);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Processes data from the API into a consistent format
 * @param {Object} data - The raw API data
 * @param {string} platform - The platform the data is for
 * @returns {Object} - Processed data ready for rendering
 */
function processApiData(data, platform) {
    // Extract entries
    const entries = data.entries || [];

    // Process entries
    const processedEntries = entries.map((entry, index) => {
        const position = index + 1;

        return {
            position: position,
            username: sanitizeString(entry.name || 'Unknown'),
            amount: typeof entry.wagered === 'number' ? entry.wagered : 0,
            prize: PRIZE_STRUCTURE[position] || PRIZE_STRUCTURE.default,
            deposited: typeof entry.deposited === 'number' ? entry.deposited : 0
        };
    });

    // Split into top winners and other winners
    const topWinners = processedEntries.slice(0, 3);
    const otherWinners = processedEntries.slice(3);

    return {
        topWinners,
        otherWinners,
        timestamp: data.timestamp || Date.now(),
        totalEntries: processedEntries.length,
        platform: platform
    };
}

/**
 * Renders the leaderboard UI with the provided data
 * @param {Object} data - The processed leaderboard data
 * @param {string} topContainerId - ID of the container for top winners
 * @param {string} otherContainerId - ID of the container for other winners
 */
function renderLeaderboardUI(data, topContainerId, otherContainerId) {
    // Get containers
    const topContainer = document.getElementById(topContainerId);
    const otherContainer = document.getElementById(otherContainerId);

    // Clear containers
    if (topContainer) topContainer.innerHTML = '';
    if (otherContainer) otherContainer.innerHTML = '';

    // Render top winners
    if (topContainer && data.topWinners.length > 0) {
        // Create and append elements for positions 2, 1, and 3 in that order
        const positions = [2, 1, 3];

        positions.forEach(pos => {
            const winner = data.topWinners.find(w => w.position === pos);
            if (!winner) return;

            const winnerClass = pos === 1 ? 'first' : pos === 2 ? 'second' : 'third';

            // Create winner container
            const winnerDiv = createSafeElement('div', { class: `winner ${winnerClass}` });

            // Create crown
            const crownDiv = createSafeElement('div', { class: 'crown' });
            const crownIcon = createSafeElement('i', { class: 'fas fa-crown' });
            crownDiv.appendChild(crownIcon);

            // Create position, username, amount, prize elements
            const positionDiv = createSafeElement('div', { class: 'position' }, pos.toString());
            const usernameDiv = createSafeElement('div', { class: 'username' }, winner.username);
            const amountDiv = createSafeElement('div', { class: 'amount' }, `${winner.amount.toLocaleString()} coins`);
            const prizeDiv = createSafeElement('div', { class: 'prize' }, winner.prize);

            // Append all elements to winner container
            winnerDiv.appendChild(crownDiv);
            winnerDiv.appendChild(positionDiv);
            winnerDiv.appendChild(usernameDiv);
            winnerDiv.appendChild(amountDiv);
            winnerDiv.appendChild(prizeDiv);

            // Append to top container
            topContainer.appendChild(winnerDiv);
        });
    } else if (topContainer) {
        // Show no data message for top winners
        const messageDiv = createSafeElement('div', { class: 'no-data-message' });
        const icon = createSafeElement('i', { class: 'fas fa-exclamation-circle' });
        const text = createSafeElement('p', {}, 'No top winners data available.');

        messageDiv.appendChild(icon);
        messageDiv.appendChild(text);
        topContainer.appendChild(messageDiv);
    }

    // Render other winners
    if (otherContainer && data.otherWinners.length > 0) {
        // Create header row using sanitize utility
        const headerRow = createSafeElement('div', {
            'class': 'winner-row-header'
        });

        const headerRank = createSafeElement('span', {
            'class': 'header-rank'
        }, 'Rank');

        const headerUsername = createSafeElement('span', {
            'class': 'header-username'
        }, 'Username');

        const headerAmount = createSafeElement('span', {  // Ubah label tapi pertahankan class
            'class': 'header-amount'
        }, 'Wagered');

        const headerPrize = createSafeElement('span', {
            'class': 'header-prize'
        }, 'Prize');

        headerRow.appendChild(headerRank);
        headerRow.appendChild(headerUsername);
        headerRow.appendChild(headerAmount);
        headerRow.appendChild(headerPrize);

        otherContainer.appendChild(headerRow);
        
        // Create and append elements for other winners
        data.otherWinners.forEach(winner => {
            const winnerRow = createSafeElement('div', { class: 'winner-row' });

            const positionSpan = createSafeElement('span', { class: 'position' }, winner.position.toString());
            const usernameSpan = createSafeElement('span', { class: 'username' }, winner.username);
            const amountSpan = createSafeElement('span', { class: 'amount' }, `${winner.amount.toLocaleString()} coins`);
            const prizeSpan = createSafeElement('span', { class: 'prize' }, winner.prize);

            winnerRow.appendChild(positionSpan);
            winnerRow.appendChild(usernameSpan);
            winnerRow.appendChild(amountSpan);
            winnerRow.appendChild(prizeSpan);

            otherContainer.appendChild(winnerRow);
        });
    } else if (otherContainer) {
        // Show no data message for other winners
        const messageRow = createSafeElement('div', { class: 'winner-row no-data' });
        const messageText = createSafeElement('span', { class: 'no-data-text' }, 'No additional leaderboard entries available.');

        messageRow.appendChild(messageText);
        otherContainer.appendChild(messageRow);
    }

    // Add last updated timestamp if available
    if (data.timestamp) {
        const timestamp = new Date(data.timestamp);
        const formattedTime = timestamp.toLocaleString();

        const lastUpdated = createSafeElement('div', { class: 'last-updated' });
        const lastUpdatedText = createSafeElement('span', {}, `Last updated: ${formattedTime}`);

        lastUpdated.appendChild(lastUpdatedText);

        if (otherContainer) {
            otherContainer.appendChild(lastUpdated);
        } else if (topContainer) {
            topContainer.appendChild(lastUpdated);
        }
    }
}

/**
 * Shows a message when no data is available
 * @param {string} topContainerId - ID of the container for top winners
 * @param {string} otherContainerId - ID of the container for other winners
 */
function showNoDataMessage(topContainerId, otherContainerId) {
    // Get containers
    const topContainer = document.getElementById(topContainerId);
    const otherContainer = document.getElementById(otherContainerId);

    // Clear containers
    if (topContainer) topContainer.innerHTML = '';
    if (otherContainer) otherContainer.innerHTML = '';

    // Create message for top container
    if (topContainer) {
        const messageDiv = createSafeElement('div', { class: 'no-data-message' });
        const icon = createSafeElement('i', { class: 'fas fa-exclamation-circle' });
        const text = createSafeElement('p', {}, 'No leaderboard data available at the moment. Please check back later.');

        messageDiv.appendChild(icon);
        messageDiv.appendChild(text);
        topContainer.appendChild(messageDiv);
    }

    // Create message for other container
    if (otherContainer) {
        const messageRow = createSafeElement('div', { class: 'winner-row no-data' });
        const messageText = createSafeElement('span', { class: 'no-data-text' }, 'Leaderboard data will be updated soon.');

        messageRow.appendChild(messageText);
        otherContainer.appendChild(messageRow);
    }
}

/**
 * Safely creates a DOM element with the specified attributes and text content
 * @param {string} tag - The HTML tag to create
 * @param {Object} attributes - Attributes to set on the element
 * @param {string} textContent - Text content to set on the element
 * @returns {HTMLElement} - The created element
 */
function createSafeElement(tag, attributes = {}, textContent = '') {
    const element = document.createElement(tag);

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });

    // Set text content (safe from XSS)
    if (textContent) {
        element.textContent = textContent;
    }

    return element;
}

/**
 * Sanitizes a string to prevent XSS attacks
 * @param {string} str - The string to sanitize
 * @returns {string} - The sanitized string
 */
function sanitizeString(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Export functions for use in other files
window.leaderboardService = {
    renderLeaderboard,
    showNoDataMessage
};
