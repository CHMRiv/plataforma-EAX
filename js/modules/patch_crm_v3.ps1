$path = 'c:\Users\EAX-NOTE-8C\OneDrive\Desktop\00000 Plataforma EAX\platform\js\modules\crm_module_v3.js'
$lines = Get-Content $path -Encoding UTF8
$newLines = New-Object System.Collections.Generic.List[String]

$skip = $false
foreach ($line in $lines) {
    if ($line -match 'const CRMModule = \{') {
        $newLines.Add('var CRMModule = window.CRMModule = {')
        continue
    }

    if ($line -match "id: 'inbox'") { continue }

    if ($line -match "case 'inbox':") { 
        $skip = $true 
        continue 
    }
    if ($skip -and $line -match "this.renderInbox\(container\);") { continue }
    if ($skip -and $line -match "break;") { 
        $skip = $false 
        continue 
    }
    if ($skip) { continue }

    if ($line -match "renderInbox\(container\) \{") {
        $skip = $true
        continue
    }
    if ($skip -and $line -match "showNegocioDetail\(id\) \{") {
        $skip = $false
        $newLines.Add($line)
        continue
    }
    if ($skip) { continue }

    $newLines.Add($line)
}

$newLines | Set-Content $path -Encoding UTF8
Write-Host "Patched $path"
