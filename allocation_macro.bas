Attribute VB_Name = "SweepstakeAllocation"
'===============================================================
' FIFA World Cup 2026 Sweepstake - Team Allocation Macro
'===============================================================
' This macro allocates teams based on FIFA ranking:
' - Teams ranked 1-40 (by Sweep Rank) are randomly allocated
'   to 40 real participants (one team per person)
' - Teams ranked 41-48 are assigned to Phantom 1-8 participants
'
' The Sweep Rank column (E) on the Teams sheet determines ranking.
' Participants named "Phantom X" are auto-detected as phantoms.
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
    
    ' --- Load all 48 teams with their sweep ranks ---
    Dim teamNames(1 To 48) As String
    Dim teamGroups(1 To 48) As String
    Dim teamSweepRanks(1 To 48) As Long
    Dim i As Long
    
    For i = 1 To 48
        teamNames(i) = wsTeams.Cells(i + 3, 2).Value       ' Column B
        teamGroups(i) = wsTeams.Cells(i + 3, 3).Value      ' Column C
        teamSweepRanks(i) = wsTeams.Cells(i + 3, 5).Value  ' Column E (Sweep Rank)
    Next i
    
    ' --- Separate into top 40 and bottom 8 by sweep rank ---
    ' Find which row indices have sweep rank 1-40 vs 41-48
    Dim top40Indices(1 To 40) As Long
    Dim bottom8Indices(1 To 8) As Long
    Dim t40 As Long, b8 As Long
    t40 = 0: b8 = 0
    
    For i = 1 To 48
        If teamSweepRanks(i) <= 40 Then
            t40 = t40 + 1
            top40Indices(t40) = i
        Else
            b8 = b8 + 1
            bottom8Indices(b8) = i
        End If
    Next i
    
    ' Validate
    If t40 <> 40 Or b8 <> 8 Then
        MsgBox "Error: Expected 40 teams ranked 1-40 and 8 ranked 41-48." & vbCrLf & _
               "Found " & t40 & " top teams and " & b8 & " bottom teams." & vbCrLf & _
               "Please check the Sweep Rank column (E) on the Teams sheet.", vbCritical
        Exit Sub
    End If
    
    ' --- Count participants and separate real vs phantom ---
    Dim realNames() As String
    Dim phantomNames() As String
    Dim realCount As Long, phantomCount As Long
    Dim realRows() As Long, phantomRows() As Long
    
    ' First pass: count
    Dim totalCount As Long
    totalCount = 0
    For i = 5 To 104
        If Trim(wsParticipants.Cells(i, 2).Value) <> "" Then
            totalCount = totalCount + 1
        Else
            Exit For
        End If
    Next i
    
    If totalCount = 0 Then
        MsgBox "No participants found! Please enter names in the 'Participants' sheet column B (starting row 5).", vbExclamation
        Exit Sub
    End If
    
    ' Second pass: classify
    ReDim realNames(1 To totalCount)
    ReDim phantomNames(1 To totalCount)
    ReDim realRows(1 To totalCount)
    ReDim phantomRows(1 To totalCount)
    realCount = 0: phantomCount = 0
    
    For i = 1 To totalCount
        Dim pName As String
        pName = Trim(wsParticipants.Cells(4 + i, 2).Value)
        If LCase(Left(pName, 7)) = "phantom" Then
            phantomCount = phantomCount + 1
            phantomNames(phantomCount) = pName
            phantomRows(phantomCount) = 4 + i
        Else
            realCount = realCount + 1
            realNames(realCount) = pName
            realRows(realCount) = 4 + i
        End If
    Next i
    
    ' Validate counts
    If realCount <> 40 Then
        MsgBox "Expected exactly 40 real participants (non-Phantom), but found " & realCount & "." & vbCrLf & vbCrLf & _
               "Please ensure there are 40 real participants and 8 Phantom entries" & vbCrLf & _
               "in the Participants sheet.", vbExclamation
        Exit Sub
    End If
    
    If phantomCount <> 8 Then
        MsgBox "Expected exactly 8 Phantom participants, but found " & phantomCount & "." & vbCrLf & vbCrLf & _
               "Please add Phantom 1 through Phantom 8 to the Participants sheet.", vbExclamation
        Exit Sub
    End If
    
    ' Confirm with user
    Dim msg As String
    msg = "Found " & realCount & " real participants and " & phantomCount & " phantoms." & vbCrLf & vbCrLf
    msg = msg & "Allocation method:" & vbCrLf
    msg = msg & "  - Top 40 ranked teams randomly assigned to 40 real participants" & vbCrLf
    msg = msg & "  - Bottom 8 ranked teams assigned to Phantom 1-8" & vbCrLf & vbCrLf
    msg = msg & "WARNING: This will overwrite any existing allocation." & vbCrLf
    msg = msg & "Continue?"
    
    If MsgBox(msg, vbYesNo + vbQuestion, "Allocate Teams") = vbNo Then
        Exit Sub
    End If
    
    ' Clear existing allocation
    wsAllocation.Range("A6:E200").ClearContents
    
    ' --- Randomize and allocate top 40 teams to real participants ---
    Randomize Timer
    
    ' Shuffle the top 40 team indices using Fisher-Yates
    Dim shuffled(1 To 40) As Long
    For i = 1 To 40
        shuffled(i) = top40Indices(i)
    Next i
    
    Dim j As Long, temp As Long
    For i = 40 To 2 Step -1
        j = Int(Rnd() * i) + 1
        temp = shuffled(i)
        shuffled(i) = shuffled(j)
        shuffled(j) = temp
    Next i
    
    ' Write real participant allocations
    Dim allocRow As Long
    For i = 1 To 40
        allocRow = 5 + i  ' Row in allocation sheet (header at row 5)
        wsAllocation.Cells(allocRow, 1).Value = i
        wsAllocation.Cells(allocRow, 2).Value = realNames(i)
        wsAllocation.Cells(allocRow, 3).Value = teamNames(shuffled(i))
        wsAllocation.Cells(allocRow, 4).Value = teamGroups(shuffled(i))
        wsAllocation.Cells(allocRow, 5).Value = teamSweepRanks(shuffled(i))
    Next i
    
    ' --- Assign bottom 8 teams to Phantoms ---
    ' Sort bottom 8 by sweep rank so Phantom 1 gets rank 41, Phantom 2 gets rank 42, etc.
    ' First sort bottom8Indices by their sweep rank
    Dim sortedBottom8(1 To 8) As Long
    For i = 1 To 8
        sortedBottom8(i) = bottom8Indices(i)
    Next i
    
    ' Simple bubble sort by sweep rank
    Dim k As Long
    For i = 1 To 7
        For k = 1 To 8 - i
            If teamSweepRanks(sortedBottom8(k)) > teamSweepRanks(sortedBottom8(k + 1)) Then
                temp = sortedBottom8(k)
                sortedBottom8(k) = sortedBottom8(k + 1)
                sortedBottom8(k + 1) = temp
            End If
        Next k
    Next i
    
    ' Sort phantom names numerically (Phantom 1, Phantom 2, etc.)
    ' Extract number from phantom name and sort
    Dim phantomNums(1 To 8) As Long
    Dim phantomSorted(1 To 8) As Long
    For i = 1 To 8
        ' Extract the number from "Phantom X"
        Dim numStr As String
        numStr = Trim(Mid(phantomNames(i), 8))
        If IsNumeric(numStr) Then
            phantomNums(i) = CLng(numStr)
        Else
            phantomNums(i) = i
        End If
        phantomSorted(i) = i
    Next i
    
    ' Bubble sort phantoms by their number
    For i = 1 To 7
        For k = 1 To 8 - i
            If phantomNums(phantomSorted(k)) > phantomNums(phantomSorted(k + 1)) Then
                temp = phantomSorted(k)
                phantomSorted(k) = phantomSorted(k + 1)
                phantomSorted(k + 1) = temp
            End If
        Next k
    Next i
    
    ' Write phantom allocations
    For i = 1 To 8
        allocRow = 5 + 40 + i  ' After the 40 real participants
        Dim pIdx As Long
        pIdx = phantomSorted(i)
        wsAllocation.Cells(allocRow, 1).Value = 40 + i
        wsAllocation.Cells(allocRow, 2).Value = phantomNames(pIdx)
        wsAllocation.Cells(allocRow, 3).Value = teamNames(sortedBottom8(i))
        wsAllocation.Cells(allocRow, 4).Value = teamGroups(sortedBottom8(i))
        wsAllocation.Cells(allocRow, 5).Value = teamSweepRanks(sortedBottom8(i))
    Next i
    
    ' Update Leaderboard sheet references
    Call UpdateLeaderboard(totalCount)
    
    ' Format allocation sheet
    wsAllocation.Range("A5:E5").Font.Bold = True
    
    MsgBox "Allocation complete!" & vbCrLf & vbCrLf & _
           "  " & realCount & " real participants assigned top-40 ranked teams (random)" & vbCrLf & _
           "  " & phantomCount & " phantom participants assigned bottom-8 ranked teams" & vbCrLf & vbCrLf & _
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
