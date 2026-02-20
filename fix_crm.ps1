$path = "c:\Users\EAX-NOTE-8C\OneDrive\Desktop\00000 Plataforma EAX\platform\js\modules\crm.js"
$content = [IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
$content = $content.Replace([char]0x2014, "-")
[IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "Replaced em-dashes in $path"
