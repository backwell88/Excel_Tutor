param(
  [Parameter(Mandatory = $true)]
  [string]$CatalogPath,
  [Parameter(Mandatory = $true)]
  [string]$ReadUser,
  [string]$ShareName = 'ExcelTutorCatalog'
)

$ErrorActionPreference = 'Stop'
$catalogPath = (Resolve-Path -LiteralPath $CatalogPath).Path

if (-not (Test-Path -LiteralPath (Join-Path $catalogPath 'manifest.xml'))) {
  throw "Catalog manifest was not found: $catalogPath"
}

$existingShare = Get-SmbShare -Name $ShareName -ErrorAction SilentlyContinue
if ($existingShare -and $existingShare.Path -ne $catalogPath) {
  throw "The existing share '$ShareName' points to a different folder: $($existingShare.Path)"
}

if (-not $existingShare) {
  New-SmbShare -Name $ShareName -Path $catalogPath -ReadAccess $ReadUser | Out-Null
}

Write-Output "\\$env:COMPUTERNAME\$ShareName"