#!/bin/bash
# Docker测试脚本

echo "=========================================="
echo "Docker服务测试脚本"
echo "=========================================="

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "错误: Docker未运行，请先启动Docker"
    exit 1
fi

# 检查docker-compose是否可用
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "错误: docker-compose未安装"
    exit 1
fi

echo ""
echo "1. 构建Docker镜像..."
docker-compose build

echo ""
echo "2. 启动所有服务..."
docker-compose up -d

echo ""
echo "3. 等待服务启动..."
sleep 10

echo ""
echo "4. 检查服务状态..."
docker-compose ps

echo ""
echo "5. 测试后端健康检查..."
curl -s http://localhost:8000/health | jq . || echo "后端服务未就绪"

echo ""
echo "6. 测试后端API..."
curl -s http://localhost:8000/api/v1/ping | jq . || echo "API未就绪"

echo ""
echo "7. 测试实体查询..."
curl -s "http://localhost:8000/api/v1/entities?type=TwinObject&limit=2" | jq '.count' || echo "实体查询失败"

echo ""
echo "8. 检查Redis连接..."
docker-compose exec -T backend python -c "
import asyncio
from app.core.cache_service import get_cache_service

async def test():
    try:
        cs = await get_cache_service()
        await cs.set('test', 'value', expire=60)
        val = await cs.get('test')
        print(f'Redis连接成功: {val}')
    except Exception as e:
        print(f'Redis连接失败: {e}')

asyncio.run(test())
" || echo "Redis测试失败"

echo ""
echo "=========================================="
echo "测试完成！"
echo "=========================================="
echo ""
echo "服务地址："
echo "  前端: http://localhost:5173"
echo "  后端API: http://localhost:8000"
echo "  后端文档: http://localhost:8000/docs"
echo "  Mock NGSI: http://localhost:9090"
echo "  Redis: localhost:6379"
echo ""
echo "查看日志: docker-compose logs -f"
echo "停止服务: docker-compose down"

