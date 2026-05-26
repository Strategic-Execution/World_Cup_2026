// World Cup 2026 Sweepstake - Frontend Logic

let DATA = null;

// Country flag emoji mapping
const FLAGS = {
    "Mexico": "🇲🇽", "South Africa": "🇿🇦", "South Korea": "🇰🇷", "Czechia": "🇨🇿",
    "Canada": "🇨🇦", "Bosnia and Herzegovina": "🇧🇦", "Qatar": "🇶🇦", "Switzerland": "🇨🇭",
    "Brazil": "🇧🇷", "Morocco": "🇲🇦", "Haiti": "🇭🇹", "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    "United States": "🇺🇸", "Paraguay": "🇵🇾", "Australia": "🇦🇺", "Türkiye": "🇹🇷",
    "Germany": "🇩🇪", "Curaçao": "🇨🇼", "Ivory Coast": "🇨🇮", "Ecuador": "🇪🇨",
    "Netherlands": "🇳🇱", "Japan": "🇯🇵", "Sweden": "🇸🇪", "Tunisia": "🇹🇳",
    "Belgium": "🇧🇪", "Egypt": "🇪🇬", "Iran": "🇮🇷", "New Zealand": "🇳🇿",
    "Spain": "🇪🇸", "Cape Verde": "🇨🇻", "Saudi Arabia": "🇸🇦", "Uruguay": "🇺🇾",
    "France": "🇫🇷", "Senegal": "🇸🇳", "Iraq": "🇮🇶", "Norway": "🇳🇴",
    "Argentina": "🇦🇷", "Algeria": "🇩🇿", "Austria": "🇦🇹", "Jordan": "🇯🇴",
    "Portugal": "🇵🇹", "DR Congo": "🇨🇩", "Uzbekistan": "🇺🇿", "Colombia": "🇨🇴",
    "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Croatia": "🇭🇷", "Ghana": "🇬🇭", "Panama": "🇵🇦"
};

function getFlag(team) {
    return FLAGS[team] || '🏳️';
}

function teamWithFlag(team) {
    return `<span class="team-flag">${getFlag(team)}</span> ${escapeHtml(team)}`;
}

async function init() {
    try {
        const resp = await fetch('data.json');
        DATA = await resp.json();
        renderLastUpdated();
        renderLeaderboard();
        renderFixtures();
        renderGroups();
        setupNav();
        setupFilters();
    } catch (err) {
        document.querySelector('main').innerHTML =
            '<p style="text-align:center;padding:3rem;color:var(--text-secondary)">No data available yet. Run <code>python export_to_web.py</code> to generate data.</p>';
    }
}

// --- NAV ---
function setupNav() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });
}

// --- LAST UPDATED ---
function renderLastUpdated() {
    document.getElementById('lastUpdated').textContent =
        DATA.lastUpdated ? `Last updated: ${DATA.lastUpdated}` : '';
}

// --- LEADERBOARD ---
function renderLeaderboard() {
    const lb = DATA.leaderboard;
    if (!lb || lb.length === 0) return;

    // Podium
    const podium = document.getElementById('podium');
    const medals = ['gold', 'silver', 'bronze'];
    const icons = ['🥇', '🥈', '🥉'];

    podium.innerHTML = lb.slice(0, 3).map((e, i) => `
        <div class="podium-card ${medals[i]}">
            <div class="podium-rank">${icons[i]}</div>
            <div class="podium-name">${escapeHtml(e.participant)}</div>
            <div class="podium-team">${getFlag(e.team)} ${escapeHtml(e.team)}</div>
            <div class="podium-pts">${e.points}</div>
            <div class="podium-pts-label">points</div>
        </div>
    `).join('');

    // Table
    const tbody = document.querySelector('#leaderboardTable tbody');
    tbody.innerHTML = lb.map(e => `
        <tr>
            <td class="rank-cell rank-${e.rank <= 3 ? e.rank : ''}">${e.rank}</td>
            <td>${escapeHtml(e.participant)}</td>
            <td><span class="team-name">${teamWithFlag(e.team)}</span></td>
            <td><strong>${e.points}</strong></td>
            <td>${e.wins}</td>
            <td>${e.draws}</td>
        </tr>
    `).join('');
}

// --- FIXTURES ---
function renderFixtures(stageFilter = 'all', playedOnly = false) {
    const container = document.getElementById('fixturesList');
    let fixtures = DATA.fixtures;

    if (stageFilter === 'group') {
        fixtures = fixtures.filter(f => f.stage.length === 1);
    } else if (stageFilter !== 'all') {
        fixtures = fixtures.filter(f => f.stage === stageFilter);
    }

    if (playedOnly) {
        fixtures = fixtures.filter(f => f.homeScore !== null);
    }

    container.innerHTML = fixtures.map(f => {
        const played = f.homeScore !== null;
        const scoreText = played
            ? `${f.homeScore} - ${f.awayScore}`
            : f.date || 'TBD';

        return `
            <div class="fixture-card ${played ? 'played' : ''}">
                <div class="fixture-home">${getFlag(f.home)} ${escapeHtml(f.home)}</div>
                <div class="fixture-score ${played ? '' : 'pending'}">${scoreText}</div>
                <div class="fixture-away">${escapeHtml(f.away)} ${getFlag(f.away)}</div>
                <div class="fixture-meta">
                    <span>Match ${f.match}</span>
                    <span>${f.date} &middot; ${formatStage(f.stage)}</span>
                </div>
            </div>
        `;
    }).join('');
}

function setupFilters() {
    const stageSelect = document.getElementById('stageFilter');
    const playedCheck = document.getElementById('showPlayedOnly');

    stageSelect.addEventListener('change', () => {
        renderFixtures(stageSelect.value, playedCheck.checked);
    });
    playedCheck.addEventListener('change', () => {
        renderFixtures(stageSelect.value, playedCheck.checked);
    });
}

function formatStage(stage) {
    if (stage.length === 1) return `Group ${stage}`;
    const map = { R32: 'Round of 32', R16: 'Round of 16', QF: 'Quarter-Final', SF: 'Semi-Final', '3rd': '3rd Place', Final: 'Final' };
    return map[stage] || stage;
}

// --- GROUPS ---
function renderGroups() {
    const groups = DATA.groups;
    if (!groups || Object.keys(groups).length === 0) return;

    const grid = document.getElementById('groupsGrid');
    const sortedKeys = Object.keys(groups).sort();

    grid.innerHTML = sortedKeys.map(g => {
        const teams = groups[g];
        const rows = teams.map((t, i) => `
            <tr class="${i < 2 ? 'qualified' : ''}">
                <td style="text-align:left"><span class="team-name">${teamWithFlag(t.team)}</span></td>
                <td>${t.p}</td>
                <td>${t.w}</td>
                <td>${t.d}</td>
                <td>${t.l}</td>
                <td>${t.gf}</td>
                <td>${t.ga}</td>
                <td>${t.gf - t.ga}</td>
                <td><strong>${t.pts}</strong></td>
            </tr>
        `).join('');

        return `
            <div class="group-card">
                <h3>Group ${g}</h3>
                <table>
                    <thead>
                        <tr>
                            <th style="text-align:left">Team</th>
                            <th>P</th>
                            <th>W</th>
                            <th>D</th>
                            <th>L</th>
                            <th>GF</th>
                            <th>GA</th>
                            <th>GD</th>
                            <th>Pts</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    }).join('');
}

// --- UTILITIES ---
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Boot
document.addEventListener('DOMContentLoaded', init);
