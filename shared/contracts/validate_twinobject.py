#!/usr/bin/env python3
"""
TwinObject实体契约验证工具

功能:
- 验证TwinObject实体是否符合契约规范
- 检查必填字段、数据类型、枚举值
- 验证关系完整性
- 检测循环引用
- 生成验证报告

使用方式:
    python validate_twinobject.py --file data/autoequipment_instances.json
    python validate_twinobject.py --dir data/ --report report.html
"""

import json
import re
import argparse
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


# ============================================================================
# 契约定义
# ============================================================================

class SubType(Enum):
    """TwinObject子类型枚举"""
    ORG_UNIT = "OrgUnit"
    STATION = "Station"
    POSITION = "Position"
    AUTO_EQUIPMENT = "AutoEquipment"
    TRANSPORT_EQUIPMENT = "TransportEquipment"
    QC_TOOL = "QCTool"
    PERSON = "Person"
    MATERIAL = "Material"
    PRODUCT = "Product"
    WORKPIECE = "Workpiece"


class TwinType(Enum):
    """TwinObject顶层类型枚举"""
    CONSTITUENT = "Constituent"
    TRANSITIONAL = "Transitional"


# 契约:subType与twinType的映射约束
SUBTYPE_TWINTYPE_MAPPING = {
    SubType.ORG_UNIT: TwinType.CONSTITUENT,
    SubType.STATION: TwinType.CONSTITUENT,
    SubType.POSITION: TwinType.CONSTITUENT,
    SubType.AUTO_EQUIPMENT: TwinType.CONSTITUENT,
    SubType.TRANSPORT_EQUIPMENT: TwinType.CONSTITUENT,
    SubType.QC_TOOL: TwinType.CONSTITUENT,
    SubType.PERSON: TwinType.CONSTITUENT,
    SubType.MATERIAL: TwinType.CONSTITUENT,
    SubType.PRODUCT: TwinType.TRANSITIONAL,
    SubType.WORKPIECE: TwinType.TRANSITIONAL,
}


# 契约:各子类型的必填特有字段
SUBTYPE_REQUIRED_FIELDS = {
    SubType.ORG_UNIT: ["orgUnitType", "orgLevel"],
    SubType.STATION: ["stationCategory"],
    SubType.POSITION: ["belongsToStation"],
    SubType.AUTO_EQUIPMENT: ["equipmentType"],
    SubType.PERSON: ["employeeId"],
    SubType.PRODUCT: ["productCode"],
    SubType.WORKPIECE: ["workpieceCode", "productType"],
}


# 契约:枚举值定义
ENUM_VALUES = {
    "orgUnitType": ["Factory", "Workshop", "ProductionLine", "Team", "Department", "Division"],
    "orgStatus": ["Active", "Inactive", "Restructuring"],
    "stationCategory": ["ProductionStation", "InspectionStation", "AssemblyStation", "BufferZone", "HandlingStation"],
    "positionType": ["WorkTable", "LoadingPoint", "UnloadingPoint", "InspectionPoint", "FixturePoint", "BufferPoint", "HandoverPoint"],
    "equipmentType": ["WeldingRobot", "Welder", "Positioner", "CNC", "PressMachine", "Laser", "Other"],
    "transportType": ["Crane", "AGV", "RGV", "Conveyor", "Hoist", "Forklift", "Shuttle", "Other"],
    "shiftSchedule": ["TwoShift", "ThreeShift", "Fixed"],
    "currentStatus": ["InProduction", "QualityCheck", "Completed", "Scrapped"],
}


# ============================================================================
# 验证结果数据结构
# ============================================================================

@dataclass
class ValidationError:
    """验证错误"""
    entity_id: str
    error_type: str
    field: Optional[str]
    message: str
    severity: str  # "error" or "warning"


@dataclass
class ValidationResult:
    """验证结果"""
    total_count: int
    valid_count: int
    invalid_count: int
    errors: List[ValidationError]
    
    @property
    def is_valid(self) -> bool:
        return self.invalid_count == 0
    
    @property
    def success_rate(self) -> float:
        if self.total_count == 0:
            return 0.0
        return (self.valid_count / self.total_count) * 100


# ============================================================================
# 契约验证器
# ============================================================================

class TwinObjectValidator:
    """TwinObject实体契约验证器"""
    
    def __init__(self, entity_registry: Optional[Dict[str, Any]] = None):
        """
        初始化验证器
        
        Args:
            entity_registry: 实体注册表,用于关系完整性检查 {entity_id: entity_data}
        """
        self.entity_registry = entity_registry or {}
        self.errors: List[ValidationError] = []
    
    def validate(self, entities: List[Dict[str, Any]]) -> ValidationResult:
        """
        验证一批TwinObject实体
        
        Args:
            entities: 实体列表
            
        Returns:
            ValidationResult: 验证结果
        """
        self.errors = []
        valid_count = 0
        
        for entity in entities:
            entity_id = entity.get("id", "UNKNOWN")
            
            # 验证基础字段
            if not self._validate_base_fields(entity):
                continue
            
            # 验证子类型特定字段
            if not self._validate_subtype_fields(entity):
                continue
            
            # 验证枚举值
            if not self._validate_enum_values(entity):
                continue
            
            # 验证关系引用
            if not self._validate_relationships(entity):
                continue
            
            # 验证业务规则
            if not self._validate_business_rules(entity):
                continue
            
            valid_count += 1
        
        return ValidationResult(
            total_count=len(entities),
            valid_count=valid_count,
            invalid_count=len(entities) - valid_count,
            errors=self.errors
        )
    
    def _validate_base_fields(self, entity: Dict[str, Any]) -> bool:
        """验证基础必填字段"""
        entity_id = entity.get("id", "UNKNOWN")
        is_valid = True
        
        # 检查必填字段
        required_fields = ["id", "type", "@context", "subType", "twinType", "functionCategory"]
        for field in required_fields:
            if field not in entity:
                self.errors.append(ValidationError(
                    entity_id=entity_id,
                    error_type="MissingRequiredField",
                    field=field,
                    message=f"缺少必填字段: {field}",
                    severity="error"
                ))
                is_valid = False
        
        # 验证id格式
        if "id" in entity:
            id_pattern = r"^urn:ngsi-ld:(TwinObject:[A-Za-z]+:[A-Za-z0-9_-]+|Workpiece:[A-Za-z0-9_-]+)$"
            if not re.match(id_pattern, entity["id"]):
                self.errors.append(ValidationError(
                    entity_id=entity_id,
                    error_type="InvalidURN",
                    field="id",
                    message=f"URN格式不正确: {entity['id']}",
                    severity="error"
                ))
                is_valid = False
        
        # 验证type固定值
        if entity.get("type") != "TwinObject":
            self.errors.append(ValidationError(
                entity_id=entity_id,
                error_type="InvalidType",
                field="type",
                message=f"type字段必须为'TwinObject',实际值: {entity.get('type')}",
                severity="error"
            ))
            is_valid = False
        
        # 验证subType枚举值
        if "subType" in entity:
            subtype_value = entity["subType"].get("value")
            valid_subtypes = [st.value for st in SubType]
            if subtype_value not in valid_subtypes:
                self.errors.append(ValidationError(
                    entity_id=entity_id,
                    error_type="InvalidEnum",
                    field="subType",
                    message=f"subType值'{subtype_value}'不在枚举值中: {valid_subtypes}",
                    severity="error"
                ))
                is_valid = False
        
        # 验证twinType枚举值
        if "twinType" in entity:
            twintype_value = entity["twinType"].get("value")
            valid_twintypes = [tt.value for tt in TwinType]
            if twintype_value not in valid_twintypes:
                self.errors.append(ValidationError(
                    entity_id=entity_id,
                    error_type="InvalidEnum",
                    field="twinType",
                    message=f"twinType值'{twintype_value}'不在枚举值中: {valid_twintypes}",
                    severity="error"
                ))
                is_valid = False
        
        # 验证functionCategory格式
        if "functionCategory" in entity:
            fc_value = entity["functionCategory"].get("value")
            fc_pattern = r"^F[12](\.[A-Za-z0-9]+)*$"
            if not re.match(fc_pattern, fc_value):
                self.errors.append(ValidationError(
                    entity_id=entity_id,
                    error_type="InvalidFormat",
                    field="functionCategory",
                    message=f"functionCategory格式不正确: {fc_value}, 应匹配: {fc_pattern}",
                    severity="error"
                ))
                is_valid = False
        
        return is_valid
    
    def _validate_subtype_fields(self, entity: Dict[str, Any]) -> bool:
        """验证子类型特有字段"""
        entity_id = entity.get("id", "UNKNOWN")
        is_valid = True
        
        subtype_value = entity.get("subType", {}).get("value")
        if not subtype_value:
            return is_valid
        
        try:
            subtype = SubType(subtype_value)
        except ValueError:
            return is_valid  # 已在base验证中报错
        
        # 检查子类型必填字段
        required_fields = SUBTYPE_REQUIRED_FIELDS.get(subtype, [])
        for field in required_fields:
            if field not in entity:
                self.errors.append(ValidationError(
                    entity_id=entity_id,
                    error_type="MissingRequiredField",
                    field=field,
                    message=f"{subtype_value}类型缺少必填字段: {field}",
                    severity="error"
                ))
                is_valid = False
        
        # 验证subType与twinType的映射关系
        expected_twintype = SUBTYPE_TWINTYPE_MAPPING.get(subtype)
        actual_twintype_value = entity.get("twinType", {}).get("value")
        if expected_twintype and actual_twintype_value != expected_twintype.value:
            self.errors.append(ValidationError(
                entity_id=entity_id,
                error_type="InvalidMapping",
                field="twinType",
                message=f"{subtype_value}的twinType应为'{expected_twintype.value}',实际为'{actual_twintype_value}'",
                severity="error"
            ))
            is_valid = False
        
        return is_valid
    
    def _validate_enum_values(self, entity: Dict[str, Any]) -> bool:
        """验证枚举值字段"""
        entity_id = entity.get("id", "UNKNOWN")
        is_valid = True
        
        for field, allowed_values in ENUM_VALUES.items():
            if field in entity:
                actual_value = entity[field].get("value")
                if actual_value not in allowed_values:
                    self.errors.append(ValidationError(
                        entity_id=entity_id,
                        error_type="InvalidEnum",
                        field=field,
                        message=f"{field}值'{actual_value}'不在枚举值中: {allowed_values}",
                        severity="error"
                    ))
                    is_valid = False
        
        return is_valid
    
    def _validate_relationships(self, entity: Dict[str, Any]) -> bool:
        """验证关系引用的完整性"""
        entity_id = entity.get("id", "UNKNOWN")
        is_valid = True
        
        # 如果没有提供实体注册表,跳过关系验证
        if not self.entity_registry:
            return is_valid
        
        # 检查所有Relationship字段
        for field, value in entity.items():
            if isinstance(value, dict) and value.get("type") == "Relationship":
                target_urn = value.get("object")
                if target_urn and target_urn not in self.entity_registry:
                    self.errors.append(ValidationError(
                        entity_id=entity_id,
                        error_type="BrokenReference",
                        field=field,
                        message=f"关系引用的实体不存在: {target_urn}",
                        severity="warning"  # 可能是数据未完全加载,降级为警告
                    ))
                    is_valid = False
            
            # 检查Relationship数组
            elif isinstance(value, list):
                for item in value:
                    if isinstance(item, dict) and item.get("type") == "Relationship":
                        target_urn = item.get("object")
                        if target_urn and target_urn not in self.entity_registry:
                            self.errors.append(ValidationError(
                                entity_id=entity_id,
                                error_type="BrokenReference",
                                field=field,
                                message=f"关系引用的实体不存在: {target_urn}",
                                severity="warning"
                            ))
                            is_valid = False
        
        return is_valid
    
    def _validate_business_rules(self, entity: Dict[str, Any]) -> bool:
        """验证业务规则"""
        entity_id = entity.get("id", "UNKNOWN")
        is_valid = True
        
        subtype_value = entity.get("subType", {}).get("value")
        
        # 规则1: OrgUnit的orgLevel约束
        if subtype_value == "OrgUnit" and "orgLevel" in entity:
            org_level = entity["orgLevel"].get("value")
            if org_level < 1:
                self.errors.append(ValidationError(
                    entity_id=entity_id,
                    error_type="BusinessRuleViolation",
                    field="orgLevel",
                    message=f"orgLevel必须>= 1,实际值: {org_level}",
                    severity="error"
                ))
                is_valid = False
        
        # 规则2: Station的capacityWip约束
        if subtype_value == "Station" and "capacityWip" in entity:
            capacity = entity["capacityWip"].get("value")
            if capacity < 0:
                self.errors.append(ValidationError(
                    entity_id=entity_id,
                    error_type="BusinessRuleViolation",
                    field="capacityWip",
                    message=f"capacityWip必须>= 0,实际值: {capacity}",
                    severity="error"
                ))
                is_valid = False
        
        # 规则3: Person的skills格式
        if subtype_value == "Person" and "skills" in entity:
            skills = entity["skills"].get("value", [])
            for skill in skills:
                if not skill.startswith("Skill."):
                    self.errors.append(ValidationError(
                        entity_id=entity_id,
                        error_type="BusinessRuleViolation",
                        field="skills",
                        message=f"技能标签'{skill}'必须以'Skill.'开头",
                        severity="error"
                    ))
                    is_valid = False
                elif len(skill.split(".")) < 2:
                    self.errors.append(ValidationError(
                        entity_id=entity_id,
                        error_type="BusinessRuleViolation",
                        field="skills",
                        message=f"技能标签'{skill}'格式错误,应为'Skill.{{Category}}.{{Name}}'",
                        severity="error"
                    ))
                    is_valid = False
        
        # 规则4: Person的employeeId格式
        if subtype_value == "Person" and "employeeId" in entity:
            employee_id = entity["employeeId"].get("value")
            if not re.match(r"^EMP-[0-9]{8,}$", employee_id):
                self.errors.append(ValidationError(
                    entity_id=entity_id,
                    error_type="BusinessRuleViolation",
                    field="employeeId",
                    message=f"employeeId格式错误: {employee_id}, 应匹配: EMP-[0-9]{{8,}}",
                    severity="error"
                ))
                is_valid = False
        
        return is_valid


# ============================================================================
# 循环引用检测器
# ============================================================================

class CircularReferenceDetector:
    """循环引用检测器"""
    
    def __init__(self, entities: List[Dict[str, Any]]):
        self.entities = {e["id"]: e for e in entities if "id" in e}
    
    def detect_circular_references(self, relationship_field: str = "parentOrg") -> List[ValidationError]:
        """
        检测指定关系字段的循环引用
        
        Args:
            relationship_field: 关系字段名(如"parentOrg")
            
        Returns:
            List[ValidationError]: 检测到的循环引用错误列表
        """
        errors = []
        
        for entity_id, entity in self.entities.items():
            if relationship_field in entity:
                visited = set()
                current = entity_id
                
                while current:
                    if current in visited:
                        # 检测到循环
                        errors.append(ValidationError(
                            entity_id=entity_id,
                            error_type="CircularReference",
                            field=relationship_field,
                            message=f"检测到循环引用: {' → '.join(list(visited) + [current])}",
                            severity="error"
                        ))
                        break
                    
                    visited.add(current)
                    current_entity = self.entities.get(current)
                    if not current_entity or relationship_field not in current_entity:
                        break
                    
                    current = current_entity[relationship_field].get("object")
        
        return errors


# ============================================================================
# 报告生成器
# ============================================================================

class ReportGenerator:
    """验证报告生成器"""
    
    @staticmethod
    def generate_text_report(result: ValidationResult, output_file: Optional[Path] = None) -> str:
        """生成文本格式报告"""
        lines = []
        lines.append("=" * 80)
        lines.append("TwinObject实体契约验证报告")
        lines.append("=" * 80)
        lines.append(f"总实例数: {result.total_count}")
        lines.append(f"验证通过: {result.valid_count} ({result.success_rate:.1f}%)")
        lines.append(f"验证失败: {result.invalid_count}")
        lines.append("")
        
        if result.errors:
            lines.append("-" * 80)
            lines.append("错误详情")
            lines.append("-" * 80)
            
            # 按entity_id分组
            errors_by_entity = {}
            for error in result.errors:
                if error.entity_id not in errors_by_entity:
                    errors_by_entity[error.entity_id] = []
                errors_by_entity[error.entity_id].append(error)
            
            for entity_id, errors in errors_by_entity.items():
                lines.append(f"\n实体: {entity_id}")
                for error in errors:
                    lines.append(f"  [{error.severity.upper()}] {error.error_type}")
                    if error.field:
                        lines.append(f"    字段: {error.field}")
                    lines.append(f"    {error.message}")
        
        report = "\n".join(lines)
        
        if output_file:
            output_file.write_text(report, encoding="utf-8")
            print(f"报告已保存: {output_file}")
        
        return report


# ============================================================================
# 主程序
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description="TwinObject实体契约验证工具")
    parser.add_argument("--file", type=str, help="要验证的JSON文件路径")
    parser.add_argument("--dir", type=str, help="要验证的目录路径(批量验证)")
    parser.add_argument("--report", type=str, help="输出报告文件路径")
    parser.add_argument("--strict", action="store_true", help="严格模式(警告也视为失败)")
    parser.add_argument("--check-circular", action="store_true", help="检查循环引用")
    
    args = parser.parse_args()
    
    # 加载实体数据
    entities = []
    
    if args.file:
        file_path = Path(args.file)
        if not file_path.exists():
            print(f"错误: 文件不存在: {file_path}")
            return 1
        
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                entities = data
            else:
                entities = [data]
    
    elif args.dir:
        dir_path = Path(args.dir)
        if not dir_path.exists():
            print(f"错误: 目录不存在: {dir_path}")
            return 1
        
        for json_file in dir_path.glob("**/*.json"):
            with open(json_file, "r", encoding="utf-8") as f:
                try:
                    data = json.load(f)
                    if isinstance(data, list):
                        entities.extend(data)
                    else:
                        entities.append(data)
                except json.JSONDecodeError:
                    print(f"警告: 跳过无效JSON文件: {json_file}")
    
    else:
        parser.print_help()
        return 1
    
    print(f"加载了 {len(entities)} 个实体")
    
    # 构建实体注册表(用于关系验证)
    entity_registry = {e["id"]: e for e in entities if "id" in e}
    
    # 执行验证
    validator = TwinObjectValidator(entity_registry)
    result = validator.validate(entities)
    
    # 检查循环引用
    if args.check_circular:
        detector = CircularReferenceDetector(entities)
        circular_errors = detector.detect_circular_references("parentOrg")
        result.errors.extend(circular_errors)
        if circular_errors:
            result.invalid_count += len(circular_errors)
            result.valid_count -= len(circular_errors)
    
    # 生成报告
    output_file = Path(args.report) if args.report else None
    report = ReportGenerator.generate_text_report(result, output_file)
    
    if not args.report:
        print(report)
    
    # 返回退出码
    if args.strict:
        return 0 if result.is_valid and not result.errors else 1
    else:
        error_count = sum(1 for e in result.errors if e.severity == "error")
        return 0 if error_count == 0 else 1


if __name__ == "__main__":
    exit(main())
