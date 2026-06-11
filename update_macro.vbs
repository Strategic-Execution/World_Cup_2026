Dim xl, wb, vbProj, comp, found
Set xl = CreateObject("Excel.Application")
xl.Visible = False
xl.DisplayAlerts = False

Set wb = xl.Workbooks.Open("C:\Users\s67655\Downloads\World Cup Sweep\WorldCup2026_Sweepstake.xlsm")
Set vbProj = wb.VBProject

found = False
For Each comp In vbProj.VBComponents
    If comp.Name = "SweepstakeAllocation" Then
        vbProj.VBComponents.Remove comp
        WScript.Echo "Removed old module"
        found = True
        Exit For
    End If
Next

vbProj.VBComponents.Import "C:\Users\s67655\Downloads\World Cup Sweep\allocation_macro.bas"
WScript.Echo "Imported new module"

wb.Save
wb.Close
xl.Quit
WScript.Echo "Done"
