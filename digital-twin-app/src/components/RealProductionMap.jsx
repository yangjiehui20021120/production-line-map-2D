import React, { useState, useEffect, useRef } from 'react';

// ============= 设计系统令牌 (严格遵循专题九规范) =============
const DESIGN_TOKENS = {
  colors: {
    normal: '#10b981',      // 绿色 - 正常/达标
    warning: '#f59e0b',     // 黄色 - 预警/接近阈值  
    error: '#ef4444',       // 红色 - 异常/超标
    neutral: '#6b7280',     // 灰色 - 无数据/延迟
    primary: '#3b82f6',     // 蓝色 - 主色调
    dark: '#1f2937',        // 深色 - 文字
    light: '#f3f4f6',       // 浅色 - 背景
    white: '#ffffff',
    // 物流路径专用色
    mainFlow: '#8b5cf6',    // 紫色 - 主物流
    waterSpider: '#06b6d4', // 青色 - 水蜘蛛路线
    rework: '#dc2626',      // 红色 - 返工路径
    agv: '#0ea5e9',         // 蓝色 - AGV路径
    buffer: '#fbbf24'       // 黄色 - 缓冲区
  },
  animation: {
    refreshInterval: 3000,   // 数据刷新间隔(ms)
    andonFlashRate: 500,    // 安灯闪烁频率(ms)
    materialFlowSpeed: 2000  // 物料流动动画速度(ms)
  }
};

// ============= 基于真实产线的数据生成 =============
const generateRealProductionData = () => {
  const currentTime = new Date();
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);
  
  // 基于SVG产线布局图的精确坐标映射
  const workstations = [
    // ===== 上排 - 组焊工序区 =====
    // 第一排（上）
    { id: 'ST-GZ-02', name: '组焊台位2', x: 60, y: 80, type: 'process', processGroup: '组焊工序区', stdCT: 120 },
    { id: 'ST-GZ-04', name: '组焊台位4', x: 140, y: 80, type: 'process', processGroup: '组焊工序区', stdCT: 120 },
    { id: 'ST-GZ-06', name: '组焊台位6', x: 220, y: 80, type: 'process', processGroup: '组焊工序区', stdCT: 60 },
    { id: 'ST-RW-02', name: '圆顶焊接台位2', x: 300, y: 80, type: 'process', processGroup: '组焊工序区', stdCT: null },
    
    // 第二排（下）
    { id: 'ST-GZ-01', name: '组焊台位1', x: 60, y: 130, type: 'process', processGroup: '组焊工序区', stdCT: 120 },
    { id: 'ST-GZ-03', name: '组焊台位3', x: 140, y: 130, type: 'process', processGroup: '组焊工序区', stdCT: 60 },
    { id: 'ST-RW-01', name: '圆顶焊接台位1', x: 220, y: 130, type: 'process', processGroup: '组焊工序区', stdCT: null },
    { id: 'ST-GZ-05', name: '组焊台位5', x: 300, y: 130, type: 'process', processGroup: '组焊工序区', stdCT: 60 },
    
    // ===== 上排 - 调修工序区 =====
    { id: 'ST-TX-03', name: '侧墙调修台位3', x: 420, y: 80, type: 'process', processGroup: '调修工序区', stdCT: null },
    { id: 'ST-TX-02', name: '侧墙调修台位2', x: 420, y: 105, type: 'process', processGroup: '调修工序区', stdCT: null },
    { id: 'ST-TX-01', name: '侧墙调修台位1', x: 420, y: 130, type: 'process', processGroup: '调修工序区', stdCT: null },
    
    // ===== 上排 - 加工工序区 =====
    { id: 'ST-JG-03', name: '侧墙加工台位3', x: 520, y: 80, type: 'process', processGroup: '加工工序区', stdCT: 420 },
    { id: 'ST-JG-04', name: '侧墙加工台位4', x: 600, y: 80, type: 'process', processGroup: '加工工序区', stdCT: 420 },
    
    // ===== 上排 - 大线打磨工序区 =====
    { id: 'ST-DM-02', name: '大线自动打磨台位2', x: 720, y: 80, type: 'process', processGroup: '大线打磨工序区', stdCT: 120 },
    { id: 'ST-DM-01', name: '大线自动打磨台位1', x: 720, y: 130, type: 'process', processGroup: '大线打磨工序区', stdCT: 120 },
    
      // ===== 缓存区 =====
    { id: 'BF-01', name: '物料定置区1', x: 80, y: 200, type: 'buffer', processGroup: '缓存区', stdCT: null },
    { id: 'BF-02', name: '物料定置区2', x: 160, y: 200, type: 'buffer', processGroup: '缓存区', stdCT: null },
    { id: 'BF-03', name: '物料定置区3', x: 240, y: 200, type: 'buffer', processGroup: '缓存区', stdCT: null },
    { id: 'BF-04', name: '物料定置区4', x: 320, y: 200, type: 'buffer', processGroup: '缓存区', stdCT: null },
    { id: 'BF-05', name: '物料定置区5', x: 480, y: 200, type: 'buffer', processGroup: '缓存区', stdCT: null },
    { id: 'BF-06', name: '物料定置区6', x: 560, y: 200, type: 'buffer', processGroup: '缓存区', stdCT: null },
    { id: 'BF-07', name: '物料定置区7', x: 640, y: 200, type: 'buffer', processGroup: '缓存区', stdCT: null },
    { id: 'BF-08', name: '物料定置区8', x: 720, y: 200, type: 'buffer', processGroup: '缓存区', stdCT: null },
    { id: 'BF-09', name: '物料定置区9', x: 750, y: 200, type: 'buffer', processGroup: '缓存区', stdCT: null },
    
    // ===== 下排 - 加工工序区 =====
    { id: 'ST-JG-01', name: '侧墙加工台位1', x: 100, y: 300, type: 'process', processGroup: '加工工序区', stdCT: 420 },
    { id: 'ST-JG-02', name: '侧墙加工台位2', x: 160, y: 300, type: 'process', processGroup: '加工工序区', stdCT: 420 },
    
    // ===== 下排 - 修补工序区 =====
    { id: 'ST-RW-03', name: '组焊修补台位1', x: 280, y: 300, type: 'process', processGroup: '修补工序区', stdCT: null },
    { id: 'ST-RW-04', name: '组焊修补台位2', x: 280, y: 340, type: 'process', processGroup: '修补工序区', stdCT: null },
    
    // ===== 下排 - 精细打磨工序区 =====
    { id: 'ST-JXDM-01', name: '精细打磨台位', x: 420, y: 305, type: 'process', processGroup: '精细打磨工序区', stdCT: 180 },
    
    // ===== 下排 - 组焊工序区（附件） =====
    { id: 'ST-FJ-01', name: '侧墙附件组焊台位1', x: 580, y: 300, type: 'process', processGroup: '组焊工序区（附件）', stdCT: 420 },
    { id: 'ST-FJ-02', name: '侧墙附件组焊台位2', x: 580, y: 340, type: 'process', processGroup: '组焊工序区（附件）', stdCT: 420 },
    { id: 'ST-FJ-03', name: '侧墙附件组焊台位3', x: 640, y: 300, type: 'process', processGroup: '组焊工序区（附件）', stdCT: 420 },
    { id: 'ST-FJ-04', name: '侧墙附件组焊台位4', x: 640, y: 340, type: 'process', processGroup: '组焊工序区（附件）', stdCT: 420 },
    { id: 'ST-FJ-05', name: '侧墙附件组焊台位5', x: 700, y: 300, type: 'process', processGroup: '组焊工序区（附件）', stdCT: 420 },
    { id: 'ST-FJ-06', name: '侧墙附件组焊台位6', x: 700, y: 340, type: 'process', processGroup: '组焊工序区（附件）', stdCT: 420 }
  ];

  // 为每个工位生成实时指标
  workstations.forEach(station => {
    station.metrics = {
      ct: station.stdCT ? station.stdCT + random(-30, 30) : random(60, 180),
      fpy: randomFloat(85, 98),
      oee: randomFloat(75, 95),
      wip: station.type === 'buffer' ? random(2, 6) : random(1, 5), // 确保每个工位都有WIP
      status: station.type === 'buffer' ? 'idle' : 
              random(1, 10) > 8 ? 'breakdown' : 
              random(1, 10) > 9 ? 'idle' : 'running'
    };
  });

  // 识别最严重的瓶颈工艺区域（只标记一个）
  const processGroups = [...new Set(workstations.filter(ws => ws.type === 'process').map(ws => ws.processGroup))];
  let bottleneckProcessGroup = null;
  let maxBottleneckScore = 0;

  processGroups.forEach(group => {
    const groupStations = workstations.filter(ws => ws.processGroup === group && ws.type === 'process');
    if (groupStations.length === 0) return;
    
    // 计算瓶颈评分：基于平均周期时间、WIP积压和设备效率
    const avgCT = groupStations.reduce((sum, ws) => sum + (ws.metrics.ct || 0), 0) / groupStations.length;
    const totalWIP = groupStations.reduce((sum, ws) => sum + ws.metrics.wip, 0);
    const avgOEE = groupStations.reduce((sum, ws) => sum + ws.metrics.oee, 0) / groupStations.length;
    
    // 瓶颈评分 = 周期时间权重 + WIP权重 - 效率权重
    const bottleneckScore = (avgCT * 0.4) + (totalWIP * 10) + ((100 - avgOEE) * 0.6);
    
    if (bottleneckScore > maxBottleneckScore) {
      maxBottleneckScore = bottleneckScore;
      bottleneckProcessGroup = group;
    }
  });

  // 为工位添加瓶颈标识
  workstations.forEach(station => {
    station.metrics.isBottleneck = station.processGroup === bottleneckProcessGroup && station.type === 'process';
  });
  
  // 真实主流程路径 - 工序区之间的关系
  const mainFlow = [
    // 工序区中心点坐标定义
    { id: '组焊工序区', x: 190, y: 110 },
    { id: '修补工序区1', x: 280, y: 305 }, // 下排修补工序区
    { id: '组焊工序区2', x: 190, y: 110 }, // 回到组焊工序区（正面焊接）
    { id: '修补工序区2', x: 280, y: 305 }, // 再次修补
    { id: '调修工序区', x: 420, y: 110 },
    { id: '大线打磨工序区', x: 720, y: 110 },
    { id: '加工工序区（上）', x: 560, y: 90 }, // 上排加工工序区
    { id: '加工工序区（下）', x: 130, y: 300 }, // 下排加工工序区
    { id: '精细打磨工序区', x: 380, y: 305 },
    { id: '组焊工序区（附件）', x: 580, y: 300 }
  ];

  // 主流程连接关系
  const mainFlowConnections = [
    { from: 0, to: 1, label: '组焊→修补' },
    { from: 1, to: 2, label: '修补→组焊' },
    { from: 2, to: 3, label: '组焊→修补' },
    { from: 3, to: 4, label: '修补→调修' },
    { from: 4, to: 5, label: '调修→打磨' },
    { from: 5, to: 6, label: '打磨→加工（上）' },
    { from: 5, to: 7, label: '打磨→加工（下）' },
    { from: 6, to: 8, label: '加工（上）→精磨' },
    { from: 7, to: 8, label: '加工（下）→精磨' },
    { from: 8, to: 9, label: '精磨→附件' }
  ];
  
  // 天车路径
  const craneRoutes = [
    { from: 'ST-GZ-01', to: 'ST-TX-01', type: '大件转运' },
    { from: 'ST-DM-01', to: 'ST-JG-01', type: '半成品转运' },
    { from: 'ST-JXDM-01', to: 'ST-FJ-01', type: '成品转运' }
  ];
  
  // 返工路径
  const reworkPaths = [
    { from: 'ST-GZ-03', to: 'ST-RW-03', type: '焊接返工' },
    { from: 'ST-JG-02', to: 'ST-TX-02', type: '加工返工' },
    { from: 'ST-FJ-02', to: 'ST-JXDM-01', type: '附件返工' }
  ];
  
  // 水蜘蛛路线
  const waterSpiderRoutes = [
    { from: 'BF-01', to: 'ST-GZ-01', type: '原材料配送' },
    { from: 'BF-01', to: 'ST-GZ-02', type: '原材料配送' },
    { from: 'BF-03', to: 'ST-TX-01', type: '工具配送' },
    { from: 'BF-05', to: 'ST-JG-01', type: '刀具配送' },
    { from: 'BF-07', to: 'ST-FJ-01', type: '附件配送' },
    { from: 'BF-09', to: 'ST-FJ-03', type: '焊材配送' }
  ];
  
  // 意面图路径 (复杂交叉路径)
  const spaghettiPaths = [
    // 主流程路径
    ...mainFlowConnections.map(conn => ({ path: `${mainFlow[conn.from].id}->${mainFlow[conn.to].id}`, type: 'main', weight: 3 })),
    // 返工路径
    ...reworkPaths.map(rework => ({ path: `${rework.from}->${rework.to}`, type: 'rework', weight: 1 })),
    // 水蜘蛛路径
    ...waterSpiderRoutes.map(route => ({ path: `${route.from}->${route.to}`, type: 'supply', weight: 2 })),
    // 天车路径
    ...craneRoutes.map(route => ({ path: `${route.from}->${route.to}`, type: 'crane', weight: 2 })),
    // 额外的复杂路径
    { path: 'BF-02->BF-04', type: 'buffer', weight: 1 },
    { path: 'BF-06->BF-08', type: 'buffer', weight: 1 },
    { path: 'ST-JG-02->ST-TX-02', type: 'rework', weight: 1 },
    { path: 'ST-FJ-02->ST-JXDM-01', type: 'rework', weight: 1 }
  ];
  
  // 在制品位置
  const productsInTransit = [];
  for (let i = 1; i <= 15; i++) {
    const connectionIdx = random(0, mainFlowConnections.length - 1);
    const connection = mainFlowConnections[connectionIdx];
    const from = mainFlow[connection.from];
    const to = mainFlow[connection.to];
    
    productsInTransit.push({
      id: `TW-SW-${String(i).padStart(3, '0')}`,
      name: `侧墙#${String(i).padStart(3, '0')}`,
      from: from.id,
      to: to.id,
      x: from.x + (to.x - from.x) * Math.random(),
      y: from.y + (to.y - from.y) * Math.random(),
      progress: Math.random(),
      status: random(1, 10) > 8 ? 'delayed' : 'normal'
    });
  }
  
  // 天车实时位置和状态
  const cranes = [
    { 
      id: 'CR-A', 
      name: '天车A', 
      x: 150, 
      y: 175, 
      load: '侧墙骨架', 
      status: 'moving',
      dailyTrips: random(15, 25),
      totalDistance: randomFloat(2.5, 4.2),
      currentTask: '运输侧墙骨架至组焊工序区'
    },
    { 
      id: 'CR-B', 
      name: '天车B', 
      x: 400, 
      y: 175, 
      load: null, 
      status: 'idle',
      dailyTrips: random(8, 18),
      totalDistance: randomFloat(1.8, 3.5),
      currentTask: '待命中'
    },
    { 
      id: 'CR-C', 
      name: '天车C', 
      x: 650, 
      y: 175, 
      load: '附件组件', 
      status: 'moving',
      dailyTrips: random(12, 22),
      totalDistance: randomFloat(2.1, 3.8),
      currentTask: '运输附件至组焊工序区'
    }
  ];
  
  // 安灯报警
  const andons = [
    { stationId: 'ST-GZ-03', message: '焊接质量异常', severity: 'high', timestamp: new Date(currentTime - 300000) },
    { stationId: 'ST-JG-02', message: '刀具磨损', severity: 'medium', timestamp: new Date(currentTime - 180000) },
    { stationId: 'ST-GZ-02', message: '设备故障', severity: 'critical', timestamp: new Date(currentTime - 120000) },
    { stationId: 'ST-TX-01', message: '材料缺失', severity: 'high', timestamp: new Date(currentTime - 240000) }
  ];
  
  // 设备数据
  const equipments = [
    // 组焊工序区 - 4台自动焊接机器人 (左上角区域: x: 30-350, y: 50-170)
    { id: 'WR-01', name: '焊接机器人1', type: 'welding_robot', processArea: '组焊工序区', x: 80, y: 100, oee: randomFloat(75, 95), status: random(1, 10) > 8 ? 'fault' : random(1, 10) > 6 ? 'idle' : 'running' },
    { id: 'WR-02', name: '焊接机器人2', type: 'welding_robot', processArea: '组焊工序区', x: 150, y: 100, oee: randomFloat(75, 95), status: random(1, 10) > 8 ? 'fault' : random(1, 10) > 6 ? 'idle' : 'running' },
    { id: 'WR-03', name: '焊接机器人3', type: 'welding_robot', processArea: '组焊工序区', x: 220, y: 100, oee: randomFloat(75, 95), status: random(1, 10) > 8 ? 'fault' : random(1, 10) > 6 ? 'idle' : 'running' },
    { id: 'WR-04', name: '焊接机器人4', type: 'welding_robot', processArea: '组焊工序区', x: 290, y: 100, oee: randomFloat(75, 95), status: random(1, 10) > 8 ? 'fault' : random(1, 10) > 6 ? 'idle' : 'running' },
    
    // 加工工序区 - 1台加工设备 (中上方区域: x: 490-630, y: 65-115)
    { id: 'MC-01', name: '加工设备1', type: 'machining_center', processArea: '加工工序区', x: 560, y: 90, oee: randomFloat(70, 90), status: random(1, 10) > 8 ? 'fault' : random(1, 10) > 6 ? 'idle' : 'running' },
    
    // 大线打磨工序区 - 1台打磨机器人 (右上角区域: x: 690-750, y: 50-170)
    { id: 'GR-01', name: '打磨机器人1', type: 'grinding_robot', processArea: '大线打磨工序区', x: 720, y: 110, oee: randomFloat(80, 95), status: random(1, 10) > 8 ? 'fault' : random(1, 10) > 6 ? 'idle' : 'running' },
    
    // 精细打磨工序区 - 2台打磨机器人 (下方中间区域: x: 400-460, y: 285-325)
    { id: 'FR-01', name: '精细打磨机器人1', type: 'fine_grinding_robot', processArea: '精细打磨工序区', x: 415, y: 305, oee: randomFloat(85, 98), status: random(1, 10) > 8 ? 'fault' : random(1, 10) > 6 ? 'idle' : 'running' },
    { id: 'FR-02', name: '精细打磨机器人2', type: 'fine_grinding_robot', processArea: '精细打磨工序区', x: 445, y: 305, oee: randomFloat(85, 98), status: random(1, 10) > 8 ? 'fault' : random(1, 10) > 6 ? 'idle' : 'running' }
  ];
  
  // 在制品订单数据
  const orders = [
    {
      id: 'SW-2024-001',
      productName: 'CRH380D侧墙-左侧',
      specification: '3200×2800×150mm',
      currentStation: 'ST-GZ-02',
      currentStationName: '组焊台位2',
      progress: 35,
      completedProcesses: ['下料', '预处理', '组焊'],
      currentProcess: '组焊',
      nextProcess: '调修',
      estimatedCompletion: new Date(currentTime + 8 * 60 * 60 * 1000), // 8小时后
      priority: 'high',
      customerOrder: 'CO-2024-A001'
    },
    {
      id: 'SW-2024-002', 
      productName: 'CRH380D侧墙-右侧',
      specification: '3200×2800×150mm',
      currentStation: 'ST-JG-01',
      currentStationName: '加工台位1',
      progress: 65,
      completedProcesses: ['下料', '预处理', '组焊', '调修', '加工'],
      currentProcess: '加工',
      nextProcess: '大线打磨',
      estimatedCompletion: new Date(currentTime + 4 * 60 * 60 * 1000), // 4小时后
      priority: 'medium',
      customerOrder: 'CO-2024-A001'
    },
    {
      id: 'SW-2024-003',
      productName: 'CRH380D侧墙-左侧',
      specification: '3200×2800×150mm', 
      currentStation: 'ST-DM-01',
      currentStationName: '大线打磨台位1',
      progress: 80,
      completedProcesses: ['下料', '预处理', '组焊', '调修', '加工', '大线打磨'],
      currentProcess: '大线打磨',
      nextProcess: '精细打磨',
      estimatedCompletion: new Date(currentTime + 2 * 60 * 60 * 1000), // 2小时后
      priority: 'high',
      customerOrder: 'CO-2024-B002'
    },
    {
      id: 'SW-2024-004',
      productName: 'CRH380D侧墙-右侧',
      specification: '3200×2800×150mm',
      currentStation: 'ST-JXDM-01', 
      currentStationName: '精细打磨台位1',
      progress: 95,
      completedProcesses: ['下料', '预处理', '组焊', '调修', '加工', '大线打磨', '精细打磨'],
      currentProcess: '精细打磨',
      nextProcess: '质检',
      estimatedCompletion: new Date(currentTime + 1 * 60 * 60 * 1000), // 1小时后
      priority: 'urgent',
      customerOrder: 'CO-2024-B002'
    },
    {
      id: 'SW-2024-005',
      productName: 'CRH380D侧墙-左侧',
      specification: '3200×2800×150mm',
      currentStation: 'ST-FJ-03',
      currentStationName: '附件组焊台位3',
      progress: 45,
      completedProcesses: ['下料', '预处理', '附件组焊'],
      currentProcess: '附件组焊',
      nextProcess: '附件调修',
      estimatedCompletion: new Date(currentTime + 6 * 60 * 60 * 1000), // 6小时后
      priority: 'medium',
      customerOrder: 'CO-2024-C003'
    }
  ];
  
  // 产品流转轨迹数据 (用于意面图路径分析)
  // 正确的工序流转顺序：组焊工序区→修补工序区→组焊工序区→修补工序区→调修工序区→大线打磨工序区→加工工序区→精细打磨工序区→组焊工序区（附件）
  const productTraces = [
    {
      productId: 'SW-2024-001',
      productName: 'CRH380D侧墙-左侧',
      startTime: new Date(currentTime - 20 * 60 * 60 * 1000), // 20小时前开始
      trace: [
        // 1. 组焊工序区（第一次）
        { stationId: 'ST-GZ-01', timestamp: new Date(currentTime - 20 * 60 * 60 * 1000), duration: 120 },
        { stationId: 'ST-GZ-02', timestamp: new Date(currentTime - 18 * 60 * 60 * 1000), duration: 118 },
        // 2. 修补工序区（第一次）
        { stationId: 'BF-02', timestamp: new Date(currentTime - 16 * 60 * 60 * 1000), duration: 15 }, // 缓存区
        { stationId: 'ST-RW-01', timestamp: new Date(currentTime - 15.75 * 60 * 60 * 1000), duration: 90 },
        // 3. 组焊工序区（第二次）
        { stationId: 'ST-GZ-03', timestamp: new Date(currentTime - 14.25 * 60 * 60 * 1000), duration: 95 },
        // 4. 修补工序区（第二次）
        { stationId: 'ST-RW-02', timestamp: new Date(currentTime - 12.67 * 60 * 60 * 1000), duration: 85 },
        // 5. 调修工序区
        { stationId: 'BF-04', timestamp: new Date(currentTime - 11.25 * 60 * 60 * 1000), duration: 10 }, // 缓存区
        { stationId: 'ST-TX-02', timestamp: new Date(currentTime - 11.08 * 60 * 60 * 1000), duration: 50 },
        // 6. 大线打磨工序区
        { stationId: 'ST-DM-01', timestamp: new Date(currentTime - 10.25 * 60 * 60 * 1000), duration: 110 },
        // 7. 加工工序区
        { stationId: 'BF-07', timestamp: new Date(currentTime - 8.42 * 60 * 60 * 1000), duration: 12 }, // 缓存区
        { stationId: 'ST-JG-01', timestamp: new Date(currentTime - 8.22 * 60 * 60 * 1000), duration: 430 }
        // 当前在加工工序区
      ]
    },
    {
      productId: 'SW-2024-002',
      productName: 'CRH380D侧墙-右侧',
      startTime: new Date(currentTime - 18 * 60 * 60 * 1000), // 18小时前开始
      trace: [
        // 1. 组焊工序区（第一次）
        { stationId: 'BF-01', timestamp: new Date(currentTime - 18 * 60 * 60 * 1000), duration: 25 }, // 缓存区
        { stationId: 'ST-GZ-04', timestamp: new Date(currentTime - 17.58 * 60 * 60 * 1000), duration: 106 },
        { stationId: 'ST-GZ-05', timestamp: new Date(currentTime - 15.82 * 60 * 60 * 1000), duration: 78 },
        // 2. 修补工序区（第一次）
        { stationId: 'ST-RW-03', timestamp: new Date(currentTime - 14.52 * 60 * 60 * 1000), duration: 88 },
        // 3. 组焊工序区（第二次）
        { stationId: 'ST-GZ-06', timestamp: new Date(currentTime - 13.05 * 60 * 60 * 1000), duration: 92 },
        // 4. 修补工序区（第二次）
        { stationId: 'ST-RW-04', timestamp: new Date(currentTime - 11.52 * 60 * 60 * 1000), duration: 82 },
        // 5. 调修工序区
        { stationId: 'ST-TX-01', timestamp: new Date(currentTime - 10.15 * 60 * 60 * 1000), duration: 48 },
        // 6. 大线打磨工序区
        { stationId: 'BF-08', timestamp: new Date(currentTime - 9.35 * 60 * 60 * 1000), duration: 8 }, // 缓存区
        { stationId: 'ST-DM-02', timestamp: new Date(currentTime - 9.22 * 60 * 60 * 1000), duration: 115 },
        // 7. 加工工序区
        { stationId: 'ST-JG-02', timestamp: new Date(currentTime - 7.3 * 60 * 60 * 1000), duration: 437 }
        // 当前在加工工序区
      ]
    },
    {
      productId: 'SW-2024-003',
      productName: 'CRH380D侧墙-左侧',
      startTime: new Date(currentTime - 16 * 60 * 60 * 1000), // 16小时前开始
      trace: [
        // 1. 组焊工序区（第一次）
        { stationId: 'ST-GZ-02', timestamp: new Date(currentTime - 16 * 60 * 60 * 1000), duration: 134 },
        { stationId: 'ST-GZ-01', timestamp: new Date(currentTime - 13.77 * 60 * 60 * 1000), duration: 121 },
        // 2. 修补工序区（第一次）
        { stationId: 'BF-03', timestamp: new Date(currentTime - 11.75 * 60 * 60 * 1000), duration: 18 }, // 缓存区
        { stationId: 'ST-RW-02', timestamp: new Date(currentTime - 11.45 * 60 * 60 * 1000), duration: 75 },
        // 3. 组焊工序区（第二次）
        { stationId: 'ST-GZ-04', timestamp: new Date(currentTime - 10.2 * 60 * 60 * 1000), duration: 88 },
        // 4. 修补工序区（第二次）
        { stationId: 'ST-RW-01', timestamp: new Date(currentTime - 8.73 * 60 * 60 * 1000), duration: 80 },
        // 5. 调修工序区
        { stationId: 'ST-TX-03', timestamp: new Date(currentTime - 7.4 * 60 * 60 * 1000), duration: 45 },
        // 6. 大线打磨工序区
        { stationId: 'ST-DM-01', timestamp: new Date(currentTime - 6.65 * 60 * 60 * 1000), duration: 108 },
        // 7. 加工工序区
        { stationId: 'ST-JG-03', timestamp: new Date(currentTime - 4.85 * 60 * 60 * 1000), duration: 402 },
        // 8. 精细打磨工序区
        { stationId: 'BF-09', timestamp: new Date(currentTime - 2.15 * 60 * 60 * 1000), duration: 10 }, // 缓存区
        { stationId: 'ST-JXDM-01', timestamp: new Date(currentTime - 1.98 * 60 * 60 * 1000), duration: 118 }
        // 当前在精细打磨工序区
      ]
    },
    {
      productId: 'SW-2024-004',
      productName: 'CRH380D侧墙-右侧',
      startTime: new Date(currentTime - 14 * 60 * 60 * 1000), // 14小时前开始
      trace: [
        // 完整流程示例
        // 1. 组焊工序区（第一次）
        { stationId: 'ST-GZ-05', timestamp: new Date(currentTime - 14 * 60 * 60 * 1000), duration: 65 },
        { stationId: 'ST-GZ-06', timestamp: new Date(currentTime - 12.92 * 60 * 60 * 1000), duration: 57 },
        // 2. 修补工序区（第一次）
        { stationId: 'ST-RW-04', timestamp: new Date(currentTime - 11.97 * 60 * 60 * 1000), duration: 72 },
        // 3. 组焊工序区（第二次）
        { stationId: 'BF-05', timestamp: new Date(currentTime - 10.77 * 60 * 60 * 1000), duration: 12 }, // 缓存区
        { stationId: 'ST-GZ-03', timestamp: new Date(currentTime - 10.57 * 60 * 60 * 1000), duration: 85 },
        // 4. 修补工序区（第二次）
        { stationId: 'ST-RW-03', timestamp: new Date(currentTime - 9.15 * 60 * 60 * 1000), duration: 78 },
        // 5. 调修工序区
        { stationId: 'ST-TX-01', timestamp: new Date(currentTime - 7.85 * 60 * 60 * 1000), duration: 45 },
        // 6. 大线打磨工序区
        { stationId: 'ST-DM-02', timestamp: new Date(currentTime - 7.1 * 60 * 60 * 1000), duration: 125 },
        // 7. 加工工序区
        { stationId: 'ST-JG-04', timestamp: new Date(currentTime - 5.02 * 60 * 60 * 1000), duration: 421 },
        // 8. 精细打磨工序区
        { stationId: 'ST-JXDM-01', timestamp: new Date(currentTime - 2 * 60 * 60 * 1000), duration: 118 },
        // 9. 组焊工序区（附件）
        { stationId: 'BF-06', timestamp: new Date(currentTime - 0.03 * 60 * 60 * 1000), duration: 5 } // 刚进入缓存区
        // 即将进入附件组焊
      ]
    },
    {
      productId: 'SW-2024-005',
      productName: 'CRH380D侧墙-左侧',
      startTime: new Date(currentTime - 12 * 60 * 60 * 1000), // 12小时前开始
      trace: [
        // 1. 组焊工序区（第一次）
        { stationId: 'BF-01', timestamp: new Date(currentTime - 12 * 60 * 60 * 1000), duration: 20 }, // 缓存区
        { stationId: 'ST-GZ-01', timestamp: new Date(currentTime - 11.67 * 60 * 60 * 1000), duration: 125 },
        // 2. 修补工序区（第一次）
        { stationId: 'ST-RW-01', timestamp: new Date(currentTime - 9.58 * 60 * 60 * 1000), duration: 82 },
        // 3. 组焊工序区（第二次）
        { stationId: 'ST-GZ-02', timestamp: new Date(currentTime - 8.22 * 60 * 60 * 1000), duration: 95 },
        // 4. 修补工序区（第二次）
        { stationId: 'BF-04', timestamp: new Date(currentTime - 6.63 * 60 * 60 * 1000), duration: 15 }, // 缓存区
        { stationId: 'ST-RW-02', timestamp: new Date(currentTime - 6.38 * 60 * 60 * 1000), duration: 88 },
        // 5. 调修工序区
        { stationId: 'ST-TX-02', timestamp: new Date(currentTime - 4.92 * 60 * 60 * 1000), duration: 52 },
        // 6. 大线打磨工序区
        { stationId: 'ST-DM-01', timestamp: new Date(currentTime - 4.05 * 60 * 60 * 1000), duration: 112 },
        // 7. 加工工序区 (当前位置)
        { stationId: 'ST-JG-01', timestamp: new Date(currentTime - 2.18 * 60 * 60 * 1000), duration: 130 } // 正在进行中
      ]
    },
    {
      productId: 'SW-2024-006',
      productName: 'CRH380D侧墙-右侧',
      startTime: new Date(currentTime - 10 * 60 * 60 * 1000), // 10小时前开始
      trace: [
        // 1. 组焊工序区（第一次）
        { stationId: 'ST-GZ-03', timestamp: new Date(currentTime - 10 * 60 * 60 * 1000), duration: 117 },
        { stationId: 'ST-GZ-04', timestamp: new Date(currentTime - 8.05 * 60 * 60 * 1000), duration: 87 },
        // 2. 修补工序区（第一次）
        { stationId: 'ST-RW-03', timestamp: new Date(currentTime - 6.6 * 60 * 60 * 1000), duration: 75 },
        // 3. 组焊工序区（第二次）
        { stationId: 'BF-02', timestamp: new Date(currentTime - 5.35 * 60 * 60 * 1000), duration: 20 }, // 缓存区
        { stationId: 'ST-GZ-05', timestamp: new Date(currentTime - 5.02 * 60 * 60 * 1000), duration: 92 },
        // 4. 修补工序区（第二次）
        { stationId: 'ST-RW-04', timestamp: new Date(currentTime - 3.48 * 60 * 60 * 1000), duration: 80 },
        // 5. 调修工序区
        { stationId: 'ST-TX-03', timestamp: new Date(currentTime - 2.15 * 60 * 60 * 1000), duration: 48 },
        // 6. 大线打磨工序区 (当前位置)
        { stationId: 'ST-DM-02', timestamp: new Date(currentTime - 1.35 * 60 * 60 * 1000), duration: 80 } // 正在进行中
      ]
    }
  ];
  
  // 计算路径使用频次 (用于意面图密度分析)
  const calculatePathFrequency = () => {
    const pathFrequency = {};
    
    productTraces.forEach(product => {
      for (let i = 0; i < product.trace.length - 1; i++) {
        const from = product.trace[i].stationId;
        const to = product.trace[i + 1].stationId;
        const pathKey = `${from}->${to}`;
        
        pathFrequency[pathKey] = (pathFrequency[pathKey] || 0) + 1;
      }
    });
    
    return pathFrequency;
  };
  
  const pathFrequency = calculatePathFrequency();
  
  // 生成基于频次的意面图路径
  const spaghettiPathsWithFrequency = Object.entries(pathFrequency).map(([path, frequency]) => ({
    path,
    frequency,
    weight: Math.min(frequency * 2, 8), // 最大线宽8px
    opacity: Math.min(0.3 + frequency * 0.2, 1.0) // 透明度基于频次
  }));
  
  // 全局KPI
  const globalKPIs = {
    flow: {
      production: { actual: random(18, 24), target: 24, unit: '件/天' },
      takt: { actual: randomFloat(85, 95), target: 90, unit: '%' },
      plt: { actual: random(65, 75), target: 72, unit: '小时' },
      wip: { actual: workstations.reduce((sum, ws) => sum + ws.metrics.wip, 0), target: 60, unit: '件' }
    },
    quality: {
      fpy: { actual: randomFloat(88, 95), target: 92, unit: '%' },
      defectRate: { actual: randomFloat(2, 8), target: 5, unit: '%' },
      rework: { actual: random(2, 6), target: 3, unit: '件/天' },
      scrap: { actual: random(0, 2), target: 1, unit: '件/天' }
    },
    cost: {
      oee: { actual: randomFloat(78, 88), target: 85, unit: '%' },
      efficiency: { actual: randomFloat(82, 92), target: 88, unit: '%' },
      utilization: { actual: randomFloat(75, 85), target: 80, unit: '%' },
      costPerUnit: { actual: randomFloat(2800, 3200), target: 3000, unit: '元/件' }
    },
    flexibility: {
      otd: { actual: randomFloat(85, 95), target: 90, unit: '%' },
      changeover: { actual: random(15, 25), target: 20, unit: '分钟' },
      mixFlexibility: { actual: randomFloat(70, 85), target: 80, unit: '%' },
      capacity: { actual: randomFloat(88, 98), target: 95, unit: '%' }
    }
  };

  return {
    workstations,
    mainFlow,
    mainFlowConnections,
    craneRoutes,
    reworkPaths,
    waterSpiderRoutes,
    spaghettiPaths,
    spaghettiPathsWithFrequency,
    productTraces,
    pathFrequency,
    productsInTransit,
    cranes,
    andons,
    equipments,
    orders,
    globalKPIs,
    timestamp: currentTime
  };
};

// ============= 主组件 =============
const RealProductionMap = () => {
  const [data, setData] = useState(generateRealProductionData());
  const [selectedView, setSelectedView] = useState('Flow');
  const [activeLayers, setActiveLayers] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedWIP, setSelectedWIP] = useState(null);
  const [selectedAndon, setSelectedAndon] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderList, setShowOrderList] = useState(false);
  const [spaghettiMode, setSpaghettiMode] = useState('frequency'); // 'frequency' 或 'single'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [scale, setScale] = useState(1);
  const svgRef = useRef(null);

  // 定时刷新数据
  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateRealProductionData());
    }, 10000); // 改为10秒更新一次
    return () => clearInterval(interval);
  }, []);

  // 专题视图配置
  const viewConfigs = {
    'Flow': {
      title: '流动视图',
      subtitle: '生产节奏与物流',
      color: '#10b981',
      defaultLayers: ['mainFlow', 'wip', 'bottleneck']
    },
    'Quality': {
      title: '质量视图', 
      subtitle: '质量状态与异常',
      color: '#3b82f6',
      defaultLayers: ['stations', 'quality', 'rework', 'andon']
    },
    'Efficiency': {
      title: '效率视图',
      subtitle: '设备效率与成本', 
      color: '#f59e0b',
      defaultLayers: ['stations', 'oee', 'equipment']
    },
    '计划与柔性视图': {
      title: '计划与柔性视图',
      subtitle: '订单交付与产线柔性',
      color: '#8b5cf6',
      defaultLayers: ['stations', 'orders', 'crane']
    },
    'Spaghetti': {
      title: '意面图',
      subtitle: '物流路径复杂度分析',
      color: '#06b6d4',
      defaultLayers: ['mainFlow', 'rework', 'waterSpider', 'spaghetti']
    }
  };

  // 图层控制配置
  const layerConfigs = [
    // 已实现的图层
    { id: 'stations', name: '工位状态层', color: '#3b82f6', icon: '🏭', enabled: true },
    { id: 'mainFlow', name: '路径流量监控', color: '#8b5cf6', icon: '➡️', enabled: true },
    { id: 'wip', name: '在制品位置', color: '#10b981', icon: '📦', enabled: true },
    { id: 'bottleneck', name: '瓶颈标识', color: '#ef4444', icon: '⚠️', enabled: true },
    { id: 'andon', name: '安灯层', color: '#f59e0b', icon: '🚨', enabled: true },
    { id: 'oee', name: '设备OEE层', color: '#10b981', icon: '📊', enabled: true },
    { id: 'equipment', name: '设备状态', color: '#6b7280', icon: '⚙️', enabled: true },
    { id: 'crane', name: '天车系统', color: '#fbbf24', icon: '🏗️', enabled: true },
    { id: 'orders', name: '订单位置', color: '#8b5cf6', icon: '📋', enabled: true },
    { id: 'spaghetti', name: '意面图路径', color: '#ef4444', icon: '🍝', enabled: true },
    // 未实现的图层（灰色不可选）
    { id: 'quality', name: '品质层', color: '#9ca3af', icon: '✅', enabled: false },
    { id: 'rework', name: '返工路径', color: '#9ca3af', icon: '🔄', enabled: false },
    { id: 'waterSpider', name: '水蜘蛛路线', color: '#9ca3af', icon: '🕷️', enabled: false }
  ];

  // 切换专题视图
  const switchView = (viewName) => {
    setSelectedView(viewName);
    const config = viewConfigs[viewName];
    if (config) {
      setActiveLayers(config.defaultLayers);
    }
  };

  // 切换图层
  const toggleLayer = (layerId) => {
    setActiveLayers(prev => 
      prev.includes(layerId) 
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  // 渲染工位
  const renderWorkstation = (station) => {
    const showStatusLayer = activeLayers.includes('stations');
    const statusColor = showStatusLayer ? (
      station.metrics.status === 'breakdown' ? DESIGN_TOKENS.colors.error :
      station.metrics.status === 'idle' ? DESIGN_TOKENS.colors.neutral :
      DESIGN_TOKENS.colors.normal
    ) : DESIGN_TOKENS.colors.neutral;
    
    const isBottleneck = activeLayers.includes('bottleneck') && station.metrics.isBottleneck; // 使用新的瓶颈标识逻辑
    
    return (
      <g key={station.id} transform={`translate(${station.x}, ${station.y})`}>
        {/* 工位框 */}
        <rect
          x="-22"
          y="-12"
          width="44"
          height="24"
          fill="#1a1f2e"
          stroke={isBottleneck ? DESIGN_TOKENS.colors.error : statusColor}
          strokeWidth={isBottleneck ? "3" : "2"}
          rx="3"
          className="cursor-pointer hover:opacity-80"
          onClick={() => setSelectedStation(station)}
        />
        
        {/* 工位ID */}
        <text
          x="0"
          y="2"
          textAnchor="middle"
          fontSize="8"
          fill="#ffffff"
          fontWeight="bold"
        >
          {station.id}
        </text>
        
        {/* CT时间 */}
        {station.stdCT && (
          <text
            x="0"
            y="18"
            textAnchor="middle"
            fontSize="6"
            fill="#9ca3af"
          >
            CT:{station.metrics.ct}min
          </text>
        )}
        
        {/* 状态指示器 */}
        {showStatusLayer && (
          <g transform="translate(-30, -10)">
            <circle
              cx="0"
              cy="0"
              r="6"
              fill={statusColor}
              stroke="white"
              strokeWidth="2"
              className={station.metrics.status === 'breakdown' ? 'animate-pulse' : ''}
            />
            <text
              x="0"
              y="2"
              textAnchor="middle"
              fontSize="8"
              fill="white"
            >
              {station.metrics.status === 'running' ? '▶' : 
               station.metrics.status === 'idle' ? '⏸' : '⚠'}
            </text>
          </g>
        )}
        
        {/* 状态文字 */}
        {showStatusLayer && (
          <text
            x="0"
            y="-22"
            textAnchor="middle"
            fontSize="7"
            fill={statusColor}
            fontWeight="bold"
          >
            {station.metrics.status === 'running' ? '运行中' : 
             station.metrics.status === 'idle' ? '空闲' : '故障'}
          </text>
        )}
        
        {/* 瓶颈标识 - 黄色感叹号 */}
        {isBottleneck && (
          <text
            x="25"
            y="-8"
            fontSize="12"
            fill="#fbbf24"
          >
            ⚠️
          </text>
        )}
        
        {/* WIP数量 - 移除，改为在制品位置图层控制 */}
      </g>
    );
  };

  // 渲染主物流路径
  const renderMainFlow = () => {
    if (!activeLayers.includes('mainFlow')) return null;
    
    // 定义主物流路径的精确连接点（优化后的边缘连接）
    const flowPaths = [
      // 路径1: 组焊工序区 -> 修补工序区
      {
        id: 'path-1',
        points: [
          { x: 190, y: 170 }, // 组焊工序区下边缘中心
          { x: 190, y: 240 }, // 垂直向下
          { x: 280, y: 240 }, // 水平向右
          { x: 280, y: 285 }, // 垂直向下到修补工序区上边缘
        ],
        color: '#f97316', // 橙色
        label: '组焊→修补',
        wipCount: 8,
        labelOffset: { x: -10, y: -25 }, // 标签偏移
        wipOffset: { x: 15, y: 10 } // WIP标签偏移
      },
      // 路径2: 修补工序区 -> 组焊工序区
      {
        id: 'path-2', 
        points: [
          { x: 310, y: 300 }, // 修补工序区右边缘
          { x: 350, y: 300 }, // 水平向右
          { x: 350, y: 220 }, // 垂直向上
          { x: 220, y: 220 }, // 水平向左
          { x: 220, y: 170 }, // 垂直向上到组焊工序区下边缘
        ],
        color: '#10b981', // 绿色
        label: '修补→组焊',
        wipCount: 12,
        labelOffset: { x: 0, y: -25 },
        wipOffset: { x: 20, y: 10 }
      },
      // 路径3: 组焊工序区 -> 调修工序区
      {
        id: 'path-3',
        points: [
          { x: 350, y: 105 }, // 组焊工序区右边缘中心
          { x: 390, y: 105 }, // 调修工序区左边缘中心
        ],
        color: '#f59e0b', // 黄色
        label: '组焊→调修',
        wipCount: 15,
        labelOffset: { x: 0, y: -20 },
        wipOffset: { x: 0, y: 15 }
      },
      // 路径4: 调修工序区 -> 大线打磨工序区
      {
        id: 'path-4',
        points: [
          { x: 450, y: 105 }, // 调修工序区右边缘
          { x: 470, y: 105 }, // 水平向右
          { x: 470, y: 90 }, // 垂直向上
          { x: 690, y: 90 }, // 水平向右到大线打磨工序区左边缘
        ],
        color: '#06b6d4', // 青色
        label: '调修→打磨',
        wipCount: 18,
        labelOffset: { x: 0, y: -25 },
        wipOffset: { x: 25, y: 10 }
      },
      // 路径5: 大线打磨工序区 -> 加工工序区
      {
        id: 'path-5',
        points: [
          { x: 720, y: 170 }, // 大线打磨工序区下边缘中心
          { x: 720, y: 190 }, // 垂直向下
          { x: 565, y: 190 }, // 水平向左
          { x: 565, y: 170 }, // 垂直向上到加工工序区下边缘
        ],
        color: '#8b5cf6', // 紫色
        label: '打磨→加工',
        wipCount: 22,
        labelOffset: { x: -15, y: -25 },
        wipOffset: { x: 10, y: 10 }
      },
      // 路径6: 加工工序区 -> 精细打磨工序区
      {
        id: 'path-6',
        points: [
          { x: 565, y: 170 }, // 加工工序区下边缘
          { x: 565, y: 230 }, // 垂直向下
          { x: 430, y: 230 }, // 水平向左
          { x: 430, y: 285 }, // 垂直向下到精细打磨工序区上边缘
        ],
        color: '#ef4444', // 红色
        label: '加工→精磨',
        wipCount: 25,
        labelOffset: { x: -20, y: -25 },
        wipOffset: { x: 15, y: 10 }
      },
      // 路径7: 精细打磨工序区 -> 组焊工序区（附件）
      {
        id: 'path-7',
        points: [
          { x: 460, y: 305 }, // 精细打磨工序区右边缘
          { x: 550, y: 305 }, // 组焊工序区（附件）左边缘
        ],
        color: '#10b981', // 绿色
        label: '精磨→附件',
        wipCount: 9,
        labelOffset: { x: 0, y: -20 },
        wipOffset: { x: 0, y: 15 }
      }
    ];
    
    return (
      <g>
        {flowPaths.map((path, index) => {
          // 创建路径字符串
          const pathString = path.points.map((point, i) => 
            `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
          ).join(' ');
          
          // 计算标签位置（路径中点）
          const midIndex = Math.floor(path.points.length / 2);
          const labelPos = path.points[midIndex];
          
          // 计算箭头位置（路径末端附近）
          const arrowPos = path.points[path.points.length - 1];
          const prevPos = path.points[path.points.length - 2] || path.points[path.points.length - 1];
          
          // 计算箭头方向
          const dx = arrowPos.x - prevPos.x;
          const dy = arrowPos.y - prevPos.y;
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          
          return (
            <g key={path.id}>
              {/* 主路径线 */}
              <path
                d={pathString}
                stroke={path.color}
                strokeWidth="3"
                fill="none"
                opacity="0.8"
              />
              
              {/* 小箭头（与连线同色，位置优化） */}
              <g transform={`translate(${arrowPos.x - dx * 0.1}, ${arrowPos.y - dy * 0.1}) rotate(${angle})`}>
                <path
                  d="M -6 -3 L 6 0 L -6 3 Z"
                  fill={path.color}
                  stroke={path.color}
                  strokeWidth="1"
                  opacity="0.9"
                />
              </g>
              
              {/* 流程标签（位置优化） */}
              <g transform={`translate(${labelPos.x + path.labelOffset.x}, ${labelPos.y + path.labelOffset.y})`}>
                {/* 标签背景 */}
                <rect
                  x={-path.label.length * 3}
                  y="-8"
                  width={path.label.length * 6}
                  height="16"
                  fill="white"
                  stroke={path.color}
                  strokeWidth="1"
                  rx="8"
                  opacity="0.95"
                />
                {/* 标签文字 */}
                <text
                  x="0"
                  y="3"
                  fontSize="8"
                  fill={path.color}
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {path.label}
                </text>
              </g>
              
              {/* WIP数量标签（位置优化） */}
              <g transform={`translate(${labelPos.x + path.wipOffset.x}, ${labelPos.y + path.wipOffset.y})`}>
                {/* 标签背景 */}
                <rect
                  x="-8"
                  y="-6"
                  width="16"
                  height="12"
                  fill={path.color}
                  stroke="white"
                  strokeWidth="1"
                  rx="6"
                  opacity="0.9"
                />
                {/* WIP数量 */}
                <text
                  x="0"
                  y="2"
                  fontSize="8"
                  fill="white"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {path.wipCount}
                </text>
              </g>
            </g>
          );
        })}
        
        {/* 添加流程说明文字 */}
        <g transform="translate(50, 380)">
          <rect
            x="0"
            y="0"
            width="180"
            height="15"
            fill="rgba(255,255,255,0.9)"
            stroke="#e5e7eb"
            strokeWidth="1"
            rx="3"
          />
          <text
            x="90"
            y="11"
            fontSize="10"
            fill="#374151"
            textAnchor="middle"
            fontWeight="bold"
          >
            主物流路径：精确连接 + WIP数量
          </text>
        </g>
      </g>
    );
  };

  // 渲染水蜘蛛路线
  const renderWaterSpiderRoutes = () => {
    if (!activeLayers.includes('waterSpider')) return null;
    
    return data.waterSpiderRoutes.map((route, index) => {
      const from = data.workstations.find(ws => ws.id === route.from);
      const to = data.workstations.find(ws => ws.id === route.to);
      if (!from || !to) return null;
      
      return (
        <line
          key={index}
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke={DESIGN_TOKENS.colors.waterSpider}
          strokeWidth="1.5"
          strokeDasharray="3,3"
          markerEnd="url(#arrowWaterSpider)"
          opacity="0.6"
        />
      );
    });
  };

  // 渲染意面图路径
  const renderSpaghettiPaths = () => {
    if (!activeLayers.includes('spaghetti')) return null;
    
    if (spaghettiMode === 'frequency') {
      // 多产品叠加模式 - 显示路径密度
      return data.spaghettiPathsWithFrequency.map((pathData, index) => {
        const [fromId, toId] = pathData.path.split('->');
        const from = data.workstations.find(ws => ws.id === fromId);
        const to = data.workstations.find(ws => ws.id === toId);
        if (!from || !to) return null;
        
        // 根据频次确定颜色强度
        const intensity = Math.min(pathData.frequency / 3, 1); // 最大频次为3时达到最高强度
        const baseColor = '#ef4444'; // 红色基调
        
        return (
          <g key={index}>
            {/* 路径线条 */}
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={baseColor}
              strokeWidth={pathData.weight}
              opacity={pathData.opacity}
              strokeLinecap="round"
              className="animate-pulse"
            />
            
            {/* 频次标识 */}
            {pathData.frequency > 1 && (
              <g transform={`translate(${(from.x + to.x) / 2}, ${(from.y + to.y) / 2})`}>
                <circle
                  cx="0"
                  cy="0"
                  r="8"
                  fill={baseColor}
                  opacity="0.8"
                />
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="6"
                  fill="white"
                  fontWeight="bold"
                >
                  {pathData.frequency}
                </text>
              </g>
            )}
          </g>
        );
      });
    } else if (spaghettiMode === 'single' && selectedProduct) {
      // 单产品轨迹模式 - 显示特定产品的流转路径
      const product = data.productTraces.find(p => p.productId === selectedProduct);
      if (!product) return null;
      
      return product.trace.slice(0, -1).map((step, index) => {
        const nextStep = product.trace[index + 1];
        const from = data.workstations.find(ws => ws.id === step.stationId);
        const to = data.workstations.find(ws => ws.id === nextStep.stationId);
        if (!from || !to) return null;
        
        // 根据时间顺序使用渐变色
        const progress = index / (product.trace.length - 2);
        const hue = 240 - progress * 120; // 从蓝色(240)到红色(120)
        const color = `hsl(${hue}, 70%, 50%)`;
        
        return (
          <g key={index}>
            {/* 路径箭头 */}
            <defs>
              <marker
                id={`arrowhead-${index}`}
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill={color}
                />
              </marker>
            </defs>
            
            {/* 路径线条 */}
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={color}
              strokeWidth="3"
              opacity="0.8"
              strokeLinecap="round"
              markerEnd={`url(#arrowhead-${index})`}
              className="animate-pulse"
            />
            
            {/* 步骤序号 */}
            <g transform={`translate(${(from.x + to.x) / 2}, ${(from.y + to.y) / 2})`}>
              <circle
                cx="0"
                cy="0"
                r="10"
                fill="white"
                stroke={color}
                strokeWidth="2"
              />
              <text
                x="0"
                y="0"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
                fill={color}
                fontWeight="bold"
              >
                {index + 1}
              </text>
            </g>
          </g>
        );
      });
    }
    
    return null;
  };
  
  // 渲染天车系统
  const renderCranes = () => {
    if (!activeLayers.includes('crane')) return null;
    
    return data.cranes.map(crane => {
      const statusColors = {
        moving: '#f97316',  // 橙色 - 运行中
        idle: '#6b7280',    // 灰色 - 空闲
        loading: '#eab308', // 黄色 - 装载中
        maintenance: '#ef4444' // 红色 - 维护中
      };
      
      const statusNames = {
        moving: '运行中',
        idle: '空闲',
        loading: '装载中',
        maintenance: '维护中'
      };
      
      return (
        <g key={crane.id} transform={`translate(${crane.x}, ${crane.y})`}>
          {/* 天车轨道（背景） */}
          <line
            x1="-30"
            y1="0"
            x2="30"
            y2="0"
            stroke="#94a3b8"
            strokeWidth="3"
            opacity="0.5"
          />
          
          {/* 天车主体 - 橘黄色立体竖长条，横贯整个产线 */}
          <g>
            {/* 立体效果 - 阴影 */}
            <rect
              x="-8"
              y="-165"
              width="16"
              height="330"
              fill="#000000"
              opacity="0.2"
              rx="2"
              transform="translate(2, 2)"
            />
            
            {/* 主体长条 */}
            <rect
              x="-8"
              y="-165"
              width="16"
              height="330"
              fill={statusColors[crane.status]}
              stroke="#ffffff"
              strokeWidth="1"
              rx="2"
            />
            
            {/* 立体效果 - 高光 */}
            <rect
              x="-6"
              y="-163"
              width="4"
              height="326"
              fill="#ffffff"
              opacity="0.3"
              rx="1"
            />
            
            {/* 天车编号 */}
            <text
              x="0"
              y="-5"
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill="white"
            >
              {crane.id}
            </text>
            
            {/* 运行状态指示器 */}
            <circle
              cx="0"
              cy="10"
              r="3"
              fill={crane.status === 'moving' ? '#10b981' : '#6b7280'}
              className={crane.status === 'moving' ? 'animate-pulse' : ''}
            />
          </g>
          
          {/* 吊运物品显示 */}
          {crane.load && (
            <g transform="translate(0, -175)">
              <rect
                x="-15"
                y="-8"
                width="30"
                height="16"
                fill="#fbbf24"
                stroke="#f59e0b"
                strokeWidth="1"
                rx="3"
              />
              <text
                x="0"
                y="2"
                textAnchor="middle"
                fontSize="6"
                fill="#92400e"
                fontWeight="bold"
              >
                🏗️ {crane.load}
              </text>
            </g>
          )}
          
          {/* 天车状态信息面板 */}
          <g transform="translate(0, 180)">
            {/* 信息背景框 */}
            <rect
              x="-35"
              y="-15"
              width="70"
              height="30"
              fill="rgba(255, 255, 255, 0.95)"
              stroke="#e5e7eb"
              strokeWidth="1"
              rx="4"
            />
            
            {/* 天车名称 */}
            <text
              x="0"
              y="-8"
              textAnchor="middle"
              fontSize="8"
              fontWeight="bold"
              fill="#374151"
            >
              {crane.name}
            </text>
            
            {/* 状态 */}
            <text
              x="-30"
              y="2"
              fontSize="6"
              fill={statusColors[crane.status]}
              fontWeight="bold"
            >
              {statusNames[crane.status]}
            </text>
            
            {/* 当天调运次数 */}
            <text
              x="0"
              y="2"
              textAnchor="middle"
              fontSize="6"
              fill="#6b7280"
            >
              {crane.dailyTrips}次
            </text>
            
            {/* 累计距离 */}
            <text
              x="30"
              y="2"
              textAnchor="end"
              fontSize="6"
              fill="#6b7280"
            >
              {crane.totalDistance}km
            </text>
            
            {/* 当前任务 */}
            <text
              x="0"
              y="10"
              textAnchor="middle"
              fontSize="5"
              fill="#9ca3af"
            >
              {crane.currentTask}
            </text>
          </g>
        </g>
      );
    });
  };

  // 渲染在制品位置（优化尺寸和样式）
  const renderWIPPositions = () => {
    if (!activeLayers.includes('wip')) return null;
    
    return data.workstations.map(station => {
      // 只显示有WIP的工位
      if (station.metrics.wip === 0) return null;
      
      return (
        <g key={`wip-${station.id}`} transform={`translate(${station.x}, ${station.y})`}>
          {/* 蓝色方框 - 12x12像素，无边框 */}
          <rect
            x="20"
            y="-20"
            width="12"
            height="12"
            fill="#2563eb"
            rx="2"
            className="cursor-pointer hover:opacity-80"
            onClick={() => setSelectedWIP({...station, wipDetails: generateWIPDetails(station)})}
            style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'}}
          />
          {/* WIP数量 - 8px白色文字 */}
          <text
            x="26"
            y="-12"
            textAnchor="middle"
            fontSize="8"
            fill="white"
            fontWeight="bold"
            className="pointer-events-none"
            style={{textShadow: '0 1px 1px rgba(0,0,0,0.5)'}}
          >
            {station.metrics.wip}
          </text>
        </g>
      );
    }).filter(Boolean); // 过滤掉null值
  };

  // 生成WIP详细信息
  const generateWIPDetails = (station) => {
    const wipItems = [];
    for (let i = 1; i <= station.metrics.wip; i++) {
      wipItems.push({
        id: `TW-SW-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
        name: `侧墙#${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
        status: Math.random() > 0.8 ? 'delayed' : 'normal',
        arrivalTime: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString(),
        progress: Math.floor(Math.random() * 100)
      });
    }
    return wipItems;
  };

  // 渲染安灯报警
  const renderAndons = () => {
    if (!activeLayers.includes('andon')) return null;
    
    return data.andons.map((andon, index) => {
      const station = data.workstations.find(ws => ws.id === andon.stationId);
      if (!station) return null;
      
      const color = andon.severity === 'critical' ? DESIGN_TOKENS.colors.error :
                   andon.severity === 'high' ? DESIGN_TOKENS.colors.error :
                   DESIGN_TOKENS.colors.warning;
      
      return (
        <g key={index} transform={`translate(${station.x}, ${station.y})`}>
          {/* 红灯图标 */}
          <circle
            cx="0"
            cy="-35"
            r="8"
            fill={color}
            className="animate-pulse cursor-pointer hover:opacity-80"
            onMouseDown={() => setSelectedAndon({...andon, station})}
            style={{pointerEvents: 'all'}}
          />
          <text
            x="0"
            y="-31"
            textAnchor="middle"
            fontSize="8"
            fill="white"
            className="pointer-events-none"
          >
            🚨
          </text>
          
          {/* 异常名称红色框 */}
          <g transform="translate(15, -45)">
            <rect
              x="0"
              y="0"
              width={Math.max(andon.message.length * 6, 60)}
              height="16"
              fill={color}
              rx="2"
              className="cursor-pointer hover:opacity-80"
              onMouseDown={() => setSelectedAndon({...andon, station})}
              style={{pointerEvents: 'all'}}
            />
            <text
              x={Math.max(andon.message.length * 3, 30)}
              y="11"
              textAnchor="middle"
              fontSize="8"
              fill="white"
              fontWeight="bold"
              className="pointer-events-none"
            >
              {andon.message}
            </text>
          </g>
        </g>
      );
    });
  };

  // 渲染设备OEE层
  const renderOEE = () => {
    if (!activeLayers.includes('oee')) return null;
    
    return data.equipments.map((equipment, index) => {
      const oeeValue = equipment.oee;
      const radius = 15;
      const strokeWidth = 3;
      const normalizedRadius = radius - strokeWidth * 2;
      const circumference = normalizedRadius * 2 * Math.PI;
      const strokeDasharray = `${oeeValue / 100 * circumference} ${circumference}`;
      
      return (
        <g key={`oee-${equipment.id}`} transform={`translate(${equipment.x}, ${equipment.y})`}>
          {/* 背景圆圈 */}
          <circle
            cx="0"
            cy="0"
            r={normalizedRadius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* OEE进度圆圈 */}
          <circle
            cx="0"
            cy="0"
            r={normalizedRadius}
            fill="none"
            stroke={oeeValue >= 85 ? '#10b981' : oeeValue >= 70 ? '#f59e0b' : '#ef4444'}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={circumference / 4}
            strokeLinecap="round"
            transform="rotate(-90)"
          />
          {/* OEE数值文字 */}
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8"
            fontWeight="bold"
            fill={oeeValue >= 85 ? '#10b981' : oeeValue >= 70 ? '#f59e0b' : '#ef4444'}
          >
            {Math.round(oeeValue)}%
          </text>
          {/* 设备ID */}
          <text
            x="0"
            y="25"
            textAnchor="middle"
            fontSize="6"
            fill="#6b7280"
          >
            {equipment.id}
          </text>
        </g>
      );
    });
  };

  // 渲染设备状态层
  const renderEquipmentStatus = () => {
    if (!activeLayers.includes('equipment')) return null;
    
    return data.equipments.map((equipment, index) => {
      const statusColors = {
        running: '#10b981',  // 绿色 - 运行中
        idle: '#f59e0b',     // 橙色 - 空闲
        fault: '#ef4444'     // 红色 - 故障
      };
      
      const statusNames = {
        running: '运行',
        idle: '空闲', 
        fault: '故障'
      };
      
      return (
        <g key={`status-${equipment.id}`} transform={`translate(${equipment.x}, ${equipment.y})`}>
          {/* 状态圆圈 */}
          <circle
            cx="0"
            cy="0"
            r="12"
            fill={statusColors[equipment.status]}
            stroke="#ffffff"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80"
          />
          {/* 状态图标 */}
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8"
            fill="white"
            fontWeight="bold"
          >
            {equipment.status === 'running' ? '▶' : 
             equipment.status === 'idle' ? '⏸' : '⚠'}
          </text>
          {/* 设备ID */}
          <text
            x="0"
            y="25"
            textAnchor="middle"
            fontSize="6"
            fill="#6b7280"
          >
            {equipment.id}
          </text>
          {/* 状态文字 */}
          <text
            x="0"
            y="35"
            textAnchor="middle"
            fontSize="6"
            fill={statusColors[equipment.status]}
            fontWeight="bold"
          >
            {statusNames[equipment.status]}
          </text>
        </g>
      );
    });
  };

  // 渲染订单位置
  const renderOrders = () => {
    if (!activeLayers.includes('orders')) return null;
    
    return data.orders.map(order => {
      const station = data.workstations.find(ws => ws.id === order.currentStation);
      if (!station) return null;
      
      const priorityColors = {
        urgent: '#ef4444',    // 红色 - 紧急
        high: '#f97316',      // 橙色 - 高优先级
        medium: '#eab308',    // 黄色 - 中优先级
        low: '#22c55e'        // 绿色 - 低优先级
      };
      
      const isSelected = selectedOrder && selectedOrder.id === order.id;
      
      return (
        <g key={order.id} transform={`translate(${station.x}, ${station.y})`}>
          {/* 订单位置高亮圆圈 */}
          <circle
            cx="0"
            cy="-35"
            r={isSelected ? "20" : "15"}
            fill={priorityColors[order.priority]}
            fillOpacity="0.3"
            stroke={priorityColors[order.priority]}
            strokeWidth={isSelected ? "3" : "2"}
            strokeDasharray="5,5"
            className="cursor-pointer hover:opacity-80 animate-pulse"
            onClick={() => setSelectedOrder(order)}
          />
          
          {/* 订单编号 */}
          <text
            x="0"
            y="-30"
            textAnchor="middle"
            fontSize="8"
            fontWeight="bold"
            fill={priorityColors[order.priority]}
            className="cursor-pointer"
            onClick={() => setSelectedOrder(order)}
          >
            {order.id.split('-')[2]}
          </text>
          
          {/* 进度条 */}
          <g transform="translate(-12, -45)">
            {/* 背景条 */}
            <rect
              x="0"
              y="0"
              width="24"
              height="4"
              fill="#e5e7eb"
              rx="2"
            />
            {/* 进度条 */}
            <rect
              x="0"
              y="0"
              width={24 * order.progress / 100}
              height="4"
              fill={priorityColors[order.priority]}
              rx="2"
            />
          </g>
          
          {/* 进度百分比 */}
          <text
            x="0"
            y="-48"
            textAnchor="middle"
            fontSize="6"
            fill="#6b7280"
          >
            {order.progress}%
          </text>
        </g>
      );
    });
  };

  return (
    <div className="w-full h-screen bg-[#0f1419] flex dark">
      {/* 左侧控制面板 */}
      <div className="w-64 bg-[#1a1f2e] shadow-lg flex flex-col border-r border-[#2d3748]">
        {/* 标题区 */}
        <div className="p-4 border-b border-[#2d3748] bg-[#1a1f2e]">
          <h1 className="text-base font-bold text-white">动车组侧墙产线 - 数字孪生地图</h1>
          <p className="text-xs text-gray-400 mt-1">侧墙产线—数字地图 (真实布局)</p>
        </div>

        {/* KPI仪表板 */}
        <div className="p-3 border-b border-[#2d3748]">
          <h3 className="font-bold mb-2 flex items-center text-sm text-white">
            <span className="mr-2">📊</span>实时监控
          </h3>
        </div>

        {/* 专题视图 */}
        <div className="p-3 border-b border-[#2d3748]">
          <h3 className="font-bold mb-2 flex items-center text-sm text-white">
            <span className="mr-2">🎯</span>专题视图
          </h3>
          <div className="space-y-1">
            {Object.entries(viewConfigs).map(([key, config]) => (
              <button
                key={key}
                onClick={() => switchView(key)}
                className={`w-full text-left p-2 rounded text-xs flex items-center justify-between transition-colors ${
                  selectedView === key 
                    ? 'bg-[#2d3748] text-white border-l-4' 
                    : 'hover:bg-[#252b38] text-gray-300'
                }`}
                style={{ borderLeftColor: selectedView === key ? config.color : 'transparent' }}
              >
                <div>
                  <div className="font-medium">{key} {config.title}</div>
                  <div className="text-xs text-gray-400">{config.subtitle}</div>
                </div>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }}></div>
              </button>
            ))}
          </div>
        </div>

        {/* 图层控制 */}
        <div className="p-3 border-b border-[#2d3748]">
          <h3 className="font-bold mb-2 flex items-center text-sm text-white">
            <span className="mr-2">📋</span>图层控制
          </h3>
          <div className="space-y-1">
            {layerConfigs.map(layer => (
              <label 
                key={layer.id} 
                className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                  layer.enabled 
                    ? 'hover:bg-[#252b38] text-gray-300' 
                    : 'opacity-50 cursor-not-allowed bg-[#1a1f2e] text-gray-500'
                }`}
              >
                <input
                  type="checkbox"
                  checked={activeLayers.includes(layer.id)}
                  onChange={() => layer.enabled && toggleLayer(layer.id)}
                  disabled={!layer.enabled}
                  className="mr-3 accent-blue-500"
                />
                <span className="mr-2">{layer.icon}</span>
                <span className="text-xs flex-1">{layer.name}</span>
                <div 
                  className="w-3 h-3 rounded-full ml-2" 
                  style={{ backgroundColor: layer.color }}
                ></div>
              </label>
            ))}
            
            {/* 订单列表按钮 */}
            <button
              onClick={() => setShowOrderList(!showOrderList)}
              className="w-full mt-2 p-2 bg-[#2d3748] hover:bg-[#374151] rounded flex items-center justify-center text-white font-medium transition-colors"
            >
              <span className="mr-2">📋</span>
              {showOrderList ? '隐藏订单列表' : '显示订单列表'}
            </button>
            
            {/* 意面图模式控制 */}
            {activeLayers.includes('spaghetti') && (
              <div className="mt-3 p-3 bg-[#252b38] rounded border border-[#3d4754]">
                <h4 className="font-medium text-white mb-2 flex items-center">
                  <span className="mr-2">🍝</span>意面图模式
                </h4>
                
                {/* 模式切换 */}
                <div className="space-y-2 mb-3">
                  <label className="flex items-center cursor-pointer text-gray-300">
                    <input
                      type="radio"
                      name="spaghettiMode"
                      value="frequency"
                      checked={spaghettiMode === 'frequency'}
                      onChange={(e) => setSpaghettiMode(e.target.value)}
                      className="mr-2 accent-blue-500"
                    />
                    <span className="text-sm">多产品叠加模式</span>
                  </label>
                  <label className="flex items-center cursor-pointer text-gray-300">
                    <input
                      type="radio"
                      name="spaghettiMode"
                      value="single"
                      checked={spaghettiMode === 'single'}
                      onChange={(e) => setSpaghettiMode(e.target.value)}
                      className="mr-2 accent-blue-500"
                    />
                    <span className="text-sm">单产品轨迹模式</span>
                  </label>
                </div>
                
                {/* 产品选择器 */}
                {spaghettiMode === 'single' && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">选择产品:</label>
                    <select
                      value={selectedProduct || ''}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full text-xs p-1 border border-[#3d4754] rounded bg-[#1a1f2e] text-white"
                    >
                      <option value="">请选择产品</option>
                      {data.productTraces.map(product => (
                        <option key={product.productId} value={product.productId}>
                          {product.productId} - {product.productName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* 路径统计 */}
                {spaghettiMode === 'frequency' && (
                  <div className="mt-2 text-xs text-gray-400">
                    <div>路径总数: {Object.keys(data.pathFrequency).length}</div>
                    <div>最高频次: {Math.max(...Object.values(data.pathFrequency))}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 右侧地图区域 */}
      <div className="flex-1 relative overflow-hidden flex flex-col bg-[#0f1419]">
        {/* KPI指标横向显示 */}
        <div className="bg-[#1a1f2e] border-b border-[#2d3748] shadow-sm p-4">
          <div className="grid grid-cols-6 gap-4 text-sm">
            <div className="bg-[#252b38] border border-[#3d4754] p-3 rounded-lg text-center">
              <div className="text-green-400 font-bold text-xs">Flow 产量</div>
              <div className="text-xl font-bold text-green-300">{data.globalKPIs.flow.production.actual}/{data.globalKPIs.flow.production.target}</div>
              <div className="text-xs text-gray-400">件/天</div>
            </div>
            <div className="bg-[#252b38] border border-[#3d4754] p-3 rounded-lg text-center">
              <div className="text-blue-400 font-bold text-xs">PLT 提前期</div>
              <div className="text-xl font-bold text-blue-300">{data.globalKPIs.flow.plt.actual}</div>
              <div className="text-xs text-gray-400">小时</div>
            </div>
            <div className="bg-[#252b38] border border-[#3d4754] p-3 rounded-lg text-center">
              <div className="text-yellow-400 font-bold text-xs">WIP 在制品</div>
              <div className="text-xl font-bold text-yellow-300">{data.globalKPIs.flow.wip.actual}</div>
              <div className="text-xs text-gray-400">件</div>
            </div>
            <div className="bg-[#252b38] border border-[#3d4754] p-3 rounded-lg text-center">
              <div className="text-purple-400 font-bold text-xs">Quality FPY</div>
              <div className="text-xl font-bold text-purple-300">{data.globalKPIs.quality.fpy.actual}%</div>
              <div className="text-xs text-gray-400">一次合格率</div>
            </div>
            <div className="bg-[#252b38] border border-[#3d4754] p-3 rounded-lg text-center">
              <div className="text-orange-400 font-bold text-xs">Cost OEE</div>
              <div className="text-xl font-bold text-orange-300">{data.globalKPIs.cost.oee.actual}%</div>
              <div className="text-xs text-gray-400">设备效率</div>
            </div>
            <div className="bg-[#252b38] border border-[#3d4754] p-3 rounded-lg text-center">
              <div className="text-indigo-400 font-bold text-xs">Flexibility OTD</div>
              <div className="text-xl font-bold text-indigo-300">{data.globalKPIs.flexibility.otd.actual}%</div>
              <div className="text-xs text-gray-400">准时交付</div>
            </div>
          </div>
        </div>

        {/* 地图容器 */}
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 overflow-auto">
            {/* SVG地图 */}
            <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="0 0 800 400"
            style={{ transform: `scale(${scale})` }}
            className="bg-[#0f1419]"
          >
            {/* 箭头标记 */}
            <defs>
              <marker
                id="arrowMain"
                markerWidth="12"
                markerHeight="8"
                refX="11"
                refY="4"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon
                  points="0 0, 12 4, 0 8"
                  fill={DESIGN_TOKENS.colors.mainFlow}
                  stroke={DESIGN_TOKENS.colors.mainFlow}
                  strokeWidth="1"
                />
              </marker>
              <marker
                id="arrowWaterSpider"
                markerWidth="10"
                markerHeight="6"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon
                  points="0 0, 10 3, 0 6"
                  fill={DESIGN_TOKENS.colors.waterSpider}
                  stroke={DESIGN_TOKENS.colors.waterSpider}
                  strokeWidth="1"
                />
              </marker>
            </defs>
            
            {/* 产线边界 */}
            <rect
              x="10"
              y="10"
              width="780"
              height="380"
              fill="none"
              stroke="#3d4754"
              strokeWidth="2"
              strokeDasharray="10,5"
            />

            {/* 工序区域标识 */}
            {/* 上排工序区域 */}
            <rect x="30" y="50" width="320" height="120" fill="none" stroke="#3d4754" strokeWidth="1" strokeDasharray="5,5" />
            <text x="190" y="45" textAnchor="middle" fontSize="12" fill="#fbbf24" fontWeight="bold">组焊工序区</text>
            
            <rect x="390" y="50" width="60" height="120" fill="none" stroke="#3d4754" strokeWidth="1" strokeDasharray="5,5" />
            <text x="420" y="45" textAnchor="middle" fontSize="12" fill="#fbbf24" fontWeight="bold">调修工序区</text>
            
            <rect x="490" y="65" width="140" height="50" fill="none" 
              stroke={activeLayers.includes('bottleneck') ? '#ef4444' : '#3d4754'} 
              strokeWidth={activeLayers.includes('bottleneck') ? '2' : '1'} 
              strokeDasharray="5,5" />
            <text x="560" y="60" textAnchor="middle" fontSize="12" fill="#fbbf24" fontWeight="bold">加工工序区</text>
            
            <rect x="690" y="50" width="60" height="120" fill="none" stroke="#3d4754" strokeWidth="1" strokeDasharray="5,5" />
            <text x="720" y="45" textAnchor="middle" fontSize="12" fill="#fbbf24" fontWeight="bold">大线打磨工序区</text>

            {/* 黄色过道 */}
            <rect x="10" y="230" width="780" height="40" fill="#fbbf24" opacity="0.2" />
            <text x="400" y="255" textAnchor="middle" fontSize="14" fill="#fbbf24" fontWeight="bold">过道</text>

            {/* 下排工序区域 */}
            <rect x="50" y="275" width="140" height="50" fill="none" 
              stroke={activeLayers.includes('bottleneck') ? '#ef4444' : '#3d4754'} 
              strokeWidth={activeLayers.includes('bottleneck') ? '2' : '1'} 
              strokeDasharray="5,5" />
            <text x="120" y="270" textAnchor="middle" fontSize="12" fill="#fbbf24" fontWeight="bold">加工工序区</text>
            
            <rect x="250" y="275" width="60" height="80" fill="none" stroke="#3d4754" strokeWidth="1" strokeDasharray="5,5" />
            <text x="280" y="270" textAnchor="middle" fontSize="12" fill="#fbbf24" fontWeight="bold">修补工序区</text>
            
            <rect x="400" y="285" width="60" height="40" fill="none" stroke="#3d4754" strokeWidth="1" strokeDasharray="5,5" />
            <text x="430" y="280" textAnchor="middle" fontSize="12" fill="#fbbf24" fontWeight="bold">精细打磨工序区</text>
            
            <rect x="550" y="275" width="180" height="80" fill="none" stroke="#3d4754" strokeWidth="1" strokeDasharray="5,5" />
            <text x="640" y="270" textAnchor="middle" fontSize="12" fill="#fbbf24" fontWeight="bold">组焊工序区（附件）</text>

            {/* 渲染各种元素 */}
            {renderMainFlow()}
            {renderWaterSpiderRoutes()}
            {renderSpaghettiPaths()}
            
            {/* 渲染在制品位置 */}
            {renderWIPPositions()}
            
            {/* 渲染安灯报警 */}
            {renderAndons()}
            
            {/* 渲染设备OEE层 */}
            {renderOEE()}
            
            {/* 渲染设备状态层 */}
            {renderEquipmentStatus()}
            
            {/* 渲染天车系统 */}
            {renderCranes()}
            
            {/* 渲染订单位置 */}
            {renderOrders()}
            
            {/* 渲染工位 - 放在最后确保在最上层 */}
            {data.workstations.map(renderWorkstation)}
            </svg>
          </div>
          
          {/* 左下角控制面板 */}
          <div className="absolute bottom-4 left-4 bg-[#1a1f2e] rounded-lg shadow-lg border border-[#2d3748] p-3 z-40">
            {/* 图例说明 */}
            <div className="mb-3">
              <h4 className="font-bold mb-2 flex items-center text-sm text-white">
                <span className="mr-2">📖</span>图例说明
              </h4>
              <div className="space-y-1 text-xs text-gray-300">
                <div className="flex items-center">
                  <div className="w-4 h-2 bg-purple-500 mr-2"></div>
                  <span>主物流</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-2 bg-cyan-500 mr-2" style={{ borderStyle: 'dashed', borderWidth: '1px' }}></div>
                  <span>水蜘蛛路线</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-2 bg-red-600 mr-2" style={{ borderStyle: 'dashed', borderWidth: '1px' }}></div>
                  <span>返工路径</span>
                </div>
              </div>
            </div>
            
            {/* 缩放控制 */}
            <div className="border-t border-[#2d3748] pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white">缩放控制</span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                    className="p-1 hover:bg-[#252b38] rounded text-white"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="px-2 py-1 text-xs bg-[#252b38] rounded text-white">{Math.round(scale * 100)}%</span>
                  <button
                    onClick={() => setScale(Math.min(2, scale + 0.1))}
                    className="p-1 hover:bg-[#252b38] rounded text-white"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setScale(1)}
                    className="p-1 hover:bg-[#252b38] rounded text-white"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WIP详情浮动面板 - 右下角显示 */}
        {selectedWIP && (
          <div className="fixed bottom-4 right-4 bg-[#1a1f2e] rounded-lg shadow-xl border border-[#2d3748] p-4 max-w-sm max-h-96 overflow-y-auto z-50">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-white">在制品详情 - {selectedWIP.id}</h3>
              <button
                onClick={() => setSelectedWIP(null)}
                className="text-gray-400 hover:text-white text-xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">工位名称:</span>
                <span className="font-semibold text-white">{selectedWIP.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">在制品数量:</span>
                <span className="font-semibold text-orange-400">{selectedWIP.metrics.wip} 件</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">工序组:</span>
                <span className="font-semibold text-white">{selectedWIP.processGroup}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-white">在制品列表:</h4>
              {selectedWIP.wipDetails.map((item, index) => (
                <div key={index} className="border border-[#2d3748] rounded p-3 text-sm bg-[#252b38]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-white">{item.id}</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.status === 'delayed' ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'
                    }`}>
                      {item.status === 'delayed' ? '延迟' : '正常'}
                    </span>
                  </div>
                  <div className="text-gray-400 space-y-1">
                    <div>产品: {item.name}</div>
                    <div>到达时间: {item.arrivalTime}</div>
                    <div>完成进度: {item.progress}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 状态栏 */}
        <div className="absolute bottom-4 left-4 right-4 bg-[#1a1f2e] bg-opacity-95 rounded-lg p-3 shadow-lg border border-[#2d3748]">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-gray-300">
              <span>更新时间: {data.timestamp.toLocaleTimeString()}</span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                实时更新中
              </span>
            </div>
            <div className="text-xs text-gray-400">
              © 2024 基于侧墙产线数字孪生地图 - 基于真实布局优化
            </div>
          </div>
        </div>
      </div>

      {/* 工位详情悬浮框 - 右下角显示 */}
      {selectedStation && (
        <div className="fixed bottom-4 right-4 bg-[#1a1f2e] rounded-lg shadow-xl border border-[#2d3748] p-4 max-w-sm z-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-white">{selectedStation.name}</h3>
            <button
              onClick={() => setSelectedStation(null)}
              className="text-gray-400 hover:text-white text-xl font-bold"
            >
              ×
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">工位ID:</span>
              <span className="font-mono font-semibold text-white">{selectedStation.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">工序组:</span>
              <span className="font-semibold text-white">{selectedStation.processGroup}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">当前状态:</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                selectedStation.metrics.status === 'running' ? 'bg-green-900 text-green-300' :
                selectedStation.metrics.status === 'idle' ? 'bg-gray-700 text-gray-300' :
                'bg-red-900 text-red-300'
              }`}>
                {selectedStation.metrics.status === 'running' ? '运行中' :
                 selectedStation.metrics.status === 'idle' ? '空闲' : '故障'}
              </span>
            </div>
            {selectedStation.stdCT && (
              <div className="flex justify-between">
                <span className="text-gray-400">周期时间:</span>
                <span className="font-semibold text-white">{selectedStation.metrics.ct} min</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">一次合格率:</span>
              <span className="font-semibold text-green-400">{selectedStation.metrics.fpy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">设备效率:</span>
              <span className="font-semibold text-blue-400">{selectedStation.metrics.oee}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">在制品:</span>
              <span className="font-semibold text-orange-400">{selectedStation.metrics.wip} 件</span>
            </div>
          </div>
        </div>
      )}

      {/* 安灯详情浮动面板 - 右下角显示 */}
      {selectedAndon && (
        <div className="fixed bottom-4 right-4 bg-[#1a1f2e] rounded-lg shadow-xl border border-red-800 p-4 max-w-sm z-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-red-400 flex items-center">
              <span className="mr-2">🚨</span>
              安灯报警详情
            </h3>
            <button
              onClick={() => setSelectedAndon(null)}
              className="text-gray-400 hover:text-white text-xl font-bold"
            >
              ×
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">工位ID:</span>
              <span className="font-mono font-semibold text-white">{selectedAndon.stationId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">工位名称:</span>
              <span className="font-semibold text-white">{selectedAndon.station.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">异常类型:</span>
              <span className="font-semibold text-red-400">{selectedAndon.message}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">严重程度:</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                selectedAndon.severity === 'critical' ? 'bg-red-900 text-red-300' :
                selectedAndon.severity === 'high' ? 'bg-red-900 text-red-300' :
                'bg-yellow-900 text-yellow-300'
              }`}>
                {selectedAndon.severity === 'critical' ? '严重' :
                 selectedAndon.severity === 'high' ? '高' : '中等'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">触发时间:</span>
              <span className="font-semibold text-white">{selectedAndon.timestamp.toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">持续时间:</span>
              <span className="font-semibold text-orange-400">
                {Math.floor((new Date() - selectedAndon.timestamp) / 60000)} 分钟
              </span>
            </div>
            <div className="mt-3 p-2 bg-red-900 bg-opacity-30 rounded border border-red-800">
              <div className="text-xs text-red-300 font-semibold mb-1">建议处理措施:</div>
              <div className="text-xs text-red-400">
                {selectedAndon.message === '焊接质量异常' ? 
                  '1. 检查焊接参数设置\n2. 检查焊材质量\n3. 联系质量工程师' :
                  '1. 立即停机检查\n2. 更换磨损刀具\n3. 调整切削参数'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 订单详情面板 - 右下角显示 */}
      {selectedOrder && (
        <div className="fixed bottom-4 right-4 bg-[#1a1f2e] rounded-lg shadow-xl border border-purple-800 p-4 max-w-sm z-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-purple-400">订单详情 - {selectedOrder.id}</h3>
            <button
              onClick={() => setSelectedOrder(null)}
              className="text-gray-400 hover:text-white text-xl font-bold"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-semibold text-gray-400">产品名称:</span>
              <div className="text-purple-300 font-medium">{selectedOrder.productName}</div>
            </div>
            
            <div>
              <span className="font-semibold text-gray-400">规格:</span>
              <div className="text-gray-300">{selectedOrder.specification}</div>
            </div>
            
            <div>
              <span className="font-semibold text-gray-400">当前位置:</span>
              <div className="text-blue-400 font-medium">{selectedOrder.currentStationName}</div>
            </div>
            
            <div>
              <span className="font-semibold text-gray-400">当前工序:</span>
              <div className="text-green-400 font-medium">{selectedOrder.currentProcess}</div>
            </div>
            
            <div>
              <span className="font-semibold text-gray-400">下一工序:</span>
              <div className="text-orange-400">{selectedOrder.nextProcess}</div>
            </div>
            
            <div>
              <span className="font-semibold text-gray-400">完成进度:</span>
              <div className="flex items-center mt-1">
                <div className="flex-1 bg-[#252b38] rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${selectedOrder.progress}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-purple-400 font-bold">{selectedOrder.progress}%</span>
              </div>
            </div>
            
            <div>
              <span className="font-semibold text-gray-400">已完成工序:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedOrder.completedProcesses.map((process, index) => (
                  <span key={index} className="px-2 py-1 bg-green-900 text-green-300 rounded text-xs">
                    {process}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <span className="font-semibold text-gray-400">预计完成时间:</span>
              <div className="text-blue-400 font-medium">
                {selectedOrder.estimatedCompletion.toLocaleString('zh-CN')}
              </div>
            </div>
            
            <div>
              <span className="font-semibold text-gray-400">优先级:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                selectedOrder.priority === 'urgent' ? 'bg-red-900 text-red-300' :
                selectedOrder.priority === 'high' ? 'bg-orange-900 text-orange-300' :
                selectedOrder.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                'bg-green-900 text-green-300'
              }`}>
                {selectedOrder.priority === 'urgent' ? '紧急' :
                 selectedOrder.priority === 'high' ? '高' :
                 selectedOrder.priority === 'medium' ? '中' : '低'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 订单列表面板 - 左下角显示 */}
      {showOrderList && (
        <div className="fixed bottom-4 left-4 bg-[#1a1f2e] rounded-lg shadow-xl border border-[#2d3748] p-4 max-w-md z-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-white">在制品订单列表</h3>
            <button
              onClick={() => setShowOrderList(false)}
              className="text-gray-400 hover:text-white text-xl font-bold"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.orders.map(order => (
              <div 
                key={order.id}
                className={`p-3 border rounded cursor-pointer hover:bg-[#252b38] transition-colors ${
                  selectedOrder && selectedOrder.id === order.id ? 'border-purple-500 bg-purple-900 bg-opacity-30' : 'border-[#2d3748]'
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-white">{order.id}</div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    order.priority === 'urgent' ? 'bg-red-900 text-red-300' :
                    order.priority === 'high' ? 'bg-orange-900 text-orange-300' :
                    order.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-green-900 text-green-300'
                  }`}>
                    {order.priority === 'urgent' ? '紧急' :
                     order.priority === 'high' ? '高' :
                     order.priority === 'medium' ? '中' : '低'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-300 mb-1">{order.productName}</div>
                <div className="text-sm text-blue-400 mb-2">{order.currentStationName}</div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-16 bg-[#252b38] rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${order.progress}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-xs text-purple-400 font-bold">{order.progress}%</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {Math.ceil((order.estimatedCompletion - new Date()) / (1000 * 60 * 60))}h后完成
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealProductionMap;

