/**
 * Simple Leaderboard
 * A simplified version of the leaderboard that displays empty tables
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {

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
            if (!platform) {
                console.warn('Invalid platform:', platform);
                return;
            }



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

                // For XFUN, check which period is active
                if (platform === 'xfun') {
                    // Find the active period
                    const activePeriodOption = content.querySelector('.period-option.active');
                    if (activePeriodOption) {
                        const period = activePeriodOption.getAttribute('data-period');
                        // Show empty leaderboard for the active period
                        showEmptyLeaderboard(`xfun-${period}`);
                    } else {
                        // Default to May 2025 if no period is active
                        showEmptyLeaderboard('xfun-may2025');
                    }
                } else {
                    // For other platforms, show empty leaderboard as usual
                    showEmptyLeaderboard(platform);
                }
            }
        });
    });

    // Check if Firebase leaderboard service is available
    if (window.leaderboardService && typeof window.leaderboardService.renderLeaderboard === 'function') {
        // Firebase service will handle the leaderboard rendering
    } else {
        // Load default empty leaderboard on page load if Firebase service is not available
        showEmptyLeaderboard('xfun-may2025');
    }

    // Make the function available globally for the period selector
    window.showEmptyLeaderboard = showEmptyLeaderboard;
});

// Last updated function removed as requested

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
 * Show an empty leaderboard for the specified platform
 * @param {string} platform - The platform to show empty leaderboard for
 */
function showEmptyLeaderboard(platform) {

    // Get containers
    const topContainer = document.getElementById(`${platform}-top-winners`);
    const otherContainer = document.getElementById(`${platform}-other-winners`);

    // Clear containers
    if (topContainer) topContainer.innerHTML = '';
    if (otherContainer) otherContainer.innerHTML = '';

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

    // Last updated timestamp removed as requested

    // Render empty top winners (positions 1, 2, 3)
    if (topContainer) {
        // Create and append elements for positions 2, 1, and 3 in that order
        const positions = [2, 1, 3];
        const positionClasses = ['second', 'first', 'third'];

        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];

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
            }, '---');

            const amountDiv = sanitize.createSafeElement('div', {
                'class': 'amount'
            }, '0 coins');

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

    // Render empty other winners (positions 4-10)
    if (otherContainer) {
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

        // Create empty rows for positions 4-10
        for (let i = 4; i <= 10; i++) {
            const winnerRow = sanitize.createSafeElement('div', {
                'class': 'winner-row empty'
            });

            const positionSpan = sanitize.createSafeElement('span', {
                'class': 'position'
            }, i.toString());

            const usernameSpan = sanitize.createSafeElement('span', {
                'class': 'username'
            }, '---');

            const amountSpan = sanitize.createSafeElement('span', {
                'class': 'amount'
            }, '---');

            const prizeSpan = sanitize.createSafeElement('span', {
                'class': 'prize'
            }, prizes[i] || prizes.default);

            winnerRow.appendChild(positionSpan);
            winnerRow.appendChild(usernameSpan);
            winnerRow.appendChild(amountSpan);
            winnerRow.appendChild(prizeSpan);

            otherContainer.appendChild(winnerRow);
        }

        // Add CSS for empty rows if not already added
        if (!document.getElementById('empty-row-style')) {
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
    }
}

/**
 * Show a message when no data is available
 * @param {string} platform - The platform (xfun, raingg)
 * @param {string} [errorMessage] - Optional error message to display
 */
function showNoDataMessage(platform, errorMessage) {

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
