# Test Backend Connection
Write-Host "Testing backend connection..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/certificates/my-certificates" -Method GET -Headers @{"Authorization"="Bearer test"} -ErrorAction Stop -TimeoutSec 5
    Write-Host " Backend is running!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host " Backend is running! (401 Unauthorized is expected without valid token)" -ForegroundColor Green
    } elseif ($_.Exception.Message -like "*connection*refused*" -or $_.Exception.Message -like "*ERR_CONNECTION_REFUSED*") {
        Write-Host " Backend is NOT running!" -ForegroundColor Red
        Write-Host "   Error: Connection refused" -ForegroundColor Red
        Write-Host "   Solution: Start backend with 'cd elearning-backend && npm start'" -ForegroundColor Yellow
    } else {
        Write-Host "  Backend response: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}
