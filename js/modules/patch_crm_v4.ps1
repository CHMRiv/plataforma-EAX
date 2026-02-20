$path = 'c:\Users\EAX-NOTE-8C\OneDrive\Desktop\00000 Plataforma EAX\platform\js\modules\crm_module_v4.js'
$lines = Get-Content $path -Encoding UTF8
$newLines = New-Object System.Collections.Generic.List[String]

$skip = $false
# Pre-define patterns to avoid escaping issues
$globalVarPattern = 'const CRMModule = \{'
$inboxIdPattern = "id: 'inbox'"
$caseInboxPattern = "case 'inbox':"
$renderInboxCallPattern = "this.renderInbox\(container\);"
$breakPattern = "break;"
$renderInboxDefPattern = "renderInbox\(container\)"
$showNegocioDetailDefPattern = "showNegocioDetail"

foreach ($line in $lines) {
    # 1. Global Var
    if ($line -match $globalVarPattern) {
        $newLines.Add('var CRMModule = window.CRMModule = {')
        continue
    }

    # 2. Inbox Tab
    if ($line -match $inboxIdPattern) { continue }

    # 3. Switch Case (Inbox)
    if ($line -match $caseInboxPattern) { 
        $skip = $true 
        continue 
    }
    if ($skip -and $line -match $renderInboxCallPattern) { continue }
    if ($skip -and $line -match $breakPattern) { 
        $skip = $false 
        continue 
    }
    if ($skip) { continue }

    # 4. Big Inbox Block (renderInbox -> showNegocioDetail)
    if ($line -match $renderInboxDefPattern) {
        $skip = $true
        # Don't add 'renderInbox' line
        continue
    }
    # Look for 'showNegocioDetail'
    if ($skip -and $line -match $showNegocioDetailDefPattern) {
        $skip = $false
        # Add 'showNegocioDetail' line
        $newLines.Add($line)
        continue
    }
    
    if ($skip) { continue }

    $newLines.Add($line)
}

$newLines | Set-Content $path -Encoding UTF8
Write-Host "Patcher v4 Complete"
