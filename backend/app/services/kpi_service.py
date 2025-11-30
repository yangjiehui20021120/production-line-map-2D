"""KPI service for calculating production line KPIs."""

from __future__ import annotations

from datetime import datetime, timezone

from shared.types.ngsi import KPIItem, KPIResponse, KPIThreshold
from app.services.mock_realtime_service import (
    STATION_DATA,
    EQUIPMENT_DATA,
    WORKPIECE_DATA,
)


def calculate_flow_daily_output() -> KPIItem:
    """Calculate daily output based on completed workpieces."""
    # 基于在制品数量和完成率估算日产量
    total_workpieces = len(WORKPIECE_DATA)
    completed_count = sum(1 for w in WORKPIECE_DATA if w.get("status") == "Completed")
    in_process_count = sum(1 for w in WORKPIECE_DATA if w.get("status") == "InProcess")
    
    # 估算：假设平均完成时间，计算日产量
    # 简化计算：基于在制品进度和工位产能
    avg_progress = sum(
        w.get("attributes", {}).get("progress", 0.0) for w in WORKPIECE_DATA
    ) / max(len(WORKPIECE_DATA), 1)
    
    # 基于工位数量和产能估算
    total_capacity = sum(
        s.get("attributes", {}).get("capacity", 10) for s in STATION_DATA
    )
    estimated_daily = int(total_capacity * 0.7 * avg_progress * 1.2)
    
    value = max(15, min(30, estimated_daily))
    target = 24
    threshold = KPIThreshold(green=20, yellow=15)
    
    if value >= threshold.green:
        status = "green"
    elif value >= threshold.yellow:
        status = "yellow"
    else:
        status = "red"
    
    # 简化趋势判断
    trend = "up" if value >= 20 else "down"
    
    return KPIItem(
        id="Flow_DailyOutput",
        name="Flow产量",
        value=float(value),
        unit="件/天",
        target=float(target),
        threshold=threshold,
        status=status,
        trend=trend,
        observedAt=datetime.now(timezone.utc).isoformat(),
    )


def calculate_plt_info_rate() -> KPIItem:
    """Calculate PLT (Production Lead Time) information rate."""
    # 基于在制品的队列时间和处理时间计算信息率
    total_queue_time = sum(
        w.get("attributes", {}).get("queueTime", 0) for w in WORKPIECE_DATA
    )
    total_workpieces = len(WORKPIECE_DATA)
    
    if total_workpieces == 0:
        value = 0.0
    else:
        avg_queue_time = total_queue_time / total_workpieces
        # 信息率：基于队列时间占比，假设标准时间为基准
        # 简化：信息率 = 100 - (队列时间占比 * 100)
        info_rate = max(0, min(100, 100 - (avg_queue_time / 600) * 10))
        value = round(info_rate, 1)
    
    target = 90.0
    threshold = KPIThreshold(green=80.0, yellow=60.0)
    
    if value >= threshold.green:
        status = "green"
    elif value >= threshold.yellow:
        status = "yellow"
    else:
        status = "red"
    
    trend = "stable" if 70 <= value <= 80 else ("up" if value > 75 else "down")
    
    return KPIItem(
        id="PLT_InfoRate",
        name="PLT信息率",
        value=value,
        unit="%",
        target=target,
        threshold=threshold,
        status=status,
        trend=trend,
        observedAt=datetime.now(timezone.utc).isoformat(),
    )


def calculate_wip_count() -> KPIItem:
    """Calculate Work In Process count."""
    # 统计所有在制品数量
    wip_count = len(WORKPIECE_DATA)
    # 加上工位的在制品数量
    station_wip = sum(s.get("wipCount", 0) for s in STATION_DATA)
    total_wip = wip_count + station_wip
    
    value = float(total_wip)
    target = 60.0
    threshold = KPIThreshold(green=40.0, yellow=55.0)
    
    if value <= threshold.green:
        status = "green"
    elif value <= threshold.yellow:
        status = "yellow"
    else:
        status = "red"
    
    trend = "down" if value < 55 else ("up" if value > 60 else "stable")
    
    return KPIItem(
        id="WIP_Count",
        name="WIP在制数",
        value=value,
        unit="件",
        target=target,
        threshold=threshold,
        status=status,
        trend=trend,
        observedAt=datetime.now(timezone.utc).isoformat(),
    )


def calculate_quality_fpy() -> KPIItem:
    """Calculate First Pass Yield (FPY) quality metric."""
    # 基于设备的不良率计算FPY
    total_defect_rate = sum(
        e.get("attributes", {}).get("recentDefectRate24h", 0.0) for e in EQUIPMENT_DATA
    )
    equipment_count = len(EQUIPMENT_DATA)
    
    if equipment_count == 0:
        avg_defect_rate = 0.0
    else:
        avg_defect_rate = total_defect_rate / equipment_count
    
    # FPY = 100 - 平均不良率
    fpy = max(0, min(100, 100 - avg_defect_rate * 2))
    value = round(fpy, 1)
    
    target = 92.0
    threshold = KPIThreshold(green=90.0, yellow=85.0)
    
    if value >= threshold.green:
        status = "green"
    elif value >= threshold.yellow:
        status = "yellow"
    else:
        status = "red"
    
    trend = "down" if value < 88 else ("up" if value > 90 else "stable")
    
    return KPIItem(
        id="Quality_FPY",
        name="Quality FPY",
        value=value,
        unit="%",
        target=target,
        threshold=threshold,
        status=status,
        trend=trend,
        observedAt=datetime.now(timezone.utc).isoformat(),
    )


def calculate_cost_oee() -> KPIItem:
    """Calculate Overall Equipment Effectiveness (OEE)."""
    # 计算所有设备的平均OEE
    total_oee = sum(
        e.get("attributes", {}).get("oee", 0.0) for e in EQUIPMENT_DATA
    )
    equipment_count = len(EQUIPMENT_DATA)
    
    if equipment_count == 0:
        avg_oee = 0.0
    else:
        avg_oee = total_oee / equipment_count
    
    # 转换为百分比
    value = round(avg_oee, 1)
    
    target = 85.0
    threshold = KPIThreshold(green=85.0, yellow=75.0)
    
    if value >= threshold.green:
        status = "green"
    elif value >= threshold.yellow:
        status = "yellow"
    else:
        status = "red"
    
    trend = "up" if value > 80 else ("down" if value < 75 else "stable")
    
    return KPIItem(
        id="Cost_OEE",
        name="Cost OEE",
        value=value,
        unit="%",
        target=target,
        threshold=threshold,
        status=status,
        trend=trend,
        observedAt=datetime.now(timezone.utc).isoformat(),
    )


def calculate_flexibility_otd() -> KPIItem:
    """Calculate On-Time Delivery (OTD) flexibility metric."""
    # 基于在制品的延迟情况计算OTD
    delayed_count = sum(
        1 for w in WORKPIECE_DATA if w.get("status") == "Delayed"
    )
    total_workpieces = len(WORKPIECE_DATA)
    
    if total_workpieces == 0:
        otd = 100.0
    else:
        on_time_rate = (total_workpieces - delayed_count) / total_workpieces
        otd = on_time_rate * 100
    
    value = round(otd, 1)
    target = 95.0
    threshold = KPIThreshold(green=95.0, yellow=90.0)
    
    if value >= threshold.green:
        status = "green"
    elif value >= threshold.yellow:
        status = "yellow"
    else:
        status = "red"
    
    trend = "up" if value > 92 else ("down" if value < 90 else "stable")
    
    return KPIItem(
        id="Flexibility_OTD",
        name="Flexibility OTD",
        value=value,
        unit="%",
        target=target,
        threshold=threshold,
        status=status,
        trend=trend,
        observedAt=datetime.now(timezone.utc).isoformat(),
    )


def get_kpi_summary() -> KPIResponse:
    """Return all KPI metrics."""
    kpis = [
        calculate_flow_daily_output(),
        calculate_plt_info_rate(),
        calculate_wip_count(),
        calculate_quality_fpy(),
        calculate_cost_oee(),
        calculate_flexibility_otd(),
    ]
    
    return KPIResponse(
        success=True,
        data=kpis,
        lastUpdated=datetime.now(timezone.utc).isoformat(),
    )


