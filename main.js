document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://www.thesportsdb.com/api/v1/json/3/';
    const CORS_PROXY = 'https://corsproxy.org/?';
    let allTeams = [];
    
    const elements = {
        searchInput: document.getElementById('teamSearch'),
        teamList: document.getElementById('teamList'),
        searchBtn: document.getElementById('searchBtn'),
        loading: document.getElementById('loading'),
        teamInfo: document.getElementById('teamInfo'),
        playersGrid: document.getElementById('players')
    };

    // Initialize application
    initApp();

    async function initApp() {
        try {
            showLoading();
            await fetchTeams();
            populateTeamList();
            setupEventListeners();
        } catch (error) {
            showError('Failed to initialize. Please refresh the page.');
        } finally {
            hideLoading();
        }
    }

    async function fetchTeams() {
        try {
            const response = await fetch(
                `${CORS_PROXY}${encodeURIComponent(API_URL)}search_all_teams.php?l=English%20Premier%20League`
            );
            
            if (!response.ok) throw new Error('Failed to fetch teams');
            
            const data = await response.json();
            if (!data.teams) throw new Error('No teams found');
            
            allTeams = data.teams.map(team => ({
                id: team.idTeam,
                name: team.strTeam,
                badge: team.strTeamBadge,
                stadium: team.strStadium,
                formed: team.intFormedYear,
                website: team.strWebsite
            }));
            
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    function populateTeamList() {
        elements.teamList.innerHTML = allTeams
            .map(team => `<option value="${team.name}">${team.name}</option>`)
            .join('');
    }

    function setupEventListeners() {
        elements.searchBtn.addEventListener('click', handleSearch);
        elements.searchInput.addEventListener('input', handleInput);
    }

    async function handleSearch() {
        const searchTerm = elements.searchInput.value.trim();
        if (!searchTerm) return;

        try {
            const team = allTeams.find(t => t.name.toLowerCase() === searchTerm.toLowerCase());
            if (!team) throw new Error('Team not found');
            
            showLoading();
            await displayTeamInfo(team);
            await fetchPlayers(team.id);
        } catch (error) {
            showError('Team not found. Please select from the dropdown.');
        } finally {
            hideLoading();
        }
    }

    function handleInput() {
        const searchTerm = elements.searchInput.value.trim();
        if (!searchTerm) elements.teamInfo.classList.add('hidden');
    }

    async function displayTeamInfo(team) {
        elements.teamInfo.classList.remove('hidden');
        
        document.getElementById('teamName').textContent = team.name;
        document.getElementById('teamStadium').textContent = team.stadium || 'Unknown';
        document.getElementById('teamTitles').textContent = team.formed || 'Unknown';

        const teamBadge = document.getElementById('teamBadge');
        teamBadge.src = team.badge;
        teamBadge.onerror = () => teamBadge.src = 'https://via.placeholder.com/120';
    }

    async function fetchPlayers(teamId) {
        try {
            const response = await fetch(
                `${CORS_PROXY}${encodeURIComponent(API_URL)}lookup_all_players.php?id=${teamId}`
            );
            
            if (!response.ok) throw new Error('Failed to fetch players');
            
            const data = await response.json();
            renderPlayers(data.player || []);
        } catch (error) {
            console.error('Players error:', error);
            showError('Failed to load players.');
        }
    }

    function renderPlayers(players) {
        elements.playersGrid.innerHTML = players.length ? 
            players.map(player => `
                <div class="player-card">
                    <img src="${player.strCutout || player.strThumb || 'https://via.placeholder.com/120'}" 
                         alt="${player.strPlayer}" 
                         class="player-image"
                         onerror="this.src='https://via.placeholder.com/120'">
                    <h3>${player.strPlayer}</h3>
                    <p>Position: ${player.strPosition || 'N/A'}</p>
                    <p>Nationality: ${player.strNationality || 'N/A'}</p>
                </div>
            `).join('') : 
            '<p class="no-players">No player data available</p>';
    }

    function showLoading() {
        elements.loading.classList.remove('hidden');
    }

    function hideLoading() {
        elements.loading.classList.add('hidden');
    }

    function showError(message) {
        alert(message);
    }
});
