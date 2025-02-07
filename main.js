document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://www.thesportsdb.com/api/v1/json/3/';
    const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
    let fuse;
    let allTeams = [];

    // Initialize application
    initApp();

    async function initApp() {
        try {
            await fetchTeams();
            setupEventListeners();
        } catch (error) {
            showError('Failed to initialize application. Please refresh the page.');
        }
    }

    async function fetchTeams() {
        try {
            const response = await fetch(`${CORS_PROXY}${encodeURIComponent(API_URL)}search_all_teams.php?l=English%20Premier%20League`);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            if (!data.teams) throw new Error('No teams found in response');
            
            allTeams = data.teams.map(team => ({
                id: team.idTeam,
                name: team.strTeam.toLowerCase(),
                displayName: team.strTeam,
                badge: team.strTeamBadge,
                stadium: team.strStadium,
                titles: team.intLoved || '0'
            }));
            
            fuse = new Fuse(allTeams, {
                keys: ['name'],
                threshold: 0.3,
                includeScore: true
            });
        } catch (error) {
            console.error('Fetch teams error:', error);
            showError('Failed to load teams. Please try again later.');
            throw error;
        }
    }

    function setupEventListeners() {
        const searchInput = document.getElementById('teamSearch');
        const searchBtn = document.getElementById('searchBtn');
        
        searchInput.addEventListener('input', handleSearchInput);
        searchBtn.addEventListener('click', handleSearch);
    }

    function handleSearchInput(e) {
        const searchTerm = e.target.value.trim().toLowerCase();
        const suggestions = document.getElementById('suggestions');
        suggestions.innerHTML = '';

        if (!searchTerm) return;

        const results = fuse.search(searchTerm).slice(0, 5);
        results.forEach(result => createSuggestionItem(result.item));
    }

    function createSuggestionItem(team) {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = team.displayName;
        div.addEventListener('click', () => selectTeam(team));
        document.getElementById('suggestions').appendChild(div);
    }

    async function handleSearch() {
        const searchTerm = document.getElementById('teamSearch').value.trim();
        if (!searchTerm) return;

        try {
            const results = fuse.search(searchTerm);
            if (!results.length) throw new Error('Team not found');
            
            selectTeam(results[0].item);
        } catch (error) {
            showError('Team not found. Please try a different search.');
        }
    }

    async function selectTeam(team) {
        try {
            document.getElementById('teamSearch').value = team.displayName;
            document.getElementById('suggestions').innerHTML = '';
            showTeamInfo(team);
            await fetchTeamPlayers(team.id);
        } catch (error) {
            showError('Failed to load team details. Please try again.');
        }
    }

    function showTeamInfo(team) {
        const teamInfo = document.getElementById('teamInfo');
        teamInfo.classList.remove('hidden');

        document.getElementById('teamName').textContent = team.displayName;
        document.getElementById('teamStadium').textContent = team.stadium || 'Unknown';
        document.getElementById('teamTitles').textContent = team.titles;

        const teamBadge = document.getElementById('teamBadge');
        teamBadge.src = team.badge;
        teamBadge.onerror = () => teamBadge.src = 'https://via.placeholder.com/120';
    }

    async function fetchTeamPlayers(teamId) {
        try {
            const response = await fetch(`${CORS_PROXY}${encodeURIComponent(API_URL)}lookup_all_players.php?id=${teamId}`);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            renderPlayers(data.player || []);
        } catch (error) {
            console.error('Fetch players error:', error);
            showError('Failed to load players. Please try again.');
        }
    }

    function renderPlayers(players) {
        const playersGrid = document.getElementById('players');
        playersGrid.innerHTML = players.length ? 
            players.map(player => createPlayerCard(player)).join('') : 
            '<p class="no-players">No player data available</p>';
    }

    function createPlayerCard(player) {
        return `
            <div class="player-card">
                <img src="${player.strCutout || player.strThumb || 'https://via.placeholder.com/120'}" 
                     alt="${player.strPlayer}" 
                     class="player-image"
                     onerror="this.src='https://via.placeholder.com/120'">
                <h3>${player.strPlayer}</h3>
                <p>Position: ${player.strPosition || 'N/A'}</p>
                <p>Nationality: ${player.strNationality || 'N/A'}</p>
            </div>
        `;
    }

    function showError(message) {
        alert(message);
    }
});
