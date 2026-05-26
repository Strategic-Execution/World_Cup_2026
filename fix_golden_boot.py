"""Fix Golden Boot ranking formula to handle same player in multiple rows."""
from openpyxl import load_workbook


def fix_rank_formula(ws):
    """Update column S (19) rank formulas for rows 6-305."""
    ws.cell(row=4, column=4).value = (
        "Enter one row per goal scorer per match (multiple scorers per match OK)"
    )
    for row in range(6, 306):
        # New formula: MATCH identifies first occurrences globally
        # Tiebreaker: same goals broken by row order (earlier entry = higher rank)
        formula = (
            f'=IF(OR(B{row}="",COUNTIF($B$6:$B{row},B{row})>1),"",'
            f'SUMPRODUCT((MATCH($B$6:$B$305,$B$6:$B$305,0)=ROW($B$6:$B$305)-ROW($B$5))'
            f'*($B$6:$B$305<>"")'
            f'*(($R$6:$R$305>R{row})+(($R$6:$R$305=R{row})*(ROW($B$6:$B$305)<ROW(B{row})))))+1)'
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
