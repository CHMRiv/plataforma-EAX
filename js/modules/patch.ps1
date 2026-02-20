$c = Get-Content 'crm_module.js'
$lines = $c
$stub = "        container.innerHTML = 'Client View Stubbed';"
$n = $lines[0..85] + $stub + $lines[610..($lines.Count - 1)]
$n | Set-Content -Encoding UTF8 'crm_stub_client.js'
