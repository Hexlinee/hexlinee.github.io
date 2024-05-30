document.addEventListener("DOMContentLoaded", () => {
    const topTeams = [
        // Premier League
        { name: 'Manchester City', league: 'Premier League', logo: 'https://logo-url/manchester-city.png' },
        { name: 'Liverpool', league: 'Premier League', logo: 'https://logo-url/liverpool.png' },
        { name: 'Chelsea', league: 'Premier League', logo: 'https://logo-url/chelsea.png' },
        { name: 'Manchester United', league: 'Premier League', logo: 'https://logo-url/manchester-united.png' },
        { name: 'Tottenham Hotspur', league: 'Premier League', logo: 'https://logo-url/tottenham-hotspur.png' },

        // La Liga
        { name: 'Real Madrid', league: 'La Liga', logo: 'https://logo-url/real-madrid.png' },
        { name: 'Barcelona', league: 'La Liga', logo: 'https://logo-url/barcelona.png' },
        { name: 'Atletico Madrid', league: 'La Liga', logo: 'https://logo-url/atletico-madrid.png' },
        { name: 'Sevilla', league: 'La Liga', logo: 'https://logo-url/sevilla.png' },
        { name: 'Real Sociedad', league: 'La Liga', logo: 'https://logo-url/real-sociedad.png' },

        // Serie A
        { name: 'Napoli', league: 'Serie A', logo: 'https://logo-url/napoli.png' },
        { name: 'Juventus', league: 'Serie A', logo: 'https://logo-url/juventus.png' },
        { name: 'Inter Milan', league: 'Serie A', logo: 'https://logo-url/inter-milan.png' },
        { name: 'AC Milan', league: 'Serie A', logo: 'https://logo-url/ac-milan.png' },
        { name: 'AS Roma', league: 'Serie A', logo: 'https://logo-url/as-roma.png' },

        // Bundesliga
        { name: 'Bayern Munich', league: 'Bundesliga', logo: 'https://logo-url/bayern-munich.png' },
        { name: 'Borussia Dortmund', league: 'Bundesliga', logo: 'https://logo-url/borussia-dortmund.png' },
        { name: 'RB Leipzig', league: 'Bundesliga', logo: 'https://logo-url/rb-leipzig.png' },
        { name: 'Bayer Leverkusen', league: 'Bundesliga', logo: 'https://logo-url/bayer-leverkusen.png' },
        { name: 'Borussia Mönchengladbach', league: 'Bundesliga', logo: 'https://logo-url/borussia-monchengladbach.png' },

        // Ligue 1
        { name: 'Paris Saint-Germain', league: 'Ligue 1', logo: 'https://logo-url/psg.png' },
        { name: 'Lille', league: 'Ligue 1', logo: 'https://logo-url/lille.png' },
        { name: 'Lyon', league: 'Ligue 1', logo: 'https://logo-url/lyon.png' },
        { name: 'Marseille', league: 'Ligue 1', logo: 'https://logo-url/marseille.png' },
        { name: 'Monaco', league: 'Ligue 1', logo: 'https://logo-url/monaco.png' },

        // Turkish Super League
        { name: 'Galatasaray', league: 'Turkish Super League', logo: 'https://logo-url/galatasaray.png' },
        { name: 'Fenerbahçe', league: 'Turkish Super League', logo: 'https://logo-url/fenerbahce.png' },
        { name: 'Beşiktaş', league: 'Turkish Super League', logo: 'https://logo-url/besiktas.png' },
        { name: 'Trabzonspor', league: 'Turkish Super League', logo: 'https://logo-url/trabzonspor.png' }
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
            const teamImg = document.createElement("img");
            teamImg.src = team.logo;
            teamImg.alt = team.name;
            teamImg.title = team.name;
            teamDiv.appendChild(teamImg);
            leftTeamsDiv.appendChild(teamDiv);
        });

        topTeams.forEach(team => {
            const teamDiv = document.createElement("div");
            teamDiv.className = "team";
            const teamImg = document.createElement("img");
            teamImg.src = team.logo;
            teamImg.alt = team.name;
            teamImg.title = team.name;
            teamDiv.appendChild(teamImg);
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
