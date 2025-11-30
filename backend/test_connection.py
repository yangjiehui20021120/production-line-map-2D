"""测试前后端连接和Mock数据服务。"""

import asyncio
import sys
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent))

from app.services.mock_ngsi_service import get_mock_ngsi_service
from app.services.entity_service import get_entity_service
from app.models.requests import EntityQueryRequest


async def test_mock_service():
    """测试Mock NGSI服务。"""
    print("=" * 60)
    print("测试Mock NGSI服务")
    print("=" * 60)
    
    mock_service = get_mock_ngsi_service()
    
    # 测试1: 查询TwinObject实体
    print("\n1. 查询TwinObject实体（Station类型）...")
    stations = await mock_service.query_entities(
        entity_type="TwinObject",
        q="subType.value=='Station'",
        limit=5
    )
    print(f"   找到 {len(stations)} 个Station实体")
    if stations:
        print(f"   示例: {stations[0].get('id')} - {stations[0].get('name', {}).get('value', 'N/A')}")
    
    # 测试2: 查询MBOM实体
    print("\n2. 查询MBOM实体...")
    mboms = await mock_service.query_entities(
        entity_type="MBOM",
        limit=3
    )
    print(f"   找到 {len(mboms)} 个MBOM实体")
    if mboms:
        print(f"   示例: {mboms[0].get('id')}")
    
    # 测试3: 查询Scene实体
    print("\n3. 查询Scene实体...")
    scenes = await mock_service.query_entities(
        entity_type="Scene",
        limit=3
    )
    print(f"   找到 {len(scenes)} 个Scene实体")
    if scenes:
        print(f"   示例: {scenes[0].get('id')}")
    
    # 测试4: 按ID获取实体
    print("\n4. 按ID获取实体...")
    if stations:
        entity_id = stations[0].get('id')
        entity = await mock_service.get_entity(entity_id)
        if entity:
            print(f"   成功获取实体: {entity_id}")
            print(f"   实体类型: {entity.get('type')}")
        else:
            print(f"   未找到实体: {entity_id}")
    
    # 测试5: 查询其他实体类型
    entity_types = ["Modality", "ModalityBinding", "ModalData", "Role", "Assignment"]
    print("\n5. 查询其他实体类型...")
    for et in entity_types:
        entities = await mock_service.query_entities(entity_type=et, limit=2)
        print(f"   {et}: {len(entities)} 条记录")
    
    print("\n" + "=" * 60)
    print("Mock服务测试完成！")
    print("=" * 60)


async def test_entity_service():
    """测试Entity服务。"""
    print("\n" + "=" * 60)
    print("测试Entity服务（通过Mock服务）")
    print("=" * 60)
    
    entity_service = get_entity_service()
    
    # 测试1: 查询实体列表
    print("\n1. 查询TwinObject实体列表...")
    request = EntityQueryRequest(
        entityType="TwinObject",  # 使用alias
        q="subType.value=='Station'",
        limit=3
    )
    entities = await entity_service.query_entities(request)
    print(f"   返回 {len(entities)} 个实体")
    
    # 测试2: 按ID获取实体
    if entities:
        print("\n2. 按ID获取实体...")
        entity_id = entities[0].get('id')
        entity = await entity_service.get_entity_by_id(entity_id)
        if entity:
            print(f"   成功获取实体: {entity_id}")
        else:
            print(f"   未找到实体: {entity_id}")
    
    # 测试3: 查询MBOM
    print("\n3. 查询MBOM实体...")
    request = EntityQueryRequest(
        entityType="MBOM",  # 使用alias
        limit=2
    )
    mboms = await entity_service.query_entities(request)
    print(f"   返回 {len(mboms)} 个MBOM实体")
    
    print("\n" + "=" * 60)
    print("Entity服务测试完成！")
    print("=" * 60)


async def main():
    """主测试函数。"""
    try:
        await test_mock_service()
        await test_entity_service()
        print("\n[SUCCESS] 所有测试通过！")
    except Exception as e:
        print(f"\n[ERROR] 测试失败: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())

