/**
 * Firebase Leaderboard Service
 * This file handles the connection to Firebase and populates the leaderboard with real data
 */

// Initialize Firebase when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyDKGAfmpwva2ky4LU7oQkITQvsbnAW1rjE",
        authDomain: "chrome-s-xfun-lb.firebaseapp.com",
        databaseURL: "https://chrome-s-xfun-lb-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "chrome-s-xfun-lb",
        storageBucket: "chrome-s-xfun-lb.firebasestorage.app",
        messagingSenderId: "193063288777",
        appId: "1:193063288777:web:f82c3d8f245fa7bb637218",
        measurementId: "G-QJ66W48WVQ"
    };

    // Initialize Firebase
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        // Create the leaderboard service
        window.leaderboardService = {
            renderLeaderboard: renderLeaderboard
        };

        // Check if we need to load the XFUN April 2025 leaderboard on page load
        const xfunAprilContent = document.getElementById('xfun-apr2025');
        if (xfunAprilContent && xfunAprilContent.classList.contains('active')) {
            renderLeaderboard('xfun-apr2025', 'xfun-apr2025-top-winners', 'xfun-apr2025-other-winners');
        }

        // Add click handler to the XFUN tab to load April 2025 data when clicked
        const xfunTab = document.querySelector('.tab-btn[data-tab="xfun"]');
        if (xfunTab) {
            xfunTab.addEventListener('click', function() {
                // Check if April 2025 is the active period
                const aprilOption = document.querySelector('.period-option[data-period="apr2025"]');
                if (aprilOption && aprilOption.classList.contains('active')) {
                    setTimeout(() => {
                        renderLeaderboard('xfun-apr2025', 'xfun-apr2025-top-winners', 'xfun-apr2025-other-winners');
                    }, 100); // Small delay to ensure DOM is updated
                }
            });
        }
    } catch (error) {
        console.error('Error initializing Firebase:', error);
    }
});

/**
 * Render leaderboard data from Firestore
 * @param {string} platform - The platform identifier (e.g., 'xfun-apr2025')
 * @param {string} topContainerId - ID of the container for top 3 winners
 * @param {string} otherContainerId - ID of the container for other winners
 */
async function renderLeaderboard(platform, topContainerId, otherContainerId) {
    // Only handle XFUN April 2025 leaderboard for now
    if (platform !== 'xfun-apr2025') {
        showEmptyLeaderboard(platform);
        return;
    }

    try {
        // Get containers
        const topContainer = document.getElementById(topContainerId);
        const otherContainer = document.getElementById(otherContainerId);

        if (!topContainer || !otherContainer) {
            console.error(`Containers not found for ${platform}`);
            return;
        }

        // Clear containers
        topContainer.innerHTML = '';
        otherContainer.innerHTML = '';

        // Show loading indicator
        showLoadingIndicator(topContainer, otherContainer);

        // Get Firestore instance
        const db = firebase.firestore();

        // Reference to the entries collection
        const entriesRef = db.collection('leaderboards').doc('april-2025').collection('entries');

        // Get entries ordered by wagered amount (descending)
        const snapshot = await entriesRef.orderBy('wagered', 'desc').limit(10).get();

        if (snapshot.empty) {
            // Clear loading indicators
            clearLoadingIndicators(topContainer, otherContainer);

            // Show no data message
            showNoDataMessage(platform, 'No leaderboard data available for April 2025');
            return;
        }

        // Process the data
        const entries = [];
        snapshot.forEach(doc => {
            entries.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Clear loading indicators
        clearLoadingIndicators(topContainer, otherContainer);

        // Define prize structure for XFUN
        const prizes = {
            1: "200 Coins",
            2: "125 Coins",
            3: "75 Coins",
            4: "Personal Tips",
            5: "Personal Tips",
            6: "Personal Tips",
            default: "" // Empty for ranks beyond 6
        };

        // Render top 3 winners
        if (entries.length >= 3) {
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

                const usernameDiv = sanitize.createSafeElement('div', {
                    'class': 'username'
                }, sanitize.escapeHTML(entry.name));

                const amountDiv = sanitize.createSafeElement('div', {
                    'class': 'amount'
                }, formatNumber(entry.wagered) + ' coins');

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

                const usernameSpan = sanitize.createSafeElement('span', {
                    'class': 'username'
                }, sanitize.escapeHTML(entry.name));

                const amountSpan = sanitize.createSafeElement('span', {
                    'class': 'amount'
                }, formatNumber(entry.wagered));

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

        // Removed data source indicator as requested

    } catch (error) {
        console.error('Error rendering leaderboard:', error);

        // Clear loading indicators
        clearLoadingIndicators(topContainer, otherContainer);

        // Show error message
        showNoDataMessage(platform, 'Error loading leaderboard data');
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
    // Remove any existing loading indicators first
    const existingTopLoading = topContainer.querySelector('.loading-indicator');
    const existingOtherLoading = otherContainer.querySelector('.loading-indicator');

    if (existingTopLoading) {
        topContainer.removeChild(existingTopLoading);
    }

    if (existingOtherLoading) {
        otherContainer.removeChild(existingOtherLoading);
    }

    // Create loading indicator for top container
    const topLoading = sanitize.createSafeElement('div', {
        'class': 'loading-indicator',
        'id': 'top-loading-indicator'
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
        'id': 'other-loading-indicator'
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
    const topLoading = document.getElementById('top-loading-indicator');
    const otherLoading = document.getElementById('other-loading-indicator');

    if (topLoading && topLoading.parentNode === topContainer) {
        topContainer.removeChild(topLoading);
    }

    if (otherLoading && otherLoading.parentNode === otherContainer) {
        otherContainer.removeChild(otherLoading);
    }
}

/**
 * Add data source indicator to the container
 * @param {HTMLElement} container - Container to add the indicator to
 * @param {string} source - Data source name (Firebase, API, etc.)
 */
function addDataSourceIndicator(container, source) {
    const dataSourceDiv = sanitize.createSafeElement('div', {
        'class': `data-source ${source.toLowerCase()}`
    });

    const icon = sanitize.createSafeElement('i', {
        'class': source.toLowerCase() === 'firebase' ? 'fas fa-database' : 'fas fa-server'
    });

    const text = sanitize.createSafeElement('span', {}, `Data source: ${source}`);

    dataSourceDiv.appendChild(icon);
    dataSourceDiv.appendChild(text);
    container.appendChild(dataSourceDiv);

    // Add CSS for data source indicator if not already added
    if (!document.getElementById('data-source-style')) {
        const style = sanitize.createSafeElement('style', {
            'id': 'data-source-style'
        });
        style.textContent = `
            .data-source {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                margin-top: 1.5rem;
                padding: 0.5rem 1rem;
                border-radius: 50px;
                font-size: 0.8rem;
                font-weight: 600;
                opacity: 0.8;
            }

            .data-source i {
                font-size: 0.9rem;
            }

            .data-source.firebase {
                background: rgba(255, 193, 7, 0.2);
                color: var(--accent-gold);
            }
        `;
        document.head.appendChild(style);
    }
}
