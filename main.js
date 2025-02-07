document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://www.thesportsdb.com/api/v1/json/3/';
    let fuse;
    let allTeams = [];

    // Initialize application
    initApp();

    async function initApp() {
        await fetchPopularTeams();
        setupEventListeners();
    }

    async function fetchPopularTeams() {
        try {
            const response = await fetch(`${API_URL}search_all_teams.php?l=English%20Premier%20League`);
            const data = await response.json();
            allTeams = data.teams.map(team => ({
                id: team.idTeam,
                name: team.strTeam.toLowerCase(),
                displayName: team.strTeam,
                badge: team.strTeamBadge,
                stadium: team.strStadium,
                titles: team.intLoved || '0'
            }));
            
            // Initialize fuzzy search
            fuse = new Fuse(allTeams, {
                keys: ['name'],
                threshold: 0.3,
                includeScore: true
            });
        } catch (error) {
            console.error('Error fetching teams:', error);
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

    async function selectTeam(team) {
        document.getElementById('teamSearch').value = team.displayName;
        document.getElementById('suggestions').innerHTML = '';
        showTeamInfo(team);
        await fetchTeamPlayers(team.id);
    }

    function showTeamInfo(team) {
        const teamInfo = document.getElementById('teamInfo');
        teamInfo.classList.remove('hidden');

        document.getElementById('teamName').textContent = team.displayName;
        document.getElementById('teamStadium').textContent = team.stadium;
        document.getElementById('teamTitles').textContent = team.titles;

        const teamBadge = document.getElementById('teamBadge');
        teamBadge.src = team.badge || 'https://via.placeholder.com/120';
        teamBadge.onerror = () => teamBadge.src = 'https://via.placeholder.com/120';
    }

    async function fetchTeamPlayers(teamId) {
        try {
            const response = await fetch(`${API_URL}lookup_all_players.php?id=${teamId}`);
            const data = await response.json();
            renderPlayers(data.player || []);
        } catch (error) {
            console.error('Error fetching players:', error);
        }
    }

    function renderPlayers(players) {
        const playersGrid = document.getElementById('players');
        playersGrid.innerHTML = '';

        if (players.length === 0) {
            playersGrid.innerHTML = '<p class="no-players">No player data available</p>';
            return;
        }

        players.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            playerCard.innerHTML = `
                <img src="${player.strCutout || player.strThumb || 'https://via.placeholder.com/120'}" 
                     alt="${player.strPlayer}" 
                     class="player-image"
                     onerror="this.src='https://via.placeholder.com/120'">
                <h3>${player.strPlayer}</h3>
                <p>Position: ${player.str
