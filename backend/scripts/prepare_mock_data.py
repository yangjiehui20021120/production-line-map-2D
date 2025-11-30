"""准备Mock数据的脚本。

从孪生建模目录复制和处理JSON数据文件到backend/data。
"""

import json
import os
import shutil
from pathlib import Path
from typing import Any, Dict, List

# 项目根目录
# 脚本在 backend/scripts/ 目录，所以需要向上两级到项目根
PROJECT_ROOT = Path(__file__).parent.parent.parent
SOURCE_DIR = PROJECT_ROOT / "孪生建模" / "孪生建模"
TARGET_DIR = Path(__file__).parent.parent / "data" / "entities"


def load_json_file(file_path: Path) -> Any:
    """加载JSON文件。"""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return None


def save_json_file(data: Any, file_path: Path) -> None:
    """保存JSON文件。"""
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Saved: {file_path}")
    except Exception as e:
        print(f"Error saving {file_path}: {e}")


def copy_twinobject_data():
    """复制TwinObject数据。"""
    source_dir = SOURCE_DIR / "twinObject实体建模" / "数字孪生体实体实例建模"
    target_dir = TARGET_DIR / "twinobject"
    
    # 复制单个文件
    files_to_copy = [
        ("orgunit_instances.json", "orgunit.json"),
        ("stations_instances.json", "stations.json"),
        ("positions_instances.json", "positions.json"),
        ("autoequipment_instances.json", "autoequipment.json"),
        ("person_instances.json", "person.json"),
    ]
    
    for source_name, target_name in files_to_copy:
        source_file = source_dir / source_name
        if source_file.exists():
            # 处理person_instances.json的特殊格式（有entities包装）
            if source_name == "person_instances.json":
                data = load_json_file(source_file)
                if data and isinstance(data, dict) and "entities" in data:
                    save_json_file(data["entities"], target_dir / target_name)
                else:
                    shutil.copy2(source_file, target_dir / target_name)
            else:
                shutil.copy2(source_file, target_dir / target_name)
            print(f"Copied: {source_name} -> {target_name}")
    
    # 复制products.json
    products_file = source_dir / "product-workpiece" / "products.json"
    if products_file.exists():
        shutil.copy2(products_file, target_dir / "products.json")
        print("Copied: products.json")


def merge_workpiece_files():
    """合并workpiece_chain文件。"""
    source_dir = SOURCE_DIR / "twinObject实体建模" / "数字孪生体实体实例建模" / "product-workpiece"
    target_file = TARGET_DIR / "twinobject" / "workpieces.json"
    
    all_workpieces: List[Dict[str, Any]] = []
    
    # 读取所有workpiece_chain文件
    for file_path in source_dir.glob("workpiece_chain_*.json"):
        data = load_json_file(file_path)
        if data and isinstance(data, list):
            all_workpieces.extend(data)
            print(f"Loaded {len(data)} workpieces from {file_path.name}")
    
    if all_workpieces:
        save_json_file(all_workpieces, target_file)
        print(f"Total workpieces merged: {len(all_workpieces)}")


def copy_mbom_data():
    """复制MBOM数据。"""
    source_dir = SOURCE_DIR / "MBOM实体建模" / "Mbom实体实例建模"
    target_dir = TARGET_DIR / "mbom"
    
    files_to_copy = [
        "mbom_M000004670327_entities.json",
        "mbom_M000004803474_entities.json",
    ]
    
    for file_name in files_to_copy:
        source_file = source_dir / file_name
        if source_file.exists():
            # 重命名为更简洁的名称
            target_name = file_name.replace("_entities", "")
            shutil.copy2(source_file, target_dir / target_name)
            print(f"Copied: {file_name} -> {target_name}")


def copy_scene_data():
    """复制Scene数据。"""
    source_dir = SOURCE_DIR / "scene实体建模" / "Scene实体实例建模"
    target_dir = TARGET_DIR / "scene"
    
    files_to_copy = [
        ("scenes_for_M670-SN001.json", "scenes_M670-SN001.json"),
        ("scenes_for_M803-SN001.json", "scenes_M803-SN001.json"),
    ]
    
    for source_name, target_name in files_to_copy:
        source_file = source_dir / source_name
        if source_file.exists():
            shutil.copy2(source_file, target_dir / target_name)
            print(f"Copied: {source_name} -> {target_name}")


def copy_modality_data():
    """复制Modality数据。"""
    source_file = SOURCE_DIR / "Modality实体建模" / "Modality实体实例建模" / "Modality_Instances_Complete.json"
    target_file = TARGET_DIR / "modality" / "modalities.json"
    
    if source_file.exists():
        data = load_json_file(source_file)
        if data and isinstance(data, dict) and "modalities" in data:
            # 提取modalities数组
            save_json_file(data["modalities"], target_file)
        else:
            shutil.copy2(source_file, target_file)
        print("Copied: Modality data")


def copy_modalitybinding_data():
    """复制ModalityBinding数据。"""
    source_file = SOURCE_DIR / "ModalityBinding实体" / "ModalityBinding实体实例建模" / "ModalityBinding_Instances.json"
    target_file = TARGET_DIR / "modalitybinding" / "modalitybindings.json"
    
    if source_file.exists():
        shutil.copy2(source_file, target_file)
        print("Copied: ModalityBinding data")


def sample_modaldata():
    """采样ModalData数据（避免加载72K行）。"""
    source_file = SOURCE_DIR / "ModalData实体建模" / "ModalData实体实例建模" / "modaldata_instances.json"
    target_file = TARGET_DIR / "modaldata" / "modaldata.json"
    
    if not source_file.exists():
        print(f"Source file not found: {source_file}")
        return
    
    print(f"Loading ModalData from {source_file}...")
    data = load_json_file(source_file)
    
    if data and isinstance(data, list):
        # 采样5000条数据
        sample_size = min(5000, len(data))
        sampled_data = data[:sample_size]
        save_json_file(sampled_data, target_file)
        print(f"Sampled {sample_size} ModalData records from {len(data)} total")
    else:
        print("Error: ModalData file format unexpected")


def copy_role_data():
    """复制Role数据。"""
    source_file = SOURCE_DIR / "Role实体建模" / "Role实体实例建模" / "roles_ngsi_ld.json"
    target_file = TARGET_DIR / "role" / "roles.json"
    
    if source_file.exists():
        shutil.copy2(source_file, target_file)
        print("Copied: Role data")


def create_assignment_data():
    """创建Assignment实例数据（基于Person和Role）。"""
    person_file = TARGET_DIR / "twinobject" / "person.json"
    role_file = TARGET_DIR / "role" / "roles.json"
    target_file = TARGET_DIR / "assignment" / "assignments.json"
    
    persons = load_json_file(person_file)
    roles = load_json_file(role_file)
    
    if not persons or not roles:
        print("Warning: Cannot create Assignment data - missing Person or Role data")
        return
    
    # 确保persons是列表
    if isinstance(persons, dict) and "entities" in persons:
        persons = persons["entities"]
    
    assignments: List[Dict[str, Any]] = []
    
    # 为每个Person创建一些Assignment
    from datetime import datetime, timedelta
    import random
    
    shift_types = ["EarlyShift", "LateShift", "NightShift"]
    statuses = ["Active", "Suspended", "Expired"]
    
    for i, person in enumerate(persons[:50]):  # 只为前50个person创建assignment
        person_id = person.get("id", "")
        if not person_id or "Person" not in person_id:
            continue
        
        # 为每个person创建1-3个assignment
        num_assignments = random.randint(1, 3)
        selected_roles = random.sample(roles, min(num_assignments, len(roles)))
        
        for role in selected_roles:
            role_id = role.get("id", "")
            if not role_id:
                continue
            
            # 生成时间范围
            base_date = datetime.now() - timedelta(days=random.randint(0, 30))
            valid_from = base_date.replace(hour=8, minute=0, second=0)
            valid_to = valid_from + timedelta(hours=8)
            
            # 生成assignment ID
            person_code = person_id.split(":")[-1] if ":" in person_id else f"Person{i}"
            role_code = role_id.split(":")[-1] if ":" in role_id else f"Role{random.randint(1, 10)}"
            shift = random.choice(shift_types)
            assignment_id = f"urn:ngsi-ld:Assignment:{person_code}:{role_code}:SideWallShop:{shift}"
            
            assignment = {
                "@context": [
                    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
                    "https://factory.example.com/context/assignment-context.jsonld"
                ],
                "id": assignment_id,
                "type": "Assignment",
                "assigneeId": {
                    "type": "Relationship",
                    "object": person_id
                },
                "roleId": {
                    "type": "Relationship",
                    "object": role_id
                },
                "orgId": {
                    "type": "Relationship",
                    "object": "urn:ngsi-ld:OrgUnit:SideWallShop"
                },
                "validFrom": {
                    "type": "Property",
                    "value": valid_from.strftime("%Y-%m-%dT%H:%M:%SZ")
                },
                "validTo": {
                    "type": "Property",
                    "value": valid_to.strftime("%Y-%m-%dT%H:%M:%SZ")
                },
                "shiftId": {
                    "type": "Property",
                    "value": shift
                },
                "assignmentStatus": {
                    "type": "Property",
                    "value": random.choice(statuses)
                },
                "notes": {
                    "type": "Property",
                    "value": f"Generated assignment for {person_code} as {role_code}"
                }
            }
            assignments.append(assignment)
    
    save_json_file(assignments, target_file)
    print(f"Created {len(assignments)} Assignment records")


def main():
    """主函数。"""
    print("Preparing mock data...")
    print(f"Source: {SOURCE_DIR}")
    print(f"Target: {TARGET_DIR}")
    
    # 确保目标目录存在
    TARGET_DIR.mkdir(parents=True, exist_ok=True)
    for subdir in ["twinobject", "mbom", "scene", "modality", "modalitybinding", "modaldata", "role", "assignment"]:
        (TARGET_DIR / subdir).mkdir(parents=True, exist_ok=True)
    
    # 执行复制和处理
    copy_twinobject_data()
    merge_workpiece_files()
    copy_mbom_data()
    copy_scene_data()
    copy_modality_data()
    copy_modalitybinding_data()
    sample_modaldata()
    copy_role_data()
    create_assignment_data()
    
    print("\nMock data preparation completed!")


if __name__ == "__main__":
    main()

