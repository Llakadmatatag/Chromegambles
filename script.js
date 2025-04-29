// This code has been moved to navigation.js
// The script.js file now only handles Firebase-related functionality
console.log('Main script loaded - Firebase functionality only');

// Function to sanitize strings to prevent XSS attacks
function sanitizeString(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Function to show a message when no data is available
function showNoDataMessage(topContainerId, otherContainerId) {
    // Get the containers
    const topContainer = document.getElementById(topContainerId);
    const otherContainer = document.getElementById(otherContainerId);

    // Clear any existing content
    if (topContainer) topContainer.innerHTML = '';
    if (otherContainer) otherContainer.innerHTML = '';

    // Create a message element for the top container
    if (topContainer) {
        const messageDiv = createSafeElement('div', { class: 'no-data-message' });
        const icon = createSafeElement('i', { class: 'fas fa-exclamation-circle' });
        const text = createSafeElement('p', {}, 'No leaderboard data available at the moment. Please check back later.');

        messageDiv.appendChild(icon);
        messageDiv.appendChild(text);
        topContainer.appendChild(messageDiv);
    }

    // Create a message for the other container if it exists
    if (otherContainer) {
        const messageRow = createSafeElement('div', { class: 'winner-row no-data' });
        const messageText = createSafeElement('span', { class: 'no-data-text' }, 'Leaderboard data will be updated soon.');

        messageRow.appendChild(messageText);
        otherContainer.appendChild(messageRow);
    }
}

// Function to safely create DOM elements without using innerHTML
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

// Fungsi untuk render leaderboard
async function renderLeaderboard(platform, topContainerId, otherContainerId) {
    try {
        console.log(`Rendering leaderboard for ${platform} to containers: ${topContainerId}, ${otherContainerId}`);

        // Use the secure function from firebase-config.js
        const unsubscribe = getLeaderboardData(
            'april-2025',
            'entries',
            'wagered',
            (snapshot) => {
                console.log(`Received data: ${snapshot.size} entries`);
                // Check if we have data
                if (snapshot.empty) {
                    console.log('No leaderboard data found');
                    showNoDataMessage(topContainerId, otherContainerId);
                    return;
                }

                const topWinners = [];
                const otherWinners = [];

                // Define prizes manually
                const prizes = {
                    1: "200 Coins",
                    2: "125 Coins",
                    3: "75 Coins",
                    4: "Personal Tips",
                    5: "Personal Tips",
                    6: "Personal Tips",
                    default: "" // Empty for ranks beyond 6
                };

                let position = 1;
                snapshot.forEach(doc => {
                    const data = doc.data();
                    // Sanitize data from Firebase
                    const winnerData = {
                        position: position,
                        username: data.name ? sanitizeString(data.name) : 'Unknown', // Sanitize username
                        amount: typeof data.wagered === 'number' ? data.wagered : 0, // Validate number
                        prize: prizes[position] || prizes.default,
                        deposited: typeof data.deposited === 'number' ? data.deposited : 0 // Validate number
                    };

                    if (position <= 3) {
                        topWinners.push(winnerData);
                    } else {
                        otherWinners.push(winnerData);
                    }
                    position++;
                });

                // Render top winners using safe DOM manipulation
                const topContainer = document.getElementById(topContainerId);
                // Clear previous content
                topContainer.innerHTML = '';

                // Create and append elements for positions 2, 1, and 3 in that order
                const positions = [2, 1, 3];

                positions.forEach(pos => {
                    const winner = topWinners.find(w => w.position === pos);
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

                // Render other winners using safe DOM manipulation
                const otherContainer = document.getElementById(otherContainerId);
                // Clear previous content
                otherContainer.innerHTML = '';

                // Create and append elements for other winners
                otherWinners.forEach(winner => {
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
            },
            (error) => {
                console.error('Error in leaderboard data callback:', error);
                showNoDataMessage(topContainerId, otherContainerId);
            }
        );
    } catch (error) {
        console.error('Error setting up listener:', error);
        showNoDataMessage(topContainerId, otherContainerId);
    }
}

// Remove this duplicate tab click handler (lines 193-204)
/*
tab.addEventListener('click', async () => {
    const platform = tab.dataset.tab.toLowerCase();
    let docId;

    if (platform === 'xfun') {
        docId = 'april-2025';
    }

    await renderLeaderboard(
        docId,
        `${platform}-top-winners`,
        `${platform}-other-winners`
    );
});
*/

// Initialize leaderboards when script is loaded
console.log('Firebase script loaded, initializing leaderboards...');

// Check Firebase availability and initialize leaderboard
function initializeLeaderboard() {
    // Check if Firebase is available
    if (typeof firebase !== 'undefined') {
        console.log('Firebase is available');
    } else {
        console.error('Firebase is not available');
        setTimeout(initializeLeaderboard, 1000); // Retry after 1 second
        return;
    }

    // Check if XFUN Firebase is available
    if (typeof xfunFirebaseApp !== 'undefined' && typeof getXfunLeaderboardData === 'function') {
        console.log('XFUN Firebase is available');
    } else {
        console.error('XFUN Firebase is not available');
        setTimeout(initializeLeaderboard, 1000); // Retry after 1 second
        return;
    }

    // Check if RAINGG Firebase is available
    if (typeof rainggFirebaseApp !== 'undefined' && typeof getRainggLeaderboardData === 'function') {
        console.log('RAINGG Firebase is available');
    } else {
        console.error('RAINGG Firebase is not available');
        setTimeout(initializeLeaderboard, 1000); // Retry after 1 second
        return;
    }

    // Check if leaderboard service is available
    if (window.leaderboardService && typeof window.leaderboardService.renderLeaderboard === 'function') {
        console.log('Leaderboard service is available');
    } else {
        console.error('Leaderboard service is not available');
        setTimeout(initializeLeaderboard, 1000); // Retry after 1 second
        return;
    }

    // All dependencies are available, initialize the default leaderboard (XFUN)
    try {
        console.log('Initializing XFUN leaderboard');
        window.leaderboardService.renderLeaderboard('xfun', 'xfun-top-winners', 'xfun-other-winners')
            .catch(error => {
                console.error('Error initializing XFUN leaderboard:', error);
                if (window.leaderboardService && typeof window.leaderboardService.showNoDataMessage === 'function') {
                    window.leaderboardService.showNoDataMessage('xfun-top-winners', 'xfun-other-winners');
                }
            });
    } catch (error) {
        console.error('Error initializing XFUN leaderboard:', error);
    }
}

// Start initialization process
initializeLeaderboard();

// Remove the calculatePrize function since we're setting prizes manually

function getPositionClass(position) {
    switch(position) {
        case 1: return 'first';
        case 2: return 'second';
        case 3: return 'third';
        default: return '';
    }
}