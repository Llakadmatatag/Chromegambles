/**
 * Period Selector Functionality
 * This file handles the period selector dropdown for leaderboards
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Period selector script loaded');

    // Get all period dropdowns
    const periodDropdowns = document.querySelectorAll('.period-dropdown');

    // Add click handler to each dropdown
    periodDropdowns.forEach(dropdown => {
        const button = dropdown.querySelector('.period-dropdown-btn');
        const content = dropdown.querySelector('.period-dropdown-content');
        const currentPeriodText = dropdown.querySelector('.current-period');
        const options = dropdown.querySelectorAll('.period-option');

        // Toggle dropdown on button click
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Close all other dropdowns
            periodDropdowns.forEach(otherDropdown => {
                if (otherDropdown !== dropdown) {
                    otherDropdown.classList.remove('open');
                }
            });

            // Toggle current dropdown
            dropdown.classList.toggle('open');
        });

        // Handle option selection
        options.forEach(option => {
            option.addEventListener('click', function(e) {
                e.preventDefault();

                // Get period data
                const period = this.getAttribute('data-period');
                const periodName = this.querySelector('.period-name').textContent;
                const periodPrize = this.querySelector('.period-prize').textContent;

                // Update button text
                currentPeriodText.textContent = `${periodName} - ${periodPrize}`;

                // Update active class
                options.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');

                // Close dropdown
                dropdown.classList.remove('open');

                // Show corresponding content
                const parentContent = dropdown.closest('.leaderboard-content');
                const periodContents = parentContent.querySelectorAll('.period-content');

                periodContents.forEach(content => {
                    content.classList.remove('active');
                });

                const targetContent = document.getElementById(`xfun-${period}`);
                if (targetContent) {
                    targetContent.classList.add('active');

                    // Initialize leaderboard data for this period if needed
                    if (period === 'may2025') {
                        // May 2025 is in "Coming Soon" state - no need to render data
                        // The Coming Soon message is already in the HTML
                        // We'll keep the Firebase configuration ready for when the leaderboard goes live
                        // but we won't render any data for now
                    } else if (period === 'apr2025' && window.leaderboardService && typeof window.leaderboardService.renderLeaderboard === 'function') {
                        // Use regular leaderboard service for April 2025
                        try {
                            window.leaderboardService.renderLeaderboard(
                                `xfun-${period}`,
                                `xfun-${period}-top-winners`,
                                `xfun-${period}-other-winners`
                            );
                        } catch (error) {
                            console.error(`Error loading xfun-${period} leaderboard:`, error);
                        }
                    } else {
                        // If appropriate leaderboard service is not available, use the simple leaderboard
                        showEmptyLeaderboard(`xfun-${period}`);
                    }
                }
            });
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        periodDropdowns.forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });
    });
});
