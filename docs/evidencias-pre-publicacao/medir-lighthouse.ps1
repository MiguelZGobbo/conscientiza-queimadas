param([ValidateSet('antes','depois')][string]$Phase = 'antes')
$ErrorActionPreference = 'Stop'
$env:CHROME_PATH = Join-Path $env:LOCALAPPDATA 'ms-playwright\chromium_headless_shell-1243\chrome-headless-shell-win64\chrome-headless-shell.exe'
$taskLighthouseDir = Join-Path (Get-Location) ".auditoria-local\$Phase\lighthouse"
New-Item -ItemType Directory -Force -Path $taskLighthouseDir | Out-Null
foreach ($profile in @('mobile', 'desktop')) {
  foreach ($pageName in @('index', 'queimadas', 'dados', 'prevencao')) {
    foreach ($sample in 1..3) {
      $taskOutput = Join-Path $taskLighthouseDir "$profile-$pageName-$sample"
      $taskArgs = @('exec', '--yes', '--package=lighthouse@13.5.0', '--', 'lighthouse', "http://127.0.0.1:4173/$pageName.html", '--chrome-flags=--headless', '--only-categories=performance,accessibility,best-practices,seo', '--output=json', '--output=html', "--output-path=$taskOutput", '--quiet')
      if ($profile -eq 'desktop') { $taskArgs += '--preset=desktop' }
      & npm @taskArgs
      if ($LASTEXITCODE -ne 0) { throw "Lighthouse falhou: $profile $pageName $sample" }
      Write-Output "$Phase $profile $pageName $sample/3 concluído"
    }
  }
}
