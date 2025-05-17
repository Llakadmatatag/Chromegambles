// Initialize Firebase from firebase-config.js is already done

// Function to format numbers with commas
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Function to update leaderboard data
async function updateLeaderboard() {
    try {
        console.log("Starting updateLeaderboard...");
        // Get the most recent diceblox document
        const snapshot = await db.collection('diceblox')
            .orderBy(firebase.firestore.FieldPath.documentId(), 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) {
            console.error("No documents found");
            return;
        }

        const doc = snapshot.docs[0];

        console.log("Document data:", doc.data());
        
        // Get rankings data
        const rankings = doc.data().rankings;
        if (!rankings) {
            console.error("No rankings data found");
            return;
        }

        // Clear existing tbody
        const tbody = document.querySelector('.leaderboard-section table tbody');
        tbody.innerHTML = '';

        // Store all player data
        const players = [];
        
        // Process rankings data (0-9)
        for (let i = 0; i < 10; i++) {
            const rankData = rankings[i];
            if (rankData && typeof rankData === 'object' && rankData.username && rankData.wagered !== undefined) {
                players.push({
                    rank: i,
                    username: rankData.username,
                    wagered: rankData.wagered
                });
            } else {
                console.warn(`Rank data at index ${i} is missing or invalid:`, rankData);
            }
        }

        // Sort players by rank
        players.sort((a, b) => a.rank - b.rank);

        // Update podium (top 3)
        const positions = ['gold', 'silver', 'bronze'];
        players.slice(0, 3).forEach((player, index) => {
            const position = positions[index];
            const podiumItem = document.querySelector(`.podium-item.${position}`);
            
            if (podiumItem) {
                const nameElement = podiumItem.querySelector('.winner-name');
                const wageredElement = podiumItem.querySelector('.winner-wagered');
                
                if (nameElement) {
                    nameElement.textContent = player.username;
                }
                if (wageredElement) {
                    wageredElement.textContent = `${formatNumber(player.wagered)} coins`;
                }
            } else {
                console.error(`Podium item with position ${position} not found`);
            }
        });

        // Populate table with players ranked 4-10 only
        players.forEach(player => {
            // Skip first 3 players (they're shown in podium)
            if (player.rank > 2) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${player.rank + 1}</td>
                    <td>${player.username}</td>
                    <td>${formatNumber(player.wagered)} coins</td>
                    <td>${player.rank === 3 || player.rank === 4 ? '$25' : '-'}</td>
                `;
                tbody.appendChild(row);
            }
        });

    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initial update
    updateLeaderboard();

    // Update every 30 seconds
    setInterval(updateLeaderboard, 30000);
});
