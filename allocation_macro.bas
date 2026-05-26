Attribute VB_Name = "SweepstakeAllocation"
'===============================================================
' FIFA World Cup 2026 Sweepstake - Team Allocation Macro
'===============================================================
' This macro randomly allocates teams to participants.
' - First 48 participants each get a unique team (all 48 used)
' - Participants 49-96 get teams from a fresh cycle of 48
' - And so on for additional cycles
'
' HOW TO IMPORT:
' 1. Save your workbook as .xlsm (macro-enabled)
' 2. Press Alt+F11 to open VBA editor
' 3. File > Import File > select this .bas file
' 4. Close VBA editor
' 5. Run: Alt+F8 > AllocateTeams > Run
'===============================================================

Sub AllocateTeams()
    
    Dim wsParticipants As Worksheet
    Dim wsAllocation As Worksheet
    Dim wsTeams As Worksheet
    
    Set wsParticipants = ThisWorkbook.Sheets("Participants")
    Set wsAllocation = ThisWorkbook.Sheets("Allocation")
    Set wsTeams = ThisWorkbook.Sheets("Teams")
    
    ' Count participants
    Dim participantCount As Long
    participantCount = 0
    Dim i As Long
    For i = 5 To 104  ' Rows 5-104 in Participants sheet (row 4 is header)
        If Trim(wsParticipants.Cells(i, 2).Value) <> "" Then
            participantCount = participantCount + 1
        Else
            Exit For
        End If
    Next i
    
    If participantCount = 0 Then
        MsgBox "No participants found! Please enter names in the 'Participants' sheet column B (starting row 5).", vbExclamation
        Exit Sub
    End If
    
    ' Confirm with user
    Dim msg As String
    msg = "Found " & participantCount & " participant(s)." & vbCrLf & vbCrLf
    msg = msg & "This will randomly allocate teams in cycles of 48." & vbCrLf
    msg = msg & "Cycles needed: " & Application.WorksheetFunction.RoundUp(participantCount / 48, 0) & vbCrLf & vbCrLf
    msg = msg & "WARNING: This will overwrite any existing allocation." & vbCrLf
    msg = msg & "Continue?"
    
    If MsgBox(msg, vbYesNo + vbQuestion, "Allocate Teams") = vbNo Then
        Exit Sub
    End If
    
    ' Load all 48 teams from Teams sheet
    Dim allTeams(1 To 48) As String
    Dim allGroups(1 To 48) As String
    For i = 1 To 48
        allTeams(i) = wsTeams.Cells(i + 3, 2).Value  ' Column B, starting row 4
        allGroups(i) = wsTeams.Cells(i + 3, 3).Value  ' Column C, starting row 4
    Next i
    
    ' Clear existing allocation
    wsAllocation.Range("A6:E200").ClearContents
    
    ' Randomize seed
    Randomize Timer
    
    ' Allocate in cycles of 48
    Dim cycleNum As Long
    Dim participantIdx As Long
    participantIdx = 1
    cycleNum = 1
    
    Do While participantIdx <= participantCount
        ' Create shuffled array for this cycle
        Dim shuffled(1 To 48) As Long
        For i = 1 To 48
            shuffled(i) = i
        Next i
        
        ' Fisher-Yates shuffle
        Dim j As Long
        Dim temp As Long
        For i = 48 To 2 Step -1
            j = Int(Rnd() * i) + 1
            temp = shuffled(i)
            shuffled(i) = shuffled(j)
            shuffled(j) = temp
        Next i
        
        ' Assign teams from this cycle
        Dim teamIdx As Long
        teamIdx = 1
        Do While teamIdx <= 48 And participantIdx <= participantCount
            Dim allocRow As Long
            allocRow = 5 + participantIdx  ' Row in allocation sheet (header at row 5)
            
            wsAllocation.Cells(allocRow, 1).Value = participantIdx
            wsAllocation.Cells(allocRow, 2).Value = wsParticipants.Cells(4 + participantIdx, 2).Value
            wsAllocation.Cells(allocRow, 3).Value = allTeams(shuffled(teamIdx))
            wsAllocation.Cells(allocRow, 4).Value = allGroups(shuffled(teamIdx))
            wsAllocation.Cells(allocRow, 5).Value = cycleNum
            
            participantIdx = participantIdx + 1
            teamIdx = teamIdx + 1
        Loop
        
        cycleNum = cycleNum + 1
    Loop
    
    ' Update Leaderboard sheet references
    Call UpdateLeaderboard(participantCount)
    
    ' Format allocation sheet
    wsAllocation.Range("A5:E5").Font.Bold = True
    
    MsgBox participantCount & " participant(s) allocated successfully!" & vbCrLf & vbCrLf & _
           "Check the 'Allocation' sheet to see assignments." & vbCrLf & _
           "The 'Leaderboard' sheet has been updated.", vbInformation, "Done!"
    
    wsAllocation.Activate
    
End Sub

Sub UpdateLeaderboard(participantCount As Long)
    ' Leaderboard is now fully formula-driven from the Allocation sheet.
    ' Just force a recalculation to pick up the new allocation.
    Application.Calculate
End Sub

Sub ReAllocateTeams()
    ' Convenience sub - just calls AllocateTeams
    ' Use this to re-run the allocation if needed
    Call AllocateTeams
End Sub
