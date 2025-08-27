# download-face-models.ps1
# Execute este script na pasta public/models

$baseUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

# Modelos que faltam para detecção de expressão/sorriso
$modelsToDownload = @(
    "face_expression_model-shard1",
    "face_expression_model-weights_manifest.json"
)

Write-Host "🚀 Baixando modelos face-api.js..." -ForegroundColor Green
Write-Host ""

foreach ($model in $modelsToDownload) {
    $url = "$baseUrl/$model"
    $outputPath = "./$model"
    
    Write-Host "⬇️  Baixando: $model..." -ForegroundColor Yellow
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $outputPath -UseBasicParsing
        Write-Host "✅ Sucesso: $model baixado!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Erro ao baixar $model : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📁 Arquivos na pasta models:" -ForegroundColor Cyan
Get-ChildItem -Name | Sort-Object

Write-Host ""
Write-Host "🎉 Download concluído!" -ForegroundColor Green