"""实体查询API路由。"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.models.requests import EntityQueryRequest
from app.models.responses import EntityListResponse, EntityDetailResponse
from app.services.entity_service import get_entity_service
from app.utils.validation import validate_entity_id, ValidationError, validate_entity_type

router = APIRouter(prefix="/entities", tags=["entities"])


@router.get("")
async def query_entities(
    entityType: str = Query(..., alias="type", description="实体类型（TwinObject, MBOM, Scene等）"),
    q: str | None = Query(None, description="NGSI-LD查询字符串"),
    limit: int = Query(20, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    options: str | None = Query(None, description="查询选项（keyValues, count等）"),
) -> EntityListResponse:
    """查询实体列表。

    Args:
        entityType: 实体类型（必需）
        q: NGSI-LD查询字符串
        limit: 返回结果数量限制
        offset: 分页偏移量
        options: 查询选项

    Returns:
        实体列表响应
    """
    try:
        if not validate_entity_type(entityType):
            raise HTTPException(status_code=400, detail=f"Invalid entity type: {entityType}")
        
        request = EntityQueryRequest(
            entityType=entityType,  # 使用entityType作为参数名（对应alias）
            q=q,
            limit=limit,
            offset=offset,
            options=options,
        )
        entity_service = get_entity_service()
        entities = await entity_service.query_entities(request)
        if entities is None:
            entities = []
        return EntityListResponse(
            success=True,
            data=entities,
            count=len(entities),
        )
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except NotImplementedError:
        raise HTTPException(
            status_code=501,
            detail="Entity query service not implemented yet (NGSI-LD client pending)",
        )


@router.get("/{entity_id}")
async def get_entity(entity_id: str) -> EntityDetailResponse:
    """获取单个实体。

    Args:
        entity_id: 实体ID（URN格式）

    Returns:
        实体详情响应
    """
    try:
        validate_entity_id(entity_id)
        entity_service = get_entity_service()
        entity = await entity_service.get_entity(entity_id)
        return EntityDetailResponse(success=True, data=entity)
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except NotImplementedError:
        raise HTTPException(
            status_code=501,
            detail="Entity query service not implemented yet (NGSI-LD client pending)",
        )


@router.get("/{entity_id}/relationships")
async def get_entity_relationships(entity_id: str) -> EntityListResponse:
    """获取实体关系。

    Args:
        entity_id: 实体ID（URN格式）

    Returns:
        关系列表响应
    """
    try:
        validate_entity_id(entity_id)
        entity_service = get_entity_service()
        relationships = await entity_service.get_entity_relationships(entity_id)
        return EntityListResponse(
            success=True,
            data=relationships,
            count=len(relationships),
        )
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except NotImplementedError:
        raise HTTPException(
            status_code=501,
            detail="Entity query service not implemented yet (NGSI-LD client pending)",
        )

