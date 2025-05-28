// Security utilities are already available via window.SecurityUtils

// Leaderboard data fetcher for BetBolt Google Sheets
async function fetchBetboltLeaderboard() {
    try {
        // Using a CORS proxy to fetch the Google Sheets data
        const sheetId = '1dbe2pJq8HXEYHwy0PwsXWluK8OpREOibnatklDaAHR4';
        
        // Get usernames from A2:A50
        const usernamesUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&range=A2:A50`;
        // Get wagered amounts from B2:B50
        const wageredUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&range=B2:B50`;
        
        // Using a CORS proxy
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        
        // Fetch usernames
        const usernamesResponse = await fetch(proxyUrl + encodeURIComponent(usernamesUrl));
        if (!usernamesResponse.ok) throw new Error('Failed to fetch usernames');
        
        // Fetch wagered amounts
        const wageredResponse = await fetch(proxyUrl + encodeURIComponent(wageredUrl));
        if (!wageredResponse.ok) throw new Error('Failed to fetch wagered amounts');
        
        // Process usernames
        let usernamesData = await usernamesResponse.text();
        usernamesData = usernamesData.substring(47).slice(0, -2);
        const usernamesJson = JSON.parse(usernamesData);
        
        // Process wagered amounts
        let wageredData = await wageredResponse.text();
        wageredData = wageredData.substring(47).slice(0, -2);
        const wageredJson = JSON.parse(wageredData);
        
        const leaderboardData = [];
        
        // Combine usernames and wagered amounts
        // We take the minimum length to ensure we don't go out of bounds
        const dataLength = Math.min(usernamesJson.table.rows.length, wageredJson.table.rows.length);
        
        for (let i = 0; i < dataLength; i++) {
            const username = usernamesJson.table.rows[i]?.c?.[0]?.v?.toString().trim() || '';
            const wagered = parseFloat(wageredJson.table.rows[i]?.c?.[0]?.v) || 0;
            
            if (username && !isNaN(wagered)) {
                leaderboardData.push({ username, wagered });
            }
        }
        
        // Sort by wagered amount (descending)
        const sortedData = leaderboardData.sort((a, b) => b.wagered - a.wagered);
        
        // Get top 3 for podium
        const podiumWinners = sortedData.slice(0, 3);
        
        // Ensure we have 10 total entries (3 for podium + 7 for table)
        const totalEntries = 10;
        const emptyEntry = { username: '-', wagered: 0 };
        
        // Fill remaining podium spots with empty data if needed
        while (podiumWinners.length < 3) {
            podiumWinners.push({...emptyEntry});
        }
        
        // Get table data (rank 4-10), fill with empty entries if needed
        let tableData = sortedData.slice(3, totalEntries);
        while (tableData.length < 7) {
            tableData.push({...emptyEntry});
        }
        
        // Update the podium and table
        updateBetboltPodium(podiumWinners);
        updateBetboltTable(tableData);
        
    } catch (error) {
        console.error('Error in fetchBetboltLeaderboard:', error);
        // Fallback to default data if there's an error
        const fallbackData = [
            { username: 'Player1', wagered: 10000 },
            { username: 'Player2', wagered: 8500 },
            { username: 'Player3', wagered: 7000 },
            { username: 'Player4', wagered: 5500 },
            { username: 'Player5', wagered: 4000 },
            { username: 'Player6', wagered: 3000 },
            { username: 'Player7', wagered: 2000 },
            { username: 'Player8', wagered: 1500 },
            { username: 'Player9', wagered: 1000 },
            { username: 'Player10', wagered: 500 }
        ];
        
        updateBetboltPodium(fallbackData.slice(0, 3));
        updateBetboltTable(fallbackData.slice(3, 10));
        
        // Show error message to user
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = 'Failed to load live leaderboard data. Using fallback data.';
            errorElement.style.display = 'block';
            
            // Hide the error after 5 seconds
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
    }
}

function updateBetboltPodium(players) {
    // Update first place
    if (players[0]) {
        const firstPlace = document.querySelector('#betbolt-podium .podium-place.first');
        if (firstPlace) {
            safeTextContent(firstPlace.querySelector('.username'), players[0].username);
            safeTextContent(firstPlace.querySelector('.wagered'), `$${players[0].wagered.toLocaleString()}`);
        }
    }
    
    // Update second place
    if (players[1]) {
        const secondPlace = document.querySelector('#betbolt-podium .podium-place.second');
        if (secondPlace) {
            safeTextContent(secondPlace.querySelector('.username'), players[1].username);
            safeTextContent(secondPlace.querySelector('.wagered'), `$${players[1].wagered.toLocaleString()}`);
        }
    }
    
    // Update third place
    if (players[2]) {
        const thirdPlace = document.querySelector('#betbolt-podium .podium-place.third');
        if (thirdPlace) {
            safeTextContent(thirdPlace.querySelector('.username'), players[2].username);
            safeTextContent(thirdPlace.querySelector('.wagered'), `$${players[2].wagered.toLocaleString()}`);
        }
    }
}

function updateBetboltTable(data) {
    const tableBody = document.querySelector('#betbolt-table tbody');
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add new rows (starting from rank 4)
    data.forEach((player, index) => {
        const row = document.createElement('tr');
        const rank = index + 4; // Start from rank 4
        const wageredDisplay = player.wagered > 0 ? `$${player.wagered.toLocaleString()}` : '-';
        const sanitizedUsername = escapeHtml(player.username);
        const sanitizedWagered = player.wagered.toLocaleString();
        const prize = getBetboltPrizeForRank(rank);
        const sanitizedPrize = escapeHtml(prize);
        
        row.innerHTML = `
            <td>${index + 4}</td>
            <td>${sanitizedUsername}</td>
            <td>$${sanitizedWagered}</td>
            <td>${sanitizedPrize}</td>
        `;
        tableBody.appendChild(row);
    });
}

function getBetboltPrizeForRank(rank) {
    const prizes = {
        1: '$500',
        2: '$300',
        3: '$100',
        4: '$50',
        5: '$50'
    };
    return prizes[rank] || '-';
}

// Initialize when the BetBolt tab is clicked
document.addEventListener('DOMContentLoaded', function() {
    const betboltTab = document.querySelector('[data-tab="betbolt"]');
    if (betboltTab) {
        betboltTab.addEventListener('click', function() {
            // Only fetch data when BetBolt tab is clicked
            if (this.classList.contains('active')) {
                fetchBetboltLeaderboard();
            }
        });
    }
});

// Also fetch data if BetBolt tab is active by default
if (document.querySelector('.tab-btn[data-tab="betbolt"].active')) {
    fetchBetboltLeaderboard();
}
