"""Fix Golden Boot ranking formula to handle same player in multiple rows."""
from openpyxl import load_workbook


def fix_rank_formula(ws):
    """Update column S (19) rank formulas for rows 6-305."""
    ws.cell(row=4, column=4).value = (
        "Enter one row per goal scorer per match (multiple scorers per match OK)"
    )
    for row in range(6, 306):
        # Uses 1/COUNTIF trick to count unique players correctly
        # Tiebreaker: alphabetical by player name (ensures no tied ranks)
        formula = (
            f'=IF(OR(B{row}="",COUNTIF($B$6:$B{row},B{row})>1),"",'
            f'ROUND(SUMPRODUCT(($B$6:$B$305<>"")'
            f'*(($R$6:$R$305>R{row})+(($R$6:$R$305=R{row})*($B$6:$B$305<B{row})))'
            f'/COUNTIF($B$6:$B$305,$B$6:$B$305)),0)+1)'
        )
        ws.cell(row=row, column=19).value = formula


# Fix .xlsx
print("Fixing .xlsx...")
wb = load_workbook('WorldCup2026_Sweepstake.xlsx')
fix_rank_formula(wb['Golden Boot'])
wb.save('WorldCup2026_Sweepstake.xlsx')
print("  Done")

# Fix .xlsm
print("Fixing .xlsm...")
try:
    wb2 = load_workbook('WorldCup2026_Sweepstake.xlsm', keep_vba=True)
    fix_rank_formula(wb2['Golden Boot'])
    wb2.save('WorldCup2026_Sweepstake.xlsm')
    print("  Done")
except PermissionError:
    print("  .xlsm is open in Excel - close it and re-run this script")

print("\nFormula sample (row 8):")
wb3 = load_workbook('WorldCup2026_Sweepstake.xlsx', data_only=False)
print(wb3['Golden Boot'].cell(row=8, column=19).value)
