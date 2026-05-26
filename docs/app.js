// World Cup 2026 Sweepstake - Frontend

let DATA = null;

// ISO country codes for flag images via flagcdn.com
const COUNTRY_CODES = {
    "Mexico": "mx", "South Africa": "za", "South Korea": "kr", "Czechia": "cz",
    "Canada": "ca", "Bosnia and Herzegovina": "ba", "Qatar": "qa", "Switzerland": "ch",
    "Brazil": "br", "Morocco": "ma", "Haiti": "ht", "Scotland": "gb-sct",
    "United States": "us", "Paraguay": "py", "Australia": "au", "Türkiye": "tr",
    "Germany": "de", "Curaçao": "cw", "Ivory Coast": "ci", "Ecuador": "ec",
    "Netherlands": "nl", "Japan": "jp", "Sweden": "se", "Tunisia": "tn",
    "Belgium": "be", "Egypt": "eg", "Iran": "ir", "New Zealand": "nz",
    "Spain": "es", "Cape Verde": "cv", "Saudi Arabia": "sa", "Uruguay": "uy",
    "France": "fr", "Senegal": "sn", "Iraq": "iq", "Norway": "no",
    "Argentina": "ar", "Algeria": "dz", "Austria": "at", "Jordan": "jo",
    "Portugal": "pt", "DR Congo": "cd", "Uzbekistan": "uz", "Colombia": "co",
    "England": "gb-eng", "Croatia": "hr", "Ghana": "gh", "Panama": "pa"
};

function flagImg(team, width) {
    width = width || 24;
    const code = COUNTRY_CODES[team];
    if (!code) return '';
    // flagcdn.com only supports w20, w40, w80, w160, w320
    const cdnWidth = width <= 20 ? 20 : width <= 40 ? 40 : width <= 80 ? 80 : 160;
    return `<img src="https://flagcdn.com/w${cdnWidth}/${code}.png" width="${width}" alt="" loading="lazy" style="width:${width}px;height:auto;">`;
}

async function init() {
    try {
        const resp = await fetch('data.json');
        DATA = await resp.json();
        document.getElementById('lastUpdated').textContent =
            DATA.lastUpdated ? `Updated ${DATA.lastUpdated}` : '';
        renderLeaderboard();
        renderFixtures();
        renderGroups();
        setupNav();
        setupFilters();
    } catch (err) {
        document.querySelector('main').innerHTML =
            '<div class="card" style="padding:3rem;text-align:center;color:#999">No data yet. Run <code>python export_to_web.py</code></div>';
    }
}

// --- NAV ---
function setupNav() {
    document.querySelectorAll('.nav-btn[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn[data-tab]').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });
}

// --- LEADERBOARD ---
function renderLeaderboard() {
    const lb = DATA.leaderboard;
    if (!lb || lb.length === 0) return;

    // Podium
    const podium = document.getElementById('podium');
    const classes = ['first', 'second', 'third'];
    const labels = ['1st Place', '2nd Place', '3rd Place'];

    podium.innerHTML = lb.slice(0, 3).map((e, i) => `
        <div class="podium-card ${classes[i]}">
            <div class="podium-position">${labels[i]}</div>
            ${flagImg(e.team, 48)}
            <div class="podium-name">${escapeHtml(e.participant)}</div>
            <div class="podium-team">${escapeHtml(e.team)}</div>
            <div class="podium-pts">${e.points}</div>
            <div class="podium-pts-label">points</div>
        </div>
    `).join('');

    // Table
    const tbody = document.querySelector('#leaderboardTable tbody');
    tbody.innerHTML = lb.map(e => {
        const rankClass = e.rank <= 3 ? `top-${e.rank}` : '';
        return `<tr>
            <td class="rank-cell ${rankClass}">${e.rank}</td>
            <td>${escapeHtml(e.participant)}</td>
            <td><div class="team-cell">${flagImg(e.team)} <span>${escapeHtml(e.team)}</span></div></td>
            <td class="pts-cell">${e.points}</td>
            <td class="num-cell">${e.wins}</td>
            <td class="num-cell">${e.draws}</td>
        </tr>`;
    }).join('');
}

// --- FIXTURES ---
function renderFixtures(stageFilter, playedOnly) {
    stageFilter = stageFilter || 'all';
    playedOnly = playedOnly || false;
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
        const scoreText = played ? `${f.homeScore} — ${f.awayScore}` : 'vs';

        return `
            <div class="fixture-card ${played ? 'played' : ''}">
                <div class="fixture-home">
                    <span>${escapeHtml(f.home)}</span>
                    ${flagImg(f.home)}
                </div>
                <div class="fixture-score ${played ? '' : 'pending'}">${scoreText}</div>
                <div class="fixture-away">
                    ${flagImg(f.away)}
                    <span>${escapeHtml(f.away)}</span>
                </div>
                <div class="fixture-meta">
                    <span>${f.date} &middot; Match ${f.match}</span>
                    <span class="fixture-stage-badge">${formatStage(f.stage)}</span>
                </div>
            </div>
        `;
    }).join('');
}

function setupFilters() {
    const stageSelect = document.getElementById('stageFilter');
    const playedCheck = document.getElementById('showPlayedOnly');
    stageSelect.addEventListener('change', () => renderFixtures(stageSelect.value, playedCheck.checked));
    playedCheck.addEventListener('change', () => renderFixtures(stageSelect.value, playedCheck.checked));
}

function formatStage(stage) {
    if (stage.length === 1) return `Group ${stage}`;
    const map = { R32: 'R32', R16: 'R16', QF: 'QF', SF: 'Semi', '3rd': '3rd', Final: 'Final' };
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
                <td><div class="group-team-cell">${flagImg(t.team, 20)} <span>${escapeHtml(t.team)}</span></div></td>
                <td>${t.p}</td>
                <td>${t.w}</td>
                <td>${t.d}</td>
                <td>${t.l}</td>
                <td>${t.gf - t.ga}</td>
                <td><strong>${t.pts}</strong></td>
            </tr>
        `).join('');

        return `
            <div class="group-card">
                <div class="group-header">Group ${g}</div>
                <table>
                    <thead>
                        <tr>
                            <th style="text-align:left">Team</th>
                            <th>P</th>
                            <th>W</th>
                            <th>D</th>
                            <th>L</th>
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

// --- UTIL ---
function escapeHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

document.addEventListener('DOMContentLoaded', init);
