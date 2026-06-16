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
        const resp = await fetch('data.json?v=' + Date.now());
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
            <td class="num-cell">${e.quiz}</td>
            <td class="num-cell">${e.wins}</td>
            <td class="num-cell">${e.draws}</td>
            <td class="num-cell">${e.gf}</td>
            <td class="num-cell">${e.ga}</td>
            <td class="num-cell">${e.gd}</td>
        </tr>`;
    }).join('');
}

// --- FIXTURES ---
// AEST (UTC+10) kickoff dates and times for all 104 matches
// Source: Wikipedia 2026 FIFA World Cup schedule (verified local times + UTC offsets converted to AEST)
const KICKOFF_AEST = {
    1: {date:"12-Jun", time:"05:00"},
    2: {date:"12-Jun", time:"12:00"},
    3: {date:"13-Jun", time:"05:00"},
    4: {date:"13-Jun", time:"11:00"},
    5: {date:"14-Jun", time:"11:00"},
    6: {date:"14-Jun", time:"14:00"},
    7: {date:"14-Jun", time:"08:00"},
    8: {date:"14-Jun", time:"05:00"},
    9: {date:"15-Jun", time:"09:00"},
    10: {date:"15-Jun", time:"03:00"},
    11: {date:"15-Jun", time:"06:00"},
    12: {date:"15-Jun", time:"12:00"},
    13: {date:"16-Jun", time:"08:00"},
    14: {date:"16-Jun", time:"02:00"},
    15: {date:"16-Jun", time:"11:00"},
    16: {date:"16-Jun", time:"05:00"},
    17: {date:"17-Jun", time:"05:00"},
    18: {date:"17-Jun", time:"08:00"},
    19: {date:"17-Jun", time:"11:00"},
    20: {date:"17-Jun", time:"14:00"},
    21: {date:"18-Jun", time:"09:00"},
    22: {date:"18-Jun", time:"06:00"},
    23: {date:"18-Jun", time:"03:00"},
    24: {date:"18-Jun", time:"12:00"},
    25: {date:"19-Jun", time:"02:00"},
    26: {date:"19-Jun", time:"05:00"},
    27: {date:"19-Jun", time:"08:00"},
    28: {date:"19-Jun", time:"11:00"},
    29: {date:"20-Jun", time:"10:30"},
    30: {date:"20-Jun", time:"08:00"},
    31: {date:"20-Jun", time:"13:00"},
    32: {date:"20-Jun", time:"05:00"},
    33: {date:"21-Jun", time:"06:00"},
    34: {date:"21-Jun", time:"10:00"},
    35: {date:"21-Jun", time:"03:00"},
    36: {date:"21-Jun", time:"14:00"},
    37: {date:"22-Jun", time:"08:00"},
    38: {date:"22-Jun", time:"02:00"},
    39: {date:"22-Jun", time:"05:00"},
    40: {date:"22-Jun", time:"11:00"},
    41: {date:"23-Jun", time:"10:00"},
    42: {date:"23-Jun", time:"07:00"},
    43: {date:"23-Jun", time:"03:00"},
    44: {date:"23-Jun", time:"13:00"},
    45: {date:"24-Jun", time:"06:00"},
    46: {date:"24-Jun", time:"09:00"},
    47: {date:"24-Jun", time:"03:00"},
    48: {date:"24-Jun", time:"12:00"},
    49: {date:"25-Jun", time:"08:00"},
    50: {date:"25-Jun", time:"08:00"},
    51: {date:"25-Jun", time:"05:00"},
    52: {date:"25-Jun", time:"05:00"},
    53: {date:"25-Jun", time:"11:00"},
    54: {date:"25-Jun", time:"11:00"},
    55: {date:"26-Jun", time:"06:00"},
    56: {date:"26-Jun", time:"06:00"},
    57: {date:"26-Jun", time:"09:00"},
    58: {date:"26-Jun", time:"09:00"},
    59: {date:"26-Jun", time:"12:00"},
    60: {date:"26-Jun", time:"12:00"},
    61: {date:"27-Jun", time:"05:00"},
    62: {date:"27-Jun", time:"05:00"},
    63: {date:"27-Jun", time:"13:00"},
    64: {date:"27-Jun", time:"13:00"},
    65: {date:"27-Jun", time:"10:00"},
    66: {date:"27-Jun", time:"10:00"},
    67: {date:"28-Jun", time:"07:00"},
    68: {date:"28-Jun", time:"07:00"},
    69: {date:"28-Jun", time:"12:00"},
    70: {date:"28-Jun", time:"12:00"},
    71: {date:"28-Jun", time:"09:30"},
    72: {date:"28-Jun", time:"09:30"},
    73: {date:"29-Jun", time:"05:00"},
    74: {date:"30-Jun", time:"06:30"},
    75: {date:"30-Jun", time:"11:00"},
    76: {date:"30-Jun", time:"03:00"},
    77: {date:"1-Jul", time:"07:00"},
    78: {date:"1-Jul", time:"03:00"},
    79: {date:"1-Jul", time:"11:00"},
    80: {date:"2-Jul", time:"02:00"},
    81: {date:"2-Jul", time:"10:00"},
    82: {date:"2-Jul", time:"06:00"},
    83: {date:"3-Jul", time:"09:00"},
    84: {date:"3-Jul", time:"05:00"},
    85: {date:"3-Jul", time:"13:00"},
    86: {date:"4-Jul", time:"08:00"},
    87: {date:"4-Jul", time:"11:30"},
    88: {date:"4-Jul", time:"04:00"},
    89: {date:"5-Jul", time:"07:00"},
    90: {date:"5-Jul", time:"03:00"},
    91: {date:"6-Jul", time:"06:00"},
    92: {date:"6-Jul", time:"10:00"},
    93: {date:"7-Jul", time:"05:00"},
    94: {date:"7-Jul", time:"10:00"},
    95: {date:"8-Jul", time:"02:00"},
    96: {date:"8-Jul", time:"06:00"},
    97: {date:"10-Jul", time:"06:00"},
    98: {date:"11-Jul", time:"05:00"},
    99: {date:"12-Jul", time:"07:00"},
    100: {date:"12-Jul", time:"11:00"},
    101: {date:"15-Jul", time:"05:00"},
    102: {date:"16-Jul", time:"05:00"},
    103: {date:"19-Jul", time:"07:00"},
    104: {date:"20-Jul", time:"05:00"},
};

// Venue/stadium for all 104 matches
const VENUE = {
    1:"Estadio Azteca, Mexico City",2:"Estadio Akron, Guadalajara",3:"BMO Field, Toronto",4:"SoFi Stadium, Los Angeles",
    5:"Gillette Stadium, Foxborough",6:"BC Place, Vancouver",7:"MetLife Stadium, East Rutherford",8:"Levi's Stadium, Santa Clara",
    9:"Lincoln Financial Field, Philadelphia",10:"NRG Stadium, Houston",11:"AT&T Stadium, Arlington",12:"Estadio BBVA, Monterrey",
    13:"Hard Rock Stadium, Miami",14:"Mercedes-Benz Stadium, Atlanta",15:"SoFi Stadium, Los Angeles",16:"Lumen Field, Seattle",
    17:"MetLife Stadium, East Rutherford",18:"Gillette Stadium, Foxborough",19:"Arrowhead Stadium, Kansas City",20:"Levi's Stadium, Santa Clara",
    21:"BMO Field, Toronto",22:"AT&T Stadium, Arlington",23:"NRG Stadium, Houston",24:"Estadio Azteca, Mexico City",
    25:"Mercedes-Benz Stadium, Atlanta",26:"SoFi Stadium, Los Angeles",27:"BC Place, Vancouver",28:"Estadio Akron, Guadalajara",
    29:"Lincoln Financial Field, Philadelphia",30:"Gillette Stadium, Foxborough",31:"Levi's Stadium, Santa Clara",32:"Lumen Field, Seattle",
    33:"BMO Field, Toronto",34:"Arrowhead Stadium, Kansas City",35:"NRG Stadium, Houston",36:"Estadio BBVA, Monterrey",
    37:"Hard Rock Stadium, Miami",38:"Mercedes-Benz Stadium, Atlanta",39:"SoFi Stadium, Los Angeles",40:"BC Place, Vancouver",
    41:"MetLife Stadium, East Rutherford",42:"Lincoln Financial Field, Philadelphia",43:"AT&T Stadium, Arlington",44:"Levi's Stadium, Santa Clara",
    45:"Gillette Stadium, Foxborough",46:"BMO Field, Toronto",47:"NRG Stadium, Houston",48:"Estadio Akron, Guadalajara",
    49:"Hard Rock Stadium, Miami",50:"Mercedes-Benz Stadium, Atlanta",51:"BC Place, Vancouver",52:"Lumen Field, Seattle",
    53:"Estadio Azteca, Mexico City",54:"Estadio BBVA, Monterrey",55:"Lincoln Financial Field, Philadelphia",56:"MetLife Stadium, East Rutherford",
    57:"AT&T Stadium, Arlington",58:"Arrowhead Stadium, Kansas City",59:"SoFi Stadium, Los Angeles",60:"Levi's Stadium, Santa Clara",
    61:"Gillette Stadium, Foxborough",62:"BMO Field, Toronto",63:"Lumen Field, Seattle",64:"BC Place, Vancouver",
    65:"NRG Stadium, Houston",66:"Estadio Akron, Guadalajara",67:"MetLife Stadium, East Rutherford",68:"Lincoln Financial Field, Philadelphia",
    69:"Arrowhead Stadium, Kansas City",70:"AT&T Stadium, Arlington",71:"Hard Rock Stadium, Miami",72:"Mercedes-Benz Stadium, Atlanta",
    73:"SoFi Stadium, Los Angeles",74:"Gillette Stadium, Foxborough",75:"Estadio BBVA, Monterrey",76:"NRG Stadium, Houston",
    77:"MetLife Stadium, East Rutherford",78:"AT&T Stadium, Arlington",79:"Estadio Azteca, Mexico City",80:"Mercedes-Benz Stadium, Atlanta",
    81:"Levi's Stadium, Santa Clara",82:"Lumen Field, Seattle",83:"BMO Field, Toronto",84:"SoFi Stadium, Los Angeles",
    85:"BC Place, Vancouver",86:"Hard Rock Stadium, Miami",87:"Arrowhead Stadium, Kansas City",88:"AT&T Stadium, Arlington",
    89:"Lincoln Financial Field, Philadelphia",90:"NRG Stadium, Houston",91:"MetLife Stadium, East Rutherford",92:"Estadio Azteca, Mexico City",
    93:"AT&T Stadium, Arlington",94:"Lumen Field, Seattle",95:"Mercedes-Benz Stadium, Atlanta",96:"BC Place, Vancouver",
    97:"Gillette Stadium, Foxborough",98:"SoFi Stadium, Los Angeles",99:"Hard Rock Stadium, Miami",100:"Arrowhead Stadium, Kansas City",
    101:"AT&T Stadium, Arlington",102:"Mercedes-Benz Stadium, Atlanta",
    103:"Hard Rock Stadium, Miami",104:"MetLife Stadium, East Rutherford",
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
        const aestData = KICKOFF_AEST[f.match];
        const timeStr = aestData ? `${aestData.time} AEST` : '';
        const displayDate = aestData ? aestData.date : f.date;
        const venue = VENUE[f.match] || '';

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
                    <span>${displayDate}${timeStr ? ' ' + timeStr : ''} &middot; Match ${f.match}</span>
                    <span class="fixture-stage-badge">${formatStage(f.stage)}</span>
                </div>
                ${venue ? `<div class="fixture-venue">${venue}</div>` : ''}
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
    const filtered = DATA.goldenBoot.filter(e => !/^Phantom\s?\d*$/i.test(e.participant));
    let rank = 0;
    tbody.innerHTML = filtered.map((e, i) => {
        rank = i + 1;
        const cls = i < 3 ? ' class="top-three"' : '';
        return `<tr${cls}>
            <td class="col-rank">${rank}</td>
            <td class="col-name">${escapeHtml(e.participant)}</td>
            <td class="col-team">${escapeHtml(e.player)}</td>
            <td class="col-num">${e.goals}</td>
        </tr>`;
    }).join('');
}

document.addEventListener('DOMContentLoaded', init);
