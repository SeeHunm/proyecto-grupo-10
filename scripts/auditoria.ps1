param(
  [Parameter(Mandatory=$true)][string]$BaseUrl,
  [Parameter(Mandatory=$true)][string]$ApiKey,
  [Parameter(Mandatory=$true)][string]$OutputDir
)

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$OldVulnerableKey = "AGRISMART-DEMO-1234"

function Run-Test {
  param([string]$Name, [string[]]$CurlArgs)
  $path = Join-Path $OutputDir "$Name.txt"
  "Prueba $Name`nFecha: $(Get-Date -Format o)`nComando: curl.exe $($CurlArgs -join ' ')`n" | Set-Content -Encoding UTF8 $path
  & curl.exe @CurlArgs 2>&1 | Tee-Object -FilePath $path -Append
  "`n" | Add-Content $path
}

Run-Test "A01" @(
  '-i','-X','PUT',"$BaseUrl/api/zones/2/irrigation",
  '-H',"x-api-key: $ApiKey",'-H','x-user-id: 1','-H','Content-Type: application/json',
  '--data','{"enabled":false}'
)

Run-Test "A03" @(
  '-i','--get',"$BaseUrl/api/history",
  '-H',"x-api-key: $ApiKey",'-H','x-user-id: 1',
  '--data-urlencode','zone_id=1 OR 1=1'
)

Run-Test "A04" @(
  '-i','-X','PUT',"$BaseUrl/api/zones/1/settings",
  '-H',"x-api-key: $ApiKey",'-H','x-user-id: 1','-H','Content-Type: application/json',
  '--data','{"moisture_threshold":9999,"irrigation_minutes":9999}'
)

Run-Test "A05" @('-i',"$BaseUrl/admin/sensors")

# A07 prueba específicamente si la antigua clave incrustada sigue funcionando.
Run-Test "A07" @(
  '-i',"$BaseUrl/api/sensors",
  '-H',"x-api-key: $OldVulnerableKey",'-H','x-user-id: 1'
)

Write-Host "Evidencias guardadas en $OutputDir"
