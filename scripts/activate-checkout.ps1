param(
    [Parameter(Mandatory = $true)]
    [string]$CheckoutUrl,
    [switch]$Publish,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$ConfigJson = Join-Path $Root "site-config.json"
$ConfigJs = Join-Path $Root "site-config.js"
$ConfigureScript = Join-Path $PSScriptRoot "configure_checkout.py"
$SmokeTest = Join-Path $Root "tests\ui_smoke.py"
$Repository = "szw9999/ai-app-preflight-checklist"
$LiveConfigUrl = "https://szw9999.github.io/ai-app-preflight-checklist/site-config.js"

$Python = Get-Command python -ErrorAction Stop
$Npm = Get-Command npm.cmd -ErrorAction Stop

if ($DryRun) {
    & $Python.Source -B $ConfigureScript --url $CheckoutUrl --dry-run
    if ($LASTEXITCODE -ne 0) { throw "Checkout URL validation failed." }
    Write-Host "Dry run completed; no file was changed."
    exit 0
}

Push-Location $Root
try {
    if (git status --porcelain) {
        throw "The repository has uncommitted changes. Finish or preserve them before checkout activation."
    }

    $OriginalJson = [System.IO.File]::ReadAllText($ConfigJson)
    $OriginalJs = [System.IO.File]::ReadAllText($ConfigJs)
    try {
        & $Python.Source -B $ConfigureScript --url $CheckoutUrl
        if ($LASTEXITCODE -ne 0) { throw "Checkout configuration failed." }

        & $Npm.Source test
        if ($LASTEXITCODE -ne 0) { throw "Unit tests failed." }

        & $Python.Source -B $SmokeTest
        if ($LASTEXITCODE -ne 0) { throw "Browser smoke test failed." }

        git diff --check
        if ($LASTEXITCODE -ne 0) { throw "Git diff validation failed." }
    } catch {
        [System.IO.File]::WriteAllText($ConfigJson, $OriginalJson)
        [System.IO.File]::WriteAllText($ConfigJs, $OriginalJs)
        throw
    }

    if (-not $Publish) {
        Write-Host "Checkout configuration and tests passed. Rerun with -Publish to publish it."
        exit 0
    }

    $Gh = Get-Command gh -ErrorAction SilentlyContinue
    if (-not $Gh) {
        $FallbackGh = Join-Path (Split-Path -Parent $Root) "github-tools\gh\bin\gh.exe"
        if (-not (Test-Path $FallbackGh)) { throw "GitHub CLI was not found." }
        $GhPath = $FallbackGh
    } else {
        $GhPath = $Gh.Source
    }

    git add -- site-config.json site-config.js
    git commit -m "Activate product checkout"
    if ($LASTEXITCODE -ne 0) { throw "Git commit failed." }
    git push
    if ($LASTEXITCODE -ne 0) { throw "Git push failed." }

    $Commit = (git rev-parse HEAD).Trim()
    $Published = $false
    for ($Attempt = 1; $Attempt -le 24; $Attempt++) {
        $Build = (& $GhPath api "repos/$Repository/pages/builds/latest" | ConvertFrom-Json)
        if ($Build.status -eq "built" -and $Build.commit -eq $Commit) {
            $Published = $true
            break
        }
        Start-Sleep -Seconds 5
    }
    if (-not $Published) { throw "GitHub Pages did not publish the exact commit within two minutes." }

    $LiveConfig = (Invoke-WebRequest -UseBasicParsing -Uri $LiveConfigUrl -TimeoutSec 30).Content
    if (-not $LiveConfig.Contains($CheckoutUrl)) {
        throw "The live browser configuration does not contain the expected checkout URL."
    }
    Write-Host "Checkout is live and verified at commit $Commit."
} finally {
    Pop-Location
}
