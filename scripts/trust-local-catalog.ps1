param(
  [Parameter(Mandatory = $true)]
  [string]$CatalogUrl
)

$ErrorActionPreference = 'Stop'
$catalogId = '{94d9a679-9b23-4df1-8786-343acf25e5b4}'
$registryPath = "HKCU:\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\$catalogId"

New-Item -Path $registryPath -Force | Out-Null
New-ItemProperty -Path $registryPath -Name 'Id' -PropertyType String -Value $catalogId -Force | Out-Null
New-ItemProperty -Path $registryPath -Name 'Url' -PropertyType String -Value $CatalogUrl -Force | Out-Null
New-ItemProperty -Path $registryPath -Name 'Flags' -PropertyType DWord -Value 1 -Force | Out-Null

Write-Output "Trusted catalog configured: $CatalogUrl"