$path = 'c:\Users\EAX-NOTE-8C\OneDrive\Desktop\00000 Plataforma EAX\platform\js\modules\crm_module_v5.js'
$lines = Get-Content $path -Encoding UTF8
$list = New-Object System.Collections.ArrayList
foreach ($line in $lines) { [void]$list.Add($line) }

# Find precise indices
$idxRenderInbox = -1
$idxShowNegocio = -1
$idxCaseInbox = -1
$idxTabInbox = -1
$idxGlobalVar = -1
$idxCorreos = -1

for ($i = 0; $i -lt $list.Count; $i++) {
    if ($list[$i] -match "^\s*renderInbox\(container\) \{") { $idxRenderInbox = $i }
    if ($list[$i] -match "^\s*showNegocioDetail\(id\) \{") { $idxShowNegocio = $i }
    if ($list[$i] -match "^\s*case 'inbox':") { $idxCaseInbox = $i }
    if ($list[$i] -match "id: 'inbox'") { $idxTabInbox = $i }
    if ($list[$i] -match 'const CRMModule = \{') { $idxGlobalVar = $i }
    if ($list[$i] -match "const correos = Store.filter\('crm_mensajes'") { $idxCorreos = $i }
}

Write-Host "Indices: Render=$idxRenderInbox, Show=$idxShowNegocio, Case=$idxCaseInbox, Tab=$idxTabInbox, Global=$idxGlobalVar, Correos=$idxCorreos"

# Execute modifications in REVERSE order of indices to avoid shifting problems
# Sort indices descending?
# No, let's just do it carefully.
# Highest index is $idxShowNegocio (Wait, removing block BEFORE it shifts it DOWN? No, removing block AFTER it... wait).
# If I remove block [RenderInbox, ShowNegocio-1], then ShowNegocio index changes.
# But Correos is AFTER ShowNegocio. (Inside it).
# So Correos index changes if I remove block above it.
# So I should modify Correos FIRST (using original index).
# Then Remove Block. (Using original index? No, block is above Correos).
# Removing Block uses its own start index.
# Removing CaseInbox is above RenderInbox.
# Removing TabInbox is above CaseInbox.
# Replacing GlobalVar is at top.

# Order:
# 1. Modify Correos (Highest index, inside ShowNegocio). Valid.
# 2. Remove RenderInbox Block (Above Correos). Valid.
# 3. Remove CaseInbox Block (Above RenderInbox). Valid.
# 4. Remove TabInbox (Above CaseInbox). Valid.
# 5. Replace GlobalVar (Top). Valid.

# Wait! Removing lines shifts HIGHER indices DOWN (lower value).
# So if I modify Index 776 (Correos), then remove lines 617-768...
# Then Index 776 is now ~620.
# So I MUST modify Correos BEFORE removing lines above it. Correct.
# And removing lines 617-768 shifts indices > 768.
# It does NOT shift indices < 617.
# So Index 81 (CaseInbox) is unaffected by removing 617 block.
# So order:
# 1. Disarm Correos (Index ~776).
# 2. Remove RenderInbox Loop (Index ~617).
# 3. Remove CaseInbox (Index ~81).
# 4. Remove TabInbox (Index ~33).
# 5. Global Var (Index ~7).

if ($idxCorreos -gt -1) {
    $list[$idxCorreos] = "            const correos = []; // Emails disabled"
    Write-Host "Disarmed Correos at $idxCorreos"
}

if ($idxRenderInbox -gt -1 -and $idxShowNegocio -gt $idxRenderInbox) {
    $count = $idxShowNegocio - $idxRenderInbox
    $list.RemoveRange($idxRenderInbox, $count)
    Write-Host "Removed Inbox Block ($count lines) starting at $idxRenderInbox"
}

if ($idxCaseInbox -gt -1) {
    # Remove 3 lines for case, call, break
    $list.RemoveRange($idxCaseInbox, 3)
    Write-Host "Removed Case Inbox at $idxCaseInbox"
}

if ($idxTabInbox -gt -1) {
    $list.RemoveAt($idxTabInbox)
    Write-Host "Removed Tab Inbox at $idxTabInbox"
}

if ($idxGlobalVar -gt -1) {
    $list[$idxGlobalVar] = 'var CRMModule = window.CRMModule = {'
    Write-Host "Patched Global Var at $idxGlobalVar"
}

$list | Set-Content $path -Encoding UTF8
Write-Host "Patch V5 Complete"
