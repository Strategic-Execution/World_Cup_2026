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
        renderGoldenBoot();
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
// AEST (UTC+10) kickoff times for all 104 matches
const KICKOFF_AEST = {
    1:"05:00",2:"12:00",3:"05:00",4:"11:00",5:"10:00",6:"14:00",7:"08:00",8:"05:00",
    9:"09:00",10:"04:00",11:"06:00",12:"12:00",13:"08:00",14:"02:00",15:"11:00",
    16:"05:00",17:"05:00",18:"08:00",19:"11:00",20:"14:00",21:"09:00",22:"06:00",
    23:"04:00",24:"12:00",25:"02:00",26:"05:00",27:"08:00",28:"11:00",29:"10:30",
    30:"08:00",31:"12:00",32:"05:00",33:"06:00",34:"09:00",35:"04:00",36:"14:00",
    37:"08:00",38:"02:00",39:"05:00",40:"11:00",41:"10:00",42:"07:00",43:"04:00",
    44:"13:00",45:"06:00",46:"09:00",47:"04:00",48:"12:00",49:"08:00",50:"08:00",
    51:"05:00",52:"05:00",53:"11:00",54:"11:00",55:"06:00",56:"06:00",57:"09:00",
    58:"09:00",59:"12:00",60:"12:00",61:"05:00",62:"05:00",63:"13:00",64:"13:00",
    65:"10:00",66:"10:00",67:"07:00",68:"07:00",69:"12:00",70:"12:00",71:"09:30",
    72:"09:30",73:"05:00",74:"06:30",75:"11:00",76:"04:00",77:"07:00",78:"02:00",
    79:"11:00",80:"02:00",81:"10:00",82:"05:00",83:"09:00",84:"05:00",85:"13:00",
    86:"08:00",87:"10:30",88:"04:00",89:"07:00",90:"02:00",91:"06:00",92:"10:00",
    93:"06:00",94:"10:00",95:"02:00",96:"06:00",97:"06:00",98:"05:00",99:"07:00",
    100:"10:00",101:"06:00",102:"07:00",103:"07:00",104:"05:00"
};

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
        const aest = KICKOFF_AEST[f.match] || '';
        const timeStr = aest ? `${aest} AEST` : '';

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
                    <span>${f.date}${timeStr ? ' ' + timeStr : ''} &middot; Match ${f.match}</span>
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

// --- GOLDEN BOOT ---
function renderGoldenBoot() {
    if (!DATA.goldenBoot) return;
    const tbody = document.querySelector('#goldenBootTable tbody');
    tbody.innerHTML = DATA.goldenBoot.map((e, i) => {
        const cls = i < 3 ? ' class="top-three"' : '';
        return `<tr${cls}>
            <td class="col-rank">${e.rank}</td>
            <td class="col-name">${escapeHtml(e.participant)}</td>
            <td class="col-team">${escapeHtml(e.player)}</td>
            <td class="col-num">${e.goals}</td>
        </tr>`;
    }).join('');
}

document.addEventListener('DOMContentLoaded', init);
