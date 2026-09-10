$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$catalogPath = Join-Path $projectRoot 'catalog'

New-Item -ItemType Directory -Path $catalogPath -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $projectRoot 'manifest.xml') -Destination (Join-Path $catalogPath 'manifest.xml') -Force

Write-Output "Catalog manifest refreshed: $catalogPath"