# Docker测试脚本 (PowerShell)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Docker服务测试脚本" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 检查Docker是否运行
try {
    docker info | Out-Null
} catch {
    Write-Host "错误: Docker未运行，请先启动Docker" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "1. 构建Docker镜像..." -ForegroundColor Yellow
docker-compose build

Write-Host ""
Write-Host "2. 启动所有服务..." -ForegroundColor Yellow
docker-compose up -d

Write-Host ""
Write-Host "3. 等待服务启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "4. 检查服务状态..." -ForegroundColor Yellow
docker-compose ps

Write-Host ""
Write-Host "5. 测试后端健康检查..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing
    Write-Host "  状态码: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "  响应: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "  后端服务未就绪" -ForegroundColor Red
}

Write-Host ""
Write-Host "6. 测试后端API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/ping" -UseBasicParsing
    Write-Host "  状态码: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "  响应: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "  API未就绪" -ForegroundColor Red
}

Write-Host ""
Write-Host "7. 测试实体查询..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/entities?type=TwinObject&limit=2" -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    Write-Host "  返回实体数量: $($json.count)" -ForegroundColor Green
} catch {
    Write-Host "  实体查询失败" -ForegroundColor Red
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "测试完成！" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "服务地址：" -ForegroundColor Yellow
Write-Host "  前端: http://localhost:5173" -ForegroundColor White
Write-Host "  后端API: http://localhost:8000" -ForegroundColor White
Write-Host "  后端文档: http://localhost:8000/docs" -ForegroundColor White
Write-Host "  Mock NGSI: http://localhost:9090" -ForegroundColor White
Write-Host "  Redis: localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "查看日志: docker-compose logs -f" -ForegroundColor Cyan
Write-Host "停止服务: docker-compose down" -ForegroundColor Cyan

