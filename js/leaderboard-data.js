// Security utilities are now available via window.SecurityUtils

// Fallback data in case of errors
const FALLBACK_DATA = [
    { username: 'Player1', wagered: 5000 },
    { username: 'Player2', wagered: 4500 },
    { username: 'Player3', wagered: 4000 },
    { username: 'Player4', wagered: 3500 },
    { username: 'Player5', wagered: 3000 },
    { username: 'Player6', wagered: 2500 },
    { username: 'Player7', wagered: 2000 },
    { username: 'Player8', wagered: 1500 },
    { username: 'Player9', wagered: 1000 },
    { username: 'Player10', wagered: 500 }
];

// Leaderboard data fetcher for Google Sheets
async function fetchDicebloxLeaderboard() {
    console.log('Fetching leaderboard data...');
    
    try {
        // Using a CORS proxy to fetch the Google Sheets data
        const sheetId = '1B2uro1WbyaxLGVmohk_N7vX1qXXGCO4Ys191mg3sTgs';
        const sheetName = 'Sheet1';
        
        // Try multiple CORS proxies in case one fails
        const proxyUrls = [
            'https://api.allorigins.win/raw?url=',
            'https://cors-anywhere.herokuapp.com/',
            'https://api.codetabs.com/v1/proxy?quest='
        ];
        
        const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
        
        let response;
        let lastError;
        
        // Try each proxy until one works
        for (const proxyUrl of proxyUrls) {
            try {
                console.log(`Trying proxy: ${proxyUrl}...`);
                response = await fetch(proxyUrl + encodeURIComponent(sheetUrl), {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                if (response.ok) {
                    console.log('Successfully fetched data');
                    break;
                }
            } catch (err) {
                console.warn(`Proxy ${proxyUrl} failed:`, err);
                lastError = err;
                continue;
            }
        }
        
        if (!response || !response.ok) {
            throw lastError || new Error('All proxies failed');
        }
        
        let data = await response.text();
        console.log('Raw data received:', data.substring(0, 100) + '...');
        
        // Clean up the response (remove the garbage characters that Google Sheets API adds)
        try {
            // Handle different response formats from different proxies
            if (data.startsWith('/*O_o*/\n')) {
                data = data.substring(9);
            }
            
            if (data.startsWith('{"contents":"')) {
                // Handle JSONP-like response
                const json = JSON.parse(data);
                data = json.contents;
            }
            
            // Remove wrapper if present
            const jsonStart = data.indexOf('{');
            const jsonEnd = data.lastIndexOf('}') + 1;
            if (jsonStart >= 0 && jsonEnd > jsonStart) {
                data = data.substring(jsonStart, jsonEnd);
            }
            
            const jsonData = JSON.parse(data);
            console.log('Parsed JSON data:', jsonData);
            
            if (!jsonData.table || !jsonData.table.rows) {
                throw new Error('Invalid data format from Google Sheets');
            }
            
            // Parse the data
            const rows = jsonData.table.rows;
            const leaderboardData = [];
            
            console.log(`Found ${rows.length} rows in the sheet`);
            
            // Extract username and wagered amount, convert to proper format
            for (let i = 1; i < rows.length; i++) { // Start from 1 to skip header
                try {
                    const row = rows[i];
                    if (!row.c || row.c.length < 4) continue;
                    
                    const username = (row.c[3]?.v || '').toString().trim();
                    const wagered = parseFloat(row.c[2]?.v) || 0;
                    
                    if (username && wagered > 0) {
                        leaderboardData.push({ username, wagered });
                    }
                } catch (rowError) {
                    console.warn(`Error processing row ${i}:`, rowError);
                    continue;
                }
            }
            
            console.log(`Processed ${leaderboardData.length} valid entries`);
        
            // Sort by wagered amount (descending)
            const sortedData = leaderboardData.sort((a, b) => b.wagered - a.wagered);
            
            console.log('Sorted data:', sortedData);
            
            // Get top 3 for podium
            const podiumWinners = sortedData.slice(0, 3);
            
            // Get the rest (rank 4-10) for the table
            const tableData = sortedData.slice(3, 10);
            
            console.log('Updating podium with:', podiumWinners);
            console.log('Updating table with:', tableData);
            
            // Update the podium
            updatePodium(podiumWinners);
            
            // Update the leaderboard table with remaining players
            updateLeaderboardTable(tableData);
            
            return true;
        } catch (parseError) {
            console.error('Error parsing sheet data:', parseError);
            throw new Error('Failed to parse sheet data: ' + parseError.message);
        }
    } catch (error) {
        console.error('Error in fetchDicebloxLeaderboard:', error);
        
        // Use fallback data
        console.warn('Using fallback data due to error');
        const sortedData = [...FALLBACK_DATA].sort((a, b) => b.wagered - a.wagered);
        updatePodium(sortedData.slice(0, 3));
        updateLeaderboardTable(sortedData.slice(3, 10));
        return false;
    }
}

function updatePodium(players) {
    // Update first place
    if (players[0]) {
        const firstPlace = document.querySelector('.podium-place.first');
        if (firstPlace) {
            safeTextContent(firstPlace.querySelector('.username'), players[0].username);
            safeTextContent(firstPlace.querySelector('.wagered'), `${players[0].wagered.toLocaleString()} coins`);
        }
    }
    
    // Update second place
    if (players[1]) {
        const secondPlace = document.querySelector('.podium-place.second');
        if (secondPlace) {
            safeTextContent(secondPlace.querySelector('.username'), players[1].username);
            safeTextContent(secondPlace.querySelector('.wagered'), `${players[1].wagered.toLocaleString()} coins`);
        }
    }
    
    // Update third place
    if (players[2]) {
        const thirdPlace = document.querySelector('.podium-place.third');
        if (thirdPlace) {
            safeTextContent(thirdPlace.querySelector('.username'), players[2].username);
            safeTextContent(thirdPlace.querySelector('.wagered'), `${players[2].wagered.toLocaleString()} coins`);
        }
    }
}

function updateLeaderboardTable(data) {
    const tableBody = document.querySelector('#diceblox-table tbody');
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add new rows (starting from rank 4)
    data.forEach((player, index) => {
        const row = document.createElement('tr');
        const sanitizedUsername = escapeHtml(player.username);
        const sanitizedWagered = player.wagered.toLocaleString();
        const sanitizedPrize = escapeHtml(getPrizeForRank(index + 4));
        
        row.innerHTML = `
            <td>${index + 4}</td>
            <td>${sanitizedUsername}</td>
            <td>${sanitizedWagered} coins</td>
            <td>${sanitizedPrize}</td>
        `;
        tableBody.appendChild(row);
    });
}

function getPrizeForRank(rank) {
    const prizes = {
        1: '$200',
        2: '$100',
        3: '$50',
        4: '$25',
        5: '$25'
    };
    return prizes[rank] || '-';
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing leaderboard...');
    
    // Show loading state
    const loadingElement = document.createElement('div');
    loadingElement.id = 'leaderboard-loading';
    loadingElement.textContent = 'Loading leaderboard data...';
    loadingElement.style.textAlign = 'center';
    loadingElement.style.padding = '20px';
    loadingElement.style.color = '#fff';
    
    const container = document.querySelector('.leaderboard-container');
    if (container) {
        container.insertBefore(loadingElement, container.firstChild);
    }
    
    // Load data with a small delay to ensure DOM is ready
    setTimeout(() => {
        fetchDicebloxLeaderboard().then(success => {
            // Remove loading indicator
            if (loadingElement && loadingElement.parentNode) {
                loadingElement.remove();
            }
            
            if (!success) {
                // Show warning about using fallback data
                const warning = document.createElement('div');
                warning.className = 'leaderboard-warning';
                warning.textContent = 'Using fallback data. Unable to fetch live leaderboard.';
                warning.style.color = '#ffcc00';
                warning.style.textAlign = 'center';
                warning.style.padding = '10px';
                warning.style.margin = '10px 0';
                warning.style.border = '1px solid #ffcc00';
                warning.style.borderRadius = '4px';
                
                if (container) {
                    container.insertBefore(warning, container.firstChild);
                }
            }
        });
    }, 100);
});
