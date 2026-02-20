$c = Get-Content 'crm_module_v2.js'
# Remove Inbox functions (renderInbox, attachInboxEvents, viewMessage)
# Start remove at Index 612 (renderInbox)
# End remove at Index 762 (end of viewMessage)
# Keep Index 763 (showNegocioDetail)
$new = $c[0..611] + $c[763..($c.Count - 1)]
$new | Set-Content -Encoding UTF8 'crm_module_v2.js'
