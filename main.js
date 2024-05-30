document.addEventListener("DOMContentLoaded", () => {
    const topTeams = [
        { name: 'Manchester City', league: 'Premier League' },
        { name: 'Liverpool', league: 'Premier League' },
        { name: 'Chelsea', league: 'Premier League' },
        { name: 'Manchester United', league: 'Premier League' },
        { name: 'Tottenham Hotspur', league: 'Premier League' },

        { name: 'Real Madrid', league: 'La Liga' },
        { name: 'Barcelona', league: 'La Liga' },
        { name: 'Atletico Madrid', league: 'La Liga' },
        { name: 'Sevilla', league: 'La Liga' },
        { name: 'Real Sociedad', league: 'La Liga' },

        { name: 'Napoli', league: 'Serie A' },
        { name: 'Juventus', league: 'Serie A' },
        { name: 'Inter Milan', league: 'Serie A' },
        { name: 'AC Milan', league: 'Serie A' },
        { name: 'AS Roma', league: 'Serie A' },

        { name: 'Bayern Munich', league: 'Bundesliga' },
        { name: 'Borussia Dortmund', league: 'Bundesliga' },
        { name: 'RB Leipzig', league: 'Bundesliga' },
        { name: 'Bayer Leverkusen', league: 'Bundesliga' },
        { name: 'Borussia Mönchengladbach', league: 'Bundesliga' },

        { name: 'Paris Saint-Germain', league: 'Ligue 1' },
        { name: 'Lille', league: 'Ligue 1' },
        { name: 'Lyon', league: 'Ligue 1' },
        { name: 'Marseille', league: 'Ligue 1' },
        { name: 'Monaco', league: 'Ligue 1' },

        { name: 'Galatasaray', league: 'Turkish Super League' },
        { name: 'Fenerbahçe', league: 'Turkish Super League' },
        { name: 'Beşiktaş', league: 'Turkish Super League' },
        { name: 'Trabzonspor', league: 'Turkish Super League' }
    ];

    function getRandomTeams(num) {
        const shuffled = topTeams.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, num);
    }

    function displayTeams() {
        const leftTeamsDiv = document.getElementById("left-teams");
        const topTeamsDiv = document.getElementById("top-teams");
        const leftTeams = getRandomTeams(3);
        const topTeams = getRandomTeams(3);

        leftTeams.forEach(team => {
            const teamDiv = document.createElement("div");
            teamDiv.className = "team";
            teamDiv.innerText = team.name;
            leftTeamsDiv.appendChild(teamDiv);
        });

        topTeams.forEach(team => {
            const teamDiv = document.createElement("div");
            teamDiv.className = "team";
            teamDiv.innerText = team.name;
            topTeamsDiv.appendChild(teamDiv);
        });

        return { leftTeams, topTeams };
    }

    const { leftTeams, topTeams } = displayTeams();

    const cells = document.querySelectorAll("[data-cell]");
    const turnIndicator = document.querySelector(".turn-indicator");
    let currentPlayer = 'Player 1';

    function handleClick(e) {
        const cell = e.target;
        if (cell.innerText !== '') return;
        
        const playerName = prompt(`Enter player name for ${currentPlayer}:`);
        if (!playerName) return;

        verifyPlayerData(playerName).then(data => {
            const playerTeams = data.teams.map(team => team.name);
            const row = cell.getAttribute('data-row');
            const col = cell.getAttribute('data-col');
            const leftTeam = leftTeams[row];
            const topTeam = topTeams[col];

            if (playerTeams.includes(leftTeam.name) && playerTeams.includes(topTeam.name)) {
                cell.innerText = currentPlayer === 'Player 1' ? 'X' : 'O';
                currentPlayer = currentPlayer === 'Player 1' ? 'Player 2' : 'Player 1';
                turnIndicator.innerText = `${currentPlayer}'s turn`;
            } else {
                alert(`${playerName} has not played for both ${leftTeam.name} and ${topTeam.name}`);
            }
        });
    }

    cells.forEach(cell => {
        cell.addEventListener('click', handleClick);
    });

    async function verifyPlayerData(playerName) {
        const response = await fetch(`https://transfermarkt-api.fly.dev/player/${playerName}`);
        const data = await response.json();
        return data;
    }
});
