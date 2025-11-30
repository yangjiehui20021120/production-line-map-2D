"""测试API端点。"""

import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_health():
    """测试健康检查。"""
    print("1. 测试健康检查...")
    response = requests.get(f"{BASE_URL.replace('/api/v1', '')}/health")
    print(f"   状态码: {response.status_code}")
    print(f"   响应: {response.json()}")
    return response.status_code == 200

def test_ping():
    """测试ping端点。"""
    print("\n2. 测试ping端点...")
    response = requests.get(f"{BASE_URL}/ping")
    print(f"   状态码: {response.status_code}")
    print(f"   响应: {response.json()}")
    return response.status_code == 200

def test_query_entities():
    """测试实体查询。"""
    print("\n3. 测试实体查询...")
    # 查询TwinObject
    response = requests.get(
        f"{BASE_URL}/entities",
        params={"type": "TwinObject", "limit": 3}
    )
    print(f"   查询TwinObject - 状态码: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   返回 {data.get('count', 0)} 个实体")
    
    # 查询MBOM
    response = requests.get(
        f"{BASE_URL}/entities",
        params={"type": "MBOM", "limit": 2}
    )
    print(f"   查询MBOM - 状态码: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   返回 {data.get('count', 0)} 个实体")
    
    return response.status_code == 200

def test_get_entity():
    """测试获取单个实体。"""
    print("\n4. 测试获取单个实体...")
    entity_id = "urn:ngsi-ld:TwinObject:Station:ST-HJ"
    response = requests.get(f"{BASE_URL}/entities/{entity_id}")
    print(f"   状态码: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   实体ID: {data.get('data', {}).get('id', 'N/A')}")
    return response.status_code == 200

def test_kpi():
    """测试KPI端点。"""
    print("\n5. 测试KPI端点...")
    response = requests.get(f"{BASE_URL}/map/kpi")
    print(f"   状态码: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   返回 {len(data.get('data', []))} 个KPI指标")
    return response.status_code == 200

def test_realtime():
    """测试实时数据端点。"""
    print("\n6. 测试实时数据端点...")
    response = requests.get(f"{BASE_URL}/realtime/entities")
    print(f"   状态码: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   返回数据: {len(data.get('data', {}).get('equipment', []))} 个设备")
    return response.status_code == 200

def main():
    """主测试函数。"""
    print("=" * 60)
    print("API端点测试")
    print("=" * 60)
    print(f"测试地址: {BASE_URL}")
    print("\n注意: 请确保后端服务已启动 (uvicorn app.main:app --reload --port 8000)")
    print("=" * 60)
    
    try:
        results = []
        results.append(("健康检查", test_health()))
        results.append(("Ping", test_ping()))
        results.append(("实体查询", test_query_entities()))
        results.append(("获取实体", test_get_entity()))
        results.append(("KPI", test_kpi()))
        results.append(("实时数据", test_realtime()))
        
        print("\n" + "=" * 60)
        print("测试结果:")
        for name, result in results:
            status = "[PASS]" if result else "[FAIL]"
            print(f"  {status} {name}")
        
        all_passed = all(r[1] for r in results)
        if all_passed:
            print("\n[SUCCESS] 所有API测试通过！")
        else:
            print("\n[WARNING] 部分测试失败，请检查后端服务是否正常运行")
        
    except requests.exceptions.ConnectionError:
        print("\n[ERROR] 无法连接到后端服务")
        print("请确保后端服务已启动: uvicorn app.main:app --reload --port 8000")
    except Exception as e:
        print(f"\n[ERROR] 测试失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()

