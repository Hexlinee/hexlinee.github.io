document.addEventListener("DOMContentLoaded", () => {
    const topTeams = [
        // Premier League
        { name: 'Manchester City', league: 'Premier League' },
        { name: 'Liverpool', league: 'Premier League' },
        { name: 'Chelsea', league: 'Premier League' },
        { name: 'Manchester United', league: 'Premier League' },
        { name: 'Tottenham Hotspur', league: 'Premier League' },

        // La Liga
        { name: 'Real Madrid', league: 'La Liga' },
        { name: 'Barcelona', league: 'La Liga' },
        { name: 'Atletico Madrid', league: 'La Liga' },
        { name: 'Sevilla', league: 'La Liga' },
        { name: 'Real Sociedad', league: 'La Liga' },

        // Serie A
        { name: 'Napoli', league: 'Serie A' },
        { name: 'Juventus', league: 'Serie A' },
        { name: 'Inter Milan', league: 'Serie A' },
        { name: 'AC Milan', league: 'Serie A' },
        { name: 'AS Roma', league: 'Serie A' },

        // Bundesliga
        { name: 'Bayern Munich', league: 'Bundesliga' },
        { name: 'Borussia Dortmund', league: 'Bundesliga' },
        { name: 'RB Leipzig', league: 'Bundesliga' },
        { name: 'Bayer Leverkusen', league: 'Bundesliga' },
        { name: 'Borussia Mönchengladbach', league: 'Bundesliga' },

        // Ligue 1
        { name: 'Paris Saint-Germain', league: 'Ligue 1' },
        { name: 'Lille', league: 'Ligue 1' },
        { name: 'Lyon', league: 'Ligue 1' },
        { name: 'Marseille', league: 'Ligue 1' },
        { name: 'Monaco', league: 'Ligue 1' },

        // Turkish Super League
        { name: 'Galatasaray', league: 'Turkish Super League' },
        { name: 'Fenerbahçe', league: 'Turkish Super League' },
        { name: 'Beşiktaş', league: 'Turkish Super League' },
        { name: 'Trabzonspor', league: 'Turkish Super League' }
    ];

    // Shuffle and pick random teams
    function getRandomTeams(num) {
        const shuffled = topTeams.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, num);
    }

    function displayTeams() {
        const teamsDiv = document.getElementById("teams");
        const teams = getRandomTeams(3);
        teams.forEach(team => {
            const teamDiv = document.createElement("div");
            teamDiv.className = "team";
            teamDiv.innerText = `${team.name} (${team.league})`;
            teamsDiv.appendChild(teamDiv);
        });
    }

    displayTeams();

    // Game logic
    const cells = document.querySelectorAll("[data-cell]");
    let turn = 'X';

    function handleClick(e) {
        const cell = e.target;
        if (cell.innerText !== '') return;
        cell.innerText = turn;
        turn = turn === 'X' ? 'O' : 'X';
    }

    cells.forEach(cell => {
        cell.addEventListener('click', handleClick);
    });

    // Verify player data from Transfermarkt API
    async function verifyPlayerData(playerName) {
        const response = await fetch(`https://transfermarkt-api.fly.dev/player/${playerName}`);
        const data = await response.json();
        return data;
    }

    // Example usage
    // verifyPlayerData("Lionel Messi").then(data => console.log(data));
});
