"""Calculate AEST dates and times for all 104 World Cup 2026 matches from Wikipedia schedule."""

# All 104 matches from Wikipedia with local time (24hr), UTC offset
# Format: match_num: (local_date, local_hour, local_min, utc_offset_hours)
matches = {
    # Group A
    1: ('Jun 11', 13, 0, -6),   # Mexico vs South Africa - Mexico City UTC-6
    2: ('Jun 11', 20, 0, -6),   # South Korea vs Czech Republic - Guadalajara UTC-6
    25: ('Jun 18', 12, 0, -4),  # Czech Republic vs South Africa - Atlanta UTC-4
    28: ('Jun 18', 19, 0, -6),  # Mexico vs South Korea - Guadalajara UTC-6
    53: ('Jun 24', 19, 0, -6),  # Czech Republic vs Mexico - Mexico City UTC-6
    54: ('Jun 24', 19, 0, -6),  # South Africa vs South Korea - Monterrey UTC-6

    # Group B
    3: ('Jun 12', 15, 0, -4),   # Canada vs Bosnia - Toronto UTC-4
    8: ('Jun 13', 12, 0, -7),   # Qatar vs Switzerland - Santa Clara UTC-7
    26: ('Jun 18', 12, 0, -7),  # Switzerland vs Bosnia - LA UTC-7
    27: ('Jun 18', 15, 0, -7),  # Canada vs Qatar - Vancouver UTC-7
    51: ('Jun 24', 12, 0, -7),  # Switzerland vs Canada - Vancouver UTC-7
    52: ('Jun 24', 12, 0, -7),  # Bosnia vs Qatar - Seattle UTC-7

    # Group C
    7: ('Jun 13', 18, 0, -4),   # Brazil vs Morocco - East Rutherford UTC-4
    5: ('Jun 13', 21, 0, -4),   # Haiti vs Scotland - Foxborough UTC-4
    30: ('Jun 19', 18, 0, -4),  # Scotland vs Morocco - Foxborough UTC-4
    29: ('Jun 19', 20, 30, -4), # Brazil vs Haiti - Philadelphia UTC-4
    49: ('Jun 24', 18, 0, -4),  # Scotland vs Brazil - Miami UTC-4
    50: ('Jun 24', 18, 0, -4),  # Morocco vs Haiti - Atlanta UTC-4

    # Group D
    4: ('Jun 12', 18, 0, -7),   # United States vs Paraguay - LA UTC-7
    6: ('Jun 13', 21, 0, -7),   # Australia vs Turkey - Vancouver UTC-7
    32: ('Jun 19', 12, 0, -7),  # United States vs Australia - Seattle UTC-7
    31: ('Jun 19', 20, 0, -7),  # Turkey vs Paraguay - Santa Clara UTC-7
    59: ('Jun 25', 19, 0, -7),  # Turkey vs United States - LA UTC-7
    60: ('Jun 25', 19, 0, -7),  # Paraguay vs Australia - Santa Clara UTC-7

    # Group E
    10: ('Jun 14', 12, 0, -5),  # Germany vs Curacao - Houston UTC-5
    9: ('Jun 14', 19, 0, -4),   # Ivory Coast vs Ecuador - Philadelphia UTC-4
    33: ('Jun 20', 16, 0, -4),  # Germany vs Ivory Coast - Toronto UTC-4
    34: ('Jun 20', 19, 0, -5),  # Ecuador vs Curacao - Kansas City UTC-5
    55: ('Jun 25', 16, 0, -4),  # Curacao vs Ivory Coast - Philadelphia UTC-4
    56: ('Jun 25', 16, 0, -4),  # Ecuador vs Germany - East Rutherford UTC-4

    # Group F
    11: ('Jun 14', 15, 0, -5),  # Netherlands vs Japan - Arlington UTC-5
    12: ('Jun 14', 20, 0, -6),  # Sweden vs Tunisia - Monterrey UTC-6
    35: ('Jun 20', 12, 0, -5),  # Netherlands vs Sweden - Houston UTC-5
    36: ('Jun 20', 22, 0, -6),  # Tunisia vs Japan - Monterrey UTC-6
    57: ('Jun 25', 18, 0, -5),  # Japan vs Sweden - Arlington UTC-5
    58: ('Jun 25', 18, 0, -5),  # Tunisia vs Netherlands - Kansas City UTC-5

    # Group G
    16: ('Jun 15', 12, 0, -7),  # Belgium vs Egypt - Seattle UTC-7
    15: ('Jun 15', 18, 0, -7),  # Iran vs New Zealand - LA UTC-7
    39: ('Jun 21', 12, 0, -7),  # Belgium vs Iran - LA UTC-7
    40: ('Jun 21', 18, 0, -7),  # New Zealand vs Egypt - Vancouver UTC-7
    63: ('Jun 26', 20, 0, -7),  # Egypt vs Iran - Seattle UTC-7
    64: ('Jun 26', 20, 0, -7),  # New Zealand vs Belgium - Vancouver UTC-7

    # Group H
    14: ('Jun 15', 12, 0, -4),  # Spain vs Cape Verde - Atlanta UTC-4
    13: ('Jun 15', 18, 0, -4),  # Saudi Arabia vs Uruguay - Miami UTC-4
    38: ('Jun 21', 12, 0, -4),  # Spain vs Saudi Arabia - Atlanta UTC-4
    37: ('Jun 21', 18, 0, -4),  # Uruguay vs Cape Verde - Miami UTC-4
    65: ('Jun 26', 19, 0, -5),  # Cape Verde vs Saudi Arabia - Houston UTC-5
    66: ('Jun 26', 18, 0, -6),  # Uruguay vs Spain - Guadalajara UTC-6

    # Group I
    17: ('Jun 16', 15, 0, -4),  # France vs Senegal - East Rutherford UTC-4
    18: ('Jun 16', 18, 0, -4),  # Iraq vs Norway - Foxborough UTC-4
    42: ('Jun 22', 17, 0, -4),  # France vs Iraq - Philadelphia UTC-4
    41: ('Jun 22', 20, 0, -4),  # Norway vs Senegal - East Rutherford UTC-4
    61: ('Jun 26', 15, 0, -4),  # Norway vs France - Foxborough UTC-4
    62: ('Jun 26', 15, 0, -4),  # Senegal vs Iraq - Toronto UTC-4

    # Group J
    19: ('Jun 16', 20, 0, -5),  # Argentina vs Algeria - Kansas City UTC-5
    20: ('Jun 16', 21, 0, -7),  # Austria vs Jordan - Santa Clara UTC-7
    43: ('Jun 22', 12, 0, -5),  # Argentina vs Austria - Arlington UTC-5
    44: ('Jun 22', 20, 0, -7),  # Jordan vs Algeria - Santa Clara UTC-7
    69: ('Jun 27', 21, 0, -5),  # Algeria vs Austria - Kansas City UTC-5
    70: ('Jun 27', 21, 0, -5),  # Jordan vs Argentina - Arlington UTC-5

    # Group K
    23: ('Jun 17', 12, 0, -5),  # Portugal vs DR Congo - Houston UTC-5
    24: ('Jun 17', 20, 0, -6),  # Uzbekistan vs Colombia - Mexico City UTC-6
    47: ('Jun 23', 12, 0, -5),  # Portugal vs Uzbekistan - Houston UTC-5
    48: ('Jun 23', 20, 0, -6),  # Colombia vs DR Congo - Guadalajara UTC-6
    71: ('Jun 27', 19, 30, -4), # Colombia vs Portugal - Miami UTC-4
    72: ('Jun 27', 19, 30, -4), # DR Congo vs Uzbekistan - Atlanta UTC-4

    # Group L
    22: ('Jun 17', 15, 0, -5),  # England vs Croatia - Arlington UTC-5
    21: ('Jun 17', 19, 0, -4),  # Ghana vs Panama - Toronto UTC-4
    45: ('Jun 23', 16, 0, -4),  # England vs Ghana - Foxborough UTC-4
    46: ('Jun 23', 19, 0, -4),  # Panama vs Croatia - Toronto UTC-4
    67: ('Jun 27', 17, 0, -4),  # Panama vs England - East Rutherford UTC-4
    68: ('Jun 27', 17, 0, -4),  # Croatia vs Ghana - Philadelphia UTC-4

    # Round of 32
    73: ('Jun 28', 12, 0, -7),  # R32 - LA UTC-7
    76: ('Jun 29', 12, 0, -5),  # R32 - Houston UTC-5
    74: ('Jun 29', 16, 30, -4), # R32 - Foxborough UTC-4
    75: ('Jun 29', 19, 0, -6),  # R32 - Monterrey UTC-6
    78: ('Jun 30', 12, 0, -5),  # R32 - Arlington UTC-5
    77: ('Jun 30', 17, 0, -4),  # R32 - East Rutherford UTC-4
    79: ('Jun 30', 19, 0, -6),  # R32 - Mexico City UTC-6
    80: ('Jul 1', 12, 0, -4),   # R32 - Atlanta UTC-4
    82: ('Jul 1', 13, 0, -7),   # R32 - Seattle UTC-7
    81: ('Jul 1', 17, 0, -7),   # R32 - Santa Clara UTC-7
    84: ('Jul 2', 12, 0, -7),   # R32 - LA UTC-7
    83: ('Jul 2', 19, 0, -4),   # R32 - Toronto UTC-4
    85: ('Jul 2', 20, 0, -7),   # R32 - Vancouver UTC-7
    88: ('Jul 3', 13, 0, -5),   # R32 - Arlington UTC-5
    86: ('Jul 3', 18, 0, -4),   # R32 - Miami UTC-4
    87: ('Jul 3', 20, 30, -5),  # R32 - Kansas City UTC-5

    # Round of 16
    90: ('Jul 4', 12, 0, -5),   # R16 - Houston UTC-5
    89: ('Jul 4', 17, 0, -4),   # R16 - Philadelphia UTC-4
    91: ('Jul 5', 16, 0, -4),   # R16 - East Rutherford UTC-4
    92: ('Jul 5', 18, 0, -6),   # R16 - Mexico City UTC-6
    93: ('Jul 6', 14, 0, -5),   # R16 - Arlington UTC-5
    94: ('Jul 6', 17, 0, -7),   # R16 - Seattle UTC-7
    95: ('Jul 7', 12, 0, -4),   # R16 - Atlanta UTC-4
    96: ('Jul 7', 13, 0, -7),   # R16 - Vancouver UTC-7

    # Quarterfinals
    97: ('Jul 9', 16, 0, -4),   # QF - Foxborough UTC-4
    98: ('Jul 10', 12, 0, -7),  # QF - LA UTC-7
    99: ('Jul 11', 17, 0, -4),  # QF - Miami UTC-4
    100: ('Jul 11', 20, 0, -5), # QF - Kansas City UTC-5

    # Semifinals
    101: ('Jul 14', 14, 0, -5), # SF - Arlington UTC-5
    102: ('Jul 15', 15, 0, -4), # SF - Atlanta UTC-4

    # 3rd place
    103: ('Jul 18', 17, 0, -4), # 3rd - Miami UTC-4

    # Final
    104: ('Jul 19', 15, 0, -4), # Final - East Rutherford UTC-4
}

months = {'Jan':1,'Feb':2,'Mar':3,'Apr':4,'May':5,'Jun':6,'Jul':7,'Aug':8,'Sep':9,'Oct':10,'Nov':11,'Dec':12}
month_names = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

results = {}
for match_num, (date_str, local_h, local_m, utc_off) in sorted(matches.items()):
    parts = date_str.split()
    mon = months[parts[0]]
    day = int(parts[1])

    # Convert local to UTC: utc_hour = local_hour - utc_offset
    utc_h = local_h - utc_off
    utc_m = local_m
    utc_day = day
    utc_mon = mon

    # Normalize hours
    if utc_h >= 24:
        utc_h -= 24
        utc_day += 1
    elif utc_h < 0:
        utc_h += 24
        utc_day -= 1

    # AEST = UTC + 10
    aest_h = utc_h + 10
    aest_m = utc_m
    aest_day = utc_day
    aest_mon = utc_mon

    if aest_h >= 24:
        aest_h -= 24
        aest_day += 1

    # Handle month overflow (June has 30 days, July has 31)
    days_in_month = {6: 30, 7: 31}
    if aest_mon in days_in_month and aest_day > days_in_month[aest_mon]:
        aest_day = 1
        aest_mon += 1

    time_str = f'{aest_h:02d}:{aest_m:02d}'
    aest_date = f'{aest_day}-{month_names[aest_mon]}'

    results[match_num] = (aest_date, time_str)

# Print KICKOFF_AEST object
print('const KICKOFF_AEST = {')
for i in range(1, 105):
    d, t = results[i]
    print(f'    {i}: {{date:"{d}", time:"{t}"}},')
print('};')
