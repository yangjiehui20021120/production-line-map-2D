# Shared Types

- `ngsi.ts`: 通用 NGSI-LD Property/Relationship/Geometry 定义
- `twinobject.ts`: TwinObject 及其子类型的 TypeScript 接口
- `mbom.ts`: MBOMRoot/Route/Takt/Process/Step 契约类型
- `scene.ts`: Scene 实体(时间框架/stepLog/异常等)类型
- `modality.ts`: Modality 与 ModalityBinding 类型
- `modalData.ts`: ModalData(三锚点、质量标签)类型
- `roleAssignment.ts`: Role 与 Assignment 契约类型
- `ngsi.py`: Pydantic 模型, 可供 FastAPI/测试场景引用

> 当契约扩展(ModalData、Scene、Assignment 等)时, 请在此目录继续补充, 并保持与 `doc/phase1_contract_summary.md` 一致。

