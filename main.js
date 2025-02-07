const API_KEY = '8c2d02fd67454c968dd6b9829c5b24eb'; // Replace with your actual API key
const BASE_URL = 'https://api.football-data.org/v4/';

let fuse;
let allTeams = [];

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('teamSearch');
    const searchBtn = document.getElementById('searchBtn');
    
    // Fetch all teams on initial load
    fetchTeams().then(() => {
        // Initialize fuzzy search
        fuse = new Fuse(allTeams, {
            keys: ['name'],
            threshold: 0.3,
            includeScore: true
        });
    });

    // Event listeners
    searchInput.addEventListener('input', handleSearchInput);
    searchBtn.addEventListener('click', handleSearch);
});

async function fetchTeams() {
    try {
        const response = await fetch(`${BASE_URL}teams`, {
            headers: { 'X-Auth-Token': API_KEY }
        });
        const data = await response.json();
        
        allTeams = data.teams.map(team => ({
            id: team.id,
            name: team.name.toLowerCase(),
            displayName: team.name,
            logo: team.crest,
            founded: team.founded,
            stadium: team.venue,
            website: team.website
        }));
    } catch (error) {
        console.error('Error fetching teams:', error);
        alert('Failed to load teams. Please try again later.');
    }
}

function handleSearchInput(e) {
    const searchTerm = e.target.value.trim().toLowerCase();
    const suggestions = document.getElementById('suggestions');
    suggestions.innerHTML = '';

    if (searchTerm.length === 0) return;

    const results = fuse.search(searchTerm).slice(0, 5);
    
    results.forEach(result => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = result.item.displayName;
        div.addEventListener('click', () => selectTeam(result.item));
        suggestions.appendChild(div);
    });
}

function selectTeam(team) {
    document.getElementById('teamSearch').value = team.displayName;
    document.getElementById('suggestions').innerHTML = '';
    showTeamInfo(team);
    fetchPlayers(team.id);
}

async function handleSearch() {
    const searchTerm = document.getElementById('teamSearch').value.trim();
    if (!searchTerm) return;

    const results = fuse.search(searchTerm);
    if (results.length === 0) {
        alert('No team found. Please try a different search.');
        return;
    }

    const bestMatch = results[0].item;
    selectTeam(bestMatch);
}

function showTeamInfo(team) {
    const teamInfo = document.getElementById('teamInfo');
    teamInfo.classList.remove('hidden');

    document.getElementById('teamName').textContent = team.displayName;
    document.getElementById('founded').textContent = team.founded || 'Unknown';
    document.getElementById('stadium').textContent = team.stadium || 'Unknown';
    
    const websiteLink = document.getElementById('website');
    websiteLink.href = team.website || '#';
    websiteLink.textContent = team.website ? new URL(team.website).hostname : 'Not available';

    const teamLogo = document.getElementById('teamLogo');
    teamLogo.src = team.logo || 'https://via.placeholder.com/100';
    teamLogo.onerror = () => teamLogo.src = 'https://via.placeholder.com/100';
}

async function fetchPlayers(teamId) {
    try {
        const response = await fetch(`${BASE_URL}teams/${teamId}`, {
            headers: { 'X-Auth-Token': API_KEY }
        });
        const data = await response.json();
        renderPlayers(data.squad);
    } catch (error) {
        console.error('Error fetching players:', error);
        alert('Failed to load players. Please try again later.');
    }
}

function renderPlayers(players) {
    const playersGrid = document.getElementById('players');
    playersGrid.innerHTML = '';

    if (!players || players.length === 0) {
        playersGrid.innerHTML = '<p>No player data available</p>';
        return;
    }

    players.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        playerCard.innerHTML = `
            <img src="${player.photo || 'https://via.placeholder.com/120'}" 
                 alt="${player.name}" 
                 class="player-image"
                 onerror="this.src='https://via.placeholder.com/120'">
            <h3>${player.name}</h3>
            <p>Position: ${player.position || 'N/A'}</p>
            <p>Nationality: ${player.nationality || 'N/A'}</p>
        `;
        playersGrid.appendChild(playerCard);
    });
}
