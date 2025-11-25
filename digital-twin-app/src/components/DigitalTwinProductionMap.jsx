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

// ============= 生成侧墙产线数据 (基于文档U型布局) =============
const generateSidewallProductionData = () => {
  const currentTime = new Date();
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);
  
  // U型布局工位定义（按文档要求细化到每个工位）
  const workstations = [
    // ===== 左侧垂直段（下料预处理） =====
    { id: 'RAW_01', name: '原材料-铝板', x: 100, y: 100, type: 'storage' },
    { id: 'RAW_02', name: '原材料-型材', x: 100, y: 150, type: 'storage' },
    { id: 'CUT_01', name: '激光切割-1', x: 100, y: 200, type: 'process' },
    { id: 'CUT_02', name: '激光切割-2', x: 100, y: 250, type: 'process' },
    { id: 'CUT_03', name: '激光切割-3', x: 100, y: 300, type: 'process' },
    { id: 'DEB_01', name: '去毛刺-1', x: 100, y: 350, type: 'process' },
    { id: 'DEB_02', name: '去毛刺-2', x: 100, y: 400, type: 'process' },
    { id: 'BUF_01', name: '切割缓冲区', x: 100, y: 450, type: 'buffer' },
    
    // ===== 底部水平段（焊接核心区） =====
    { id: 'POS_01', name: '骨架定位-1', x: 150, y: 500, type: 'process' },
    { id: 'POS_02', name: '骨架定位-2', x: 200, y: 500, type: 'process' },
    { id: 'WLD_01', name: '点焊机器人-1', x: 250, y: 500, type: 'bottleneck' },
    { id: 'WLD_02', name: '点焊机器人-2', x: 300, y: 500, type: 'bottleneck' },
    { id: 'WLD_03', name: '点焊机器人-3', x: 350, y: 500, type: 'bottleneck' },
    { id: 'WLD_04', name: '弧焊工位-1', x: 400, y: 500, type: 'process' },
    { id: 'WLD_05', name: '弧焊工位-2', x: 450, y: 500, type: 'process' },
    { id: 'WLD_QC', name: '焊缝检测', x: 500, y: 500, type: 'quality' },
    { id: 'BUF_02', name: '焊接缓冲区', x: 550, y: 500, type: 'buffer' },
    
    // ===== 右侧上升段（蒙皮铆接） =====
    { id: 'SKN_01', name: '蒙皮预装-1', x: 600, y: 500, type: 'process' },
    { id: 'SKN_02', name: '蒙皮预装-2', x: 650, y: 500, type: 'process' },
    { id: 'RVT_01', name: '铆接工位-1', x: 700, y: 450, type: 'process' },
    { id: 'RVT_02', name: '铆接工位-2', x: 700, y: 400, type: 'process' },
    { id: 'RVT_03', name: '铆接工位-3', x: 700, y: 350, type: 'process' },
    { id: 'RVT_QC', name: '铆接检验', x: 700, y: 300, type: 'quality' },
    { id: 'BUF_03', name: '涂装缓冲区', x: 700, y: 250, type: 'buffer' },
    
    // ===== 顶部水平段（涂装密封） =====
    { id: 'SRF_01', name: '表面处理-1', x: 700, y: 200, type: 'process' },
    { id: 'SRF_02', name: '表面处理-2', x: 650, y: 200, type: 'process' },
    { id: 'PNT_01', name: '喷涂线-1', x: 600, y: 200, type: 'process' },
    { id: 'PNT_02', name: '喷涂线-2', x: 550, y: 200, type: 'process' },
    { id: 'SEL_01', name: '涂胶密封-1', x: 500, y: 200, type: 'quality_alert' },
    { id: 'SEL_02', name: '涂胶密封-2', x: 450, y: 200, type: 'quality_alert' },
    { id: 'SEL_QC', name: '密封检测', x: 400, y: 200, type: 'quality' },
    { id: 'BUF_04', name: '总装缓冲区', x: 350, y: 200, type: 'buffer' },
    
    // ===== 左侧下降段（总装） =====
    { id: 'WIN_01', name: '窗框安装-1', x: 300, y: 200, type: 'process' },
    { id: 'WIN_02', name: '窗框安装-2', x: 250, y: 200, type: 'process' },
    { id: 'INT_01', name: '内饰安装-1', x: 200, y: 250, type: 'process' },
    { id: 'INT_02', name: '内饰安装-2', x: 200, y: 300, type: 'process' },
    { id: 'ELE_01', name: '电气布线-1', x: 200, y: 350, type: 'process' },
    { id: 'ELE_02', name: '电气布线-2', x: 200, y: 400, type: 'process' },
    
    // ===== 终检区域（中心） =====
    { id: 'DIM_01', name: '尺寸检测', x: 350, y: 350, type: 'quality' },
    { id: 'AIR_01', name: '气密测试', x: 400, y: 350, type: 'quality' },
    { id: 'FIN_01', name: '终检站-1', x: 450, y: 350, type: 'quality' },
    { id: 'FIN_02', name: '终检站-2', x: 500, y: 350, type: 'quality' },
    { id: 'FGS_01', name: '成品暂存', x: 550, y: 350, type: 'storage' }
  ];
  
  // 为每个工位生成实时数据
  workstations.forEach(ws => {
    ws.metrics = {
      ct: ws.type === 'bottleneck' ? random(240, 260) : random(180, 200),
      takt: 195,
      fpy: ws.type === 'quality_alert' ? randomFloat(0.88, 0.92) : randomFloat(0.93, 0.98),
      oee: ws.type === 'bottleneck' ? randomFloat(0.75, 0.82) : randomFloat(0.83, 0.91),
      wip: ws.type === 'buffer' ? random(10, 20) : random(1, 5),
      capacity: ws.type === 'buffer' ? 20 : 5,
      status: ws.id === 'WLD_03' ? 'breakdown' : 
              ws.type === 'bottleneck' ? 'busy' : 
              random(1, 10) > 8 ? 'idle' : 'running'
    };
  });
  
  // 主生产流程连接（U型流）
  const mainFlow = [
    'RAW_01->CUT_01', 'RAW_02->CUT_02', 'CUT_01->CUT_03', 'CUT_02->CUT_03',
    'CUT_03->DEB_01', 'DEB_01->DEB_02', 'DEB_02->BUF_01',
    'BUF_01->POS_01', 'POS_01->POS_02', 'POS_02->WLD_01',
    'WLD_01->WLD_02', 'WLD_02->WLD_03', 'WLD_03->WLD_04',
    'WLD_04->WLD_05', 'WLD_05->WLD_QC', 'WLD_QC->BUF_02',
    'BUF_02->SKN_01', 'SKN_01->SKN_02', 'SKN_02->RVT_01',
    'RVT_01->RVT_02', 'RVT_02->RVT_03', 'RVT_03->RVT_QC',
    'RVT_QC->BUF_03', 'BUF_03->SRF_01', 'SRF_01->SRF_02',
    'SRF_02->PNT_01', 'PNT_01->PNT_02', 'PNT_02->SEL_01',
    'SEL_01->SEL_02', 'SEL_02->SEL_QC', 'SEL_QC->BUF_04',
    'BUF_04->WIN_01', 'WIN_01->WIN_02', 'WIN_02->INT_01',
    'INT_01->INT_02', 'INT_02->ELE_01', 'ELE_01->ELE_02',
    'ELE_02->DIM_01', 'DIM_01->AIR_01', 'AIR_01->FIN_01',
    'FIN_01->FIN_02', 'FIN_02->FGS_01'
  ];
  
  // 水蜘蛛路线（物料配送）
  const waterSpiderRoutes = [
    { from: 'RAW_01', to: 'POS_01', type: 'supply' },
    { from: 'RAW_02', to: 'SKN_01', type: 'supply' },
    { from: 'BUF_01', to: 'RVT_01', type: 'parts' },
    { from: 'BUF_02', to: 'PNT_01', type: 'parts' },
    { from: 'BUF_03', to: 'WIN_01', type: 'parts' },
    { from: 'BUF_04', to: 'INT_01', type: 'parts' }
  ];
  
  // 返工路径
  const reworkPaths = [
    { from: 'WLD_QC', to: 'WLD_01', reason: '焊缝不合格' },
    { from: 'RVT_QC', to: 'RVT_01', reason: '铆接松动' },
    { from: 'SEL_QC', to: 'SEL_01', reason: '密封泄漏' },
    { from: 'FIN_01', to: 'WIN_01', reason: '装配错误' },
    { from: 'AIR_01', to: 'SEL_01', reason: '气密不达标' }
  ];
  
  // AGV运输路径
  const agvPaths = [
    { from: 'CUT_03', to: 'POS_01', vehicle: 'AGV-001' },
    { from: 'WLD_QC', to: 'SKN_01', vehicle: 'AGV-002' },
    { from: 'RVT_QC', to: 'SRF_01', vehicle: 'AGV-003' },
    { from: 'SEL_QC', to: 'WIN_01', vehicle: 'AGV-004' },
    { from: 'ELE_02', to: 'DIM_01', vehicle: 'AGV-005' }
  ];
  
  // 意大利面图路径（实际物流复杂路径）
  const spaghettiPaths = [];
  // 生成工位间的复杂交叉流转
  for (let i = 0; i < 30; i++) {
    const fromIdx = random(0, workstations.length - 1);
    const toIdx = random(0, workstations.length - 1);
    if (fromIdx !== toIdx) {
      spaghettiPaths.push({
        from: workstations[fromIdx].id,
        to: workstations[toIdx].id,
        volume: random(1, 10),
        frequency: random(1, 5)
      });
    }
  }
  
  // 在制品实时位置
  const productsInTransit = [];
  for (let i = 1; i <= 25; i++) {
    const pathIdx = random(0, mainFlow.length - 1);
    const [from, to] = mainFlow[pathIdx].split('->');
    productsInTransit.push({
      id: `P${String(i).padStart(3, '0')}`,
      name: `侧墙#A${String(i).padStart(3, '0')}`,
      from,
      to,
      progress: Math.random(),
      status: random(1, 10) > 7 ? 'delayed' : random(1, 10) > 9 ? 'blocked' : 'normal'
    });
  }
  
  // AGV实时位置
  const agvs = [
    { id: 'AGV-001', x: 250, y: 450, battery: 85, status: 'working', cargo: '骨架组件' },
    { id: 'AGV-002', x: 550, y: 450, battery: 72, status: 'working', cargo: '蒙皮' },
    { id: 'AGV-003', x: 650, y: 300, battery: 91, status: 'idle', cargo: null },
    { id: 'AGV-004', x: 400, y: 250, battery: 45, status: 'charging', cargo: null },
    { id: 'AGV-005', x: 300, y: 350, battery: 68, status: 'working', cargo: '内饰件' }
  ];
  
  // 行车系统
  const cranes = [
    { id: 'CRANE-01', x: 400, y: 100, span: { x1: 100, x2: 700 }, load: '大型侧墙骨架', status: 'moving' },
    { id: 'CRANE-02', x: 400, y: 550, span: { x1: 100, x2: 700 }, load: null, status: 'idle' }
  ];
  
  // 安灯报警
  const andons = [
    { stationId: 'WLD_03', type: 'breakdown', message: '点焊机器人3故障停机', severity: 'critical' },
    { stationId: 'SEL_01', type: 'quality', message: '密封泄漏率超标', severity: 'high' },
    { stationId: 'BUF_02', type: 'wip', message: 'WIP超出红线', severity: 'medium' }
  ];
  
  // 全局KPI（符合文档FQCF要求）
  return {
    workstations,
    mainFlow,
    waterSpiderRoutes,
    reworkPaths,
    agvPaths,
    spaghettiPaths,
    productsInTransit,
    agvs,
    cranes,
    andons,
    globalKPIs: {
      // Flow流动指标
      production: { daily: random(80, 95), target: 100 },
      taktAchievement: randomFloat(0.85, 0.95),
      plt: random(8, 12), // 生产提前期
      pce: randomFloat(0.35, 0.45), // 价值增值比
      totalWip: random(180, 250),
      
      // Quality质量指标
      fpy: randomFloat(0.92, 0.97), // 一次合格率
      rty: randomFloat(0.85, 0.92), // 滚动良率
      
      // Cost成本指标
      oee: randomFloat(0.80, 0.88), // 设备综合效率
      
      // Flexibility柔性指标
      otd: randomFloat(0.88, 0.95), // 准时交付率
      epei: random(2, 5) // 每种产品生产间隔
    },
    timestamp: currentTime
  };
};

// ============= 主组件 =============
const DigitalTwinProductionMap = () => {
  const [data, setData] = useState(generateSidewallProductionData());
  const [selectedView, setSelectedView] = useState('flow'); // flow, quality, efficiency, planning
  const [activeLayers, setActiveLayers] = useState(['stations', 'mainFlow', 'wip']);
  const [selectedStation, setSelectedStation] = useState(null);
  const [showSpaghetti, setShowSpaghetti] = useState(false);
  const [scale, setScale] = useState(1);
  const svgRef = useRef(null);
  
  // 数据刷新
  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateSidewallProductionData());
    }, DESIGN_TOKENS.animation.refreshInterval);
    return () => clearInterval(interval);
  }, []);
  
  // 专题视图配置（严格按文档）
  const viewConfigs = {
    flow: {
      name: 'Flow 流动视图',
      layers: ['stations', 'mainFlow', 'wip', 'bottleneck'],
      focus: '生产节奏与物流'
    },
    quality: {
      name: 'Quality 质量视图',
      layers: ['stations', 'quality', 'rework', 'andon'],
      focus: '质量状态与异常'
    },
    efficiency: {
      name: 'Efficiency 效率视图',
      layers: ['stations', 'oee', 'equipment', 'agv'],
      focus: '设备效率与成本'
    },
    planning: {
      name: '计划与柔性视图',
      layers: ['stations', 'orders', 'waterSpider', 'crane'],
      focus: '订单交付与产线柔性'
    },
    spaghetti: {
      name: 'Spaghetti 意面图',
      layers: ['stations', 'spaghetti'],
      focus: '物流路径复杂度'
    }
  };
  
  // 图层配置（按文档要求）
  const layerConfigs = {
    stations: { name: 'WIP在制品层', active: true },
    mainFlow: { name: '主物流路径', active: true },
    wip: { name: '缓冲区状态', active: true },
    bottleneck: { name: '瓶颈标识', active: false },
    quality: { name: '品质层', active: false },
    rework: { name: '返工路径', active: false },
    andon: { name: '安灯层', active: false },
    oee: { name: '设备OEE层', active: false },
    equipment: { name: '设备状态', active: false },
    agv: { name: 'AGV路径', active: false },
    orders: { name: '订单位置', active: false },
    waterSpider: { name: '水蜘蛛路线', active: false },
    crane: { name: '行车系统', active: false },
    spaghetti: { name: '意大利面图', active: false }
  };
  
  // 切换视图
  const handleViewChange = (view) => {
    setSelectedView(view);
    setActiveLayers(viewConfigs[view].layers);
    setShowSpaghetti(view === 'spaghetti');
  };
  
  // 获取状态颜色（遵循绿黄红规则）
  const getStatusColor = (value, threshold) => {
    if (!threshold) return DESIGN_TOKENS.colors.neutral;
    const ratio = value / threshold;
    if (ratio <= 0.9) return DESIGN_TOKENS.colors.normal;
    if (ratio <= 1.0) return DESIGN_TOKENS.colors.warning;
    return DESIGN_TOKENS.colors.error;
  };
  
  // 渲染工位
  const renderWorkstation = (ws) => {
    const isBottleneck = ws.type === 'bottleneck';
    const hasAlert = ws.type === 'quality_alert';
    const isBuffer = ws.type === 'buffer';
    const statusColor = ws.metrics.status === 'breakdown' ? DESIGN_TOKENS.colors.error :
                       ws.metrics.status === 'idle' ? DESIGN_TOKENS.colors.neutral :
                       ws.metrics.status === 'busy' ? DESIGN_TOKENS.colors.warning :
                       DESIGN_TOKENS.colors.primary;
    
    return (
      <g key={ws.id} transform={`translate(${ws.x}, ${ws.y})`}>
        {/* 工位主体 */}
        <rect
          x="-20"
          y="-15"
          width="40"
          height="30"
          fill={DESIGN_TOKENS.colors.white}
          stroke={isBottleneck ? DESIGN_TOKENS.colors.error : 
                 hasAlert ? DESIGN_TOKENS.colors.warning :
                 statusColor}
          strokeWidth={isBottleneck ? "3" : "2"}
          strokeDasharray={isBottleneck ? "5,3" : "none"}
          rx="4"
          className="cursor-pointer"
          onClick={() => setSelectedStation(ws)}
        />
        
        {/* 工位名称 */}
        <text
          x="0"
          y="-20"
          textAnchor="middle"
          fontSize="9"
          fill={DESIGN_TOKENS.colors.dark}
        >
          {ws.name}
        </text>
        
        {/* 工位ID */}
        <text
          x="0"
          y="0"
          textAnchor="middle"
          fontSize="8"
          fill={DESIGN_TOKENS.colors.dark}
          fontWeight="bold"
        >
          {ws.id}
        </text>
        
        {/* WIP显示 */}
        {activeLayers.includes('wip') && ws.metrics.wip > 0 && (
          <g transform="translate(25, -10)">
            <circle 
              cx="0" 
              cy="0" 
              r="8" 
              fill={ws.metrics.wip > ws.metrics.capacity * 0.8 ? DESIGN_TOKENS.colors.error : DESIGN_TOKENS.colors.warning}
            />
            <text x="0" y="3" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">
              {ws.metrics.wip}
            </text>
          </g>
        )}
        
        {/* 节拍显示 */}
        {activeLayers.includes('mainFlow') && ws.type === 'process' && (
          <text
            x="0"
            y="10"
            textAnchor="middle"
            fontSize="7"
            fill={getStatusColor(ws.metrics.ct, ws.metrics.takt)}
          >
            CT:{ws.metrics.ct}s
          </text>
        )}
        
        {/* 质量显示 */}
        {activeLayers.includes('quality') && ws.type !== 'storage' && ws.type !== 'buffer' && (
          <text
            x="0"
            y="25"
            textAnchor="middle"
            fontSize="7"
            fill={ws.metrics.fpy < 0.92 ? DESIGN_TOKENS.colors.error : DESIGN_TOKENS.colors.normal}
          >
            FPY:{(ws.metrics.fpy * 100).toFixed(0)}%
          </text>
        )}
        
        {/* OEE显示 */}
        {activeLayers.includes('oee') && ws.type !== 'storage' && ws.type !== 'buffer' && (
          <g transform="translate(0, 35)">
            <rect
              x="-15"
              y="0"
              width="30"
              height="3"
              fill={DESIGN_TOKENS.colors.neutral}
              rx="1"
            />
            <rect
              x="-15"
              y="0"
              width={30 * ws.metrics.oee}
              height="3"
              fill={ws.metrics.oee < 0.85 ? DESIGN_TOKENS.colors.error : DESIGN_TOKENS.colors.normal}
              rx="1"
            />
          </g>
        )}
        
        {/* 瓶颈标识 */}
        {isBottleneck && activeLayers.includes('bottleneck') && (
          <circle
            cx="0"
            cy="-25"
            r="5"
            fill={DESIGN_TOKENS.colors.error}
            className="animate-pulse"
          />
        )}
      </g>
    );
  };
  
  // 渲染主物流路径
  const renderMainFlow = () => {
    if (!activeLayers.includes('mainFlow')) return null;
    
    return data.mainFlow.map((flow, index) => {
      const [fromId, toId] = flow.split('->');
      const from = data.workstations.find(ws => ws.id === fromId);
      const to = data.workstations.find(ws => ws.id === toId);
      if (!from || !to) return null;
      
      return (
        <g key={index}>
          <line
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={DESIGN_TOKENS.colors.mainFlow}
            strokeWidth="2"
            opacity="0.6"
            markerEnd="url(#arrowMainFlow)"
          />
          {/* 流动动画 */}
          <circle r="3" fill={DESIGN_TOKENS.colors.mainFlow}>
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              path={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
            />
          </circle>
        </g>
      );
    });
  };
  
  // 渲染水蜘蛛路线
  const renderWaterSpider = () => {
    if (!activeLayers.includes('waterSpider')) return null;
    
    return data.waterSpiderRoutes.map((route, index) => {
      const from = data.workstations.find(ws => ws.id === route.from);
      const to = data.workstations.find(ws => ws.id === route.to);
      if (!from || !to) return null;
      
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2 - 50;
      
      return (
        <g key={index}>
          <path
            d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
            stroke={DESIGN_TOKENS.colors.waterSpider}
            strokeWidth="2"
            strokeDasharray="10,5"
            fill="none"
            opacity="0.5"
            markerEnd="url(#arrowWaterSpider)"
          />
          <text
            x={midX}
            y={midY}
            textAnchor="middle"
            fontSize="8"
            fill={DESIGN_TOKENS.colors.waterSpider}
          >
            🕷️ {route.type}
          </text>
        </g>
      );
    });
  };
  
  // 渲染返工路径
  const renderRework = () => {
    if (!activeLayers.includes('rework')) return null;
    
    return data.reworkPaths.map((path, index) => {
      const from = data.workstations.find(ws => ws.id === path.from);
      const to = data.workstations.find(ws => ws.id === path.to);
      if (!from || !to) return null;
      
      const midX = (from.x + to.x) / 2 + 30;
      const midY = (from.y + to.y) / 2;
      
      return (
        <g key={index}>
          <path
            d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
            stroke={DESIGN_TOKENS.colors.rework}
            strokeWidth="2"
            strokeDasharray="5,5"
            fill="none"
            opacity="0.7"
            markerEnd="url(#arrowRework)"
          />
          <text
            x={midX - 20}
            y={midY}
            fontSize="7"
            fill={DESIGN_TOKENS.colors.rework}
          >
            {path.reason}
          </text>
        </g>
      );
    });
  };
  
  // 渲染意大利面图
  const renderSpaghetti = () => {
    if (!showSpaghetti) return null;
    
    return data.spaghettiPaths.map((path, index) => {
      const from = data.workstations.find(ws => ws.id === path.from);
      const to = data.workstations.find(ws => ws.id === path.to);
      if (!from || !to) return null;
      
      const randomOffset = 50 * (Math.random() - 0.5);
      const midX = (from.x + to.x) / 2 + randomOffset;
      const midY = (from.y + to.y) / 2 + randomOffset;
      
      return (
        <path
          key={index}
          d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
          stroke={`hsla(${index * 10}, 70%, 50%, 0.3)`}
          strokeWidth={path.volume / 3}
          fill="none"
        />
      );
    });
  };
  
  // 渲染在制品
  const renderProductsInTransit = () => {
    return data.productsInTransit.map(product => {
      const from = data.workstations.find(ws => ws.id === product.from);
      const to = data.workstations.find(ws => ws.id === product.to);
      if (!from || !to) return null;
      
      const x = from.x + (to.x - from.x) * product.progress;
      const y = from.y + (to.y - from.y) * product.progress;
      
      const color = product.status === 'blocked' ? DESIGN_TOKENS.colors.error :
                   product.status === 'delayed' ? DESIGN_TOKENS.colors.warning :
                   DESIGN_TOKENS.colors.primary;
      
      return (
        <g key={product.id}>
          <circle
            cx={x}
            cy={y}
            r="6"
            fill={color}
            stroke="white"
            strokeWidth="1"
          />
          <text
            x={x}
            y={y + 2}
            textAnchor="middle"
            fontSize="6"
            fill="white"
            fontWeight="bold"
          >
            {product.id.substring(1)}
          </text>
        </g>
      );
    });
  };
  
  // 渲染AGV
  const renderAGVs = () => {
    if (!activeLayers.includes('agv')) return null;
    
    return data.agvs.map(agv => (
      <g key={agv.id} transform={`translate(${agv.x}, ${agv.y})`}>
        <rect
          x="-15"
          y="-8"
          width="30"
          height="16"
          fill={agv.status === 'working' ? DESIGN_TOKENS.colors.agv : DESIGN_TOKENS.colors.neutral}
          rx="3"
        />
        <text
          x="0"
          y="3"
          textAnchor="middle"
          fontSize="7"
          fill="white"
        >
          {agv.id}
        </text>
        <text
          x="0"
          y="-12"
          textAnchor="middle"
          fontSize="7"
          fill={DESIGN_TOKENS.colors.dark}
        >
          🔋{agv.battery}%
        </text>
        {agv.cargo && (
          <text
            x="0"
            y="15"
            textAnchor="middle"
            fontSize="7"
            fill={DESIGN_TOKENS.colors.dark}
          >
            {agv.cargo}
          </text>
        )}
      </g>
    ));
  };
  
  // 渲染行车
  const renderCranes = () => {
    if (!activeLayers.includes('crane')) return null;
    
    return data.cranes.map(crane => (
      <g key={crane.id}>
        <line
          x1={crane.span.x1}
          y1={crane.y}
          x2={crane.span.x2}
          y2={crane.y}
          stroke={DESIGN_TOKENS.colors.neutral}
          strokeWidth="3"
          strokeDasharray="10,5"
          opacity="0.3"
        />
        <g transform={`translate(${crane.x}, ${crane.y})`}>
          <rect
            x="-20"
            y="-10"
            width="40"
            height="20"
            fill={crane.status === 'moving' ? DESIGN_TOKENS.colors.warning : DESIGN_TOKENS.colors.neutral}
            rx="4"
          />
          <text
            x="0"
            y="3"
            textAnchor="middle"
            fontSize="8"
            fill="white"
          >
            {crane.id}
          </text>
          {crane.load && (
            <text
              x="0"
              y="18"
              textAnchor="middle"
              fontSize="7"
              fill={DESIGN_TOKENS.colors.dark}
            >
              🏗️ {crane.load}
            </text>
          )}
        </g>
      </g>
    ));
  };
  
  // 渲染安灯
  const renderAndons = () => {
    if (!activeLayers.includes('andon')) return null;
    
    return data.andons.map((andon, index) => {
      const station = data.workstations.find(ws => ws.id === andon.stationId);
      if (!station) return null;
      
      const color = andon.severity === 'critical' ? DESIGN_TOKENS.colors.error :
                   andon.severity === 'high' ? DESIGN_TOKENS.colors.warning :
                   DESIGN_TOKENS.colors.warning;
      
      return (
        <g key={index} transform={`translate(${station.x}, ${station.y - 35})`}>
          <rect
            x="-40"
            y="-10"
            width="80"
            height="20"
            fill={color}
            rx="10"
            className="animate-pulse"
          />
          <text
            x="0"
            y="3"
            textAnchor="middle"
            fontSize="8"
            fill="white"
            fontWeight="bold"
          >
            ⚠️ {andon.message}
          </text>
        </g>
      );
    });
  };
  
  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col">
      {/* 顶部全局KPI面板（按文档FQCF要求） */}
      <header className="bg-white shadow-sm border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800">动车组侧墙产线 - 数字孪生地图 V2.1M</h1>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Flow指标 */}
            <div className="flex items-center space-x-4 border-r pr-4">
              <span className="text-xs text-gray-500">Flow</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600">产量:</span>
                <span className="text-sm font-bold text-blue-600">
                  {data.globalKPIs.production.daily}/{data.globalKPIs.production.target}件
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600">节拍:</span>
                <span className={`text-sm font-bold ${
                  data.globalKPIs.taktAchievement > 0.95 ? 'text-green-600' :
                  data.globalKPIs.taktAchievement > 0.90 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {(data.globalKPIs.taktAchievement * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600">WIP:</span>
                <span className={`text-sm font-bold ${
                  data.globalKPIs.totalWip < 200 ? 'text-green-600' :
                  data.globalKPIs.totalWip < 230 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {data.globalKPIs.totalWip}
                </span>
              </div>
            </div>
            
            {/* Quality指标 */}
            <div className="flex items-center space-x-4 border-r pr-4">
              <span className="text-xs text-gray-500">Quality</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600">FPY:</span>
                <span className={`text-sm font-bold ${
                  data.globalKPIs.fpy > 0.95 ? 'text-green-600' :
                  data.globalKPIs.fpy > 0.92 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {(data.globalKPIs.fpy * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600">RTY:</span>
                <span className="text-sm font-bold">
                  {(data.globalKPIs.rty * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            
            {/* Cost指标 */}
            <div className="flex items-center space-x-4 border-r pr-4">
              <span className="text-xs text-gray-500">Cost</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600">OEE:</span>
                <span className={`text-sm font-bold ${
                  data.globalKPIs.oee > 0.85 ? 'text-green-600' :
                  data.globalKPIs.oee > 0.80 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {(data.globalKPIs.oee * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            
            {/* Flexibility指标 */}
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-500">Flexibility</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600">OTD:</span>
                <span className="text-sm font-bold">
                  {(data.globalKPIs.otd * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧控制面板 */}
        <aside className="w-64 bg-white shadow-lg p-4 overflow-y-auto">
          {/* 专题视图切换 */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">📍 专题视图</h3>
            <div className="space-y-2">
              {Object.entries(viewConfigs).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handleViewChange(key)}
                  className={`w-full px-3 py-2 rounded text-left text-xs ${
                    selectedView === key 
                      ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{config.name}</div>
                  <div className="text-[10px] text-gray-500">{config.focus}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* 图层控制 */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">🗺️ 图层控制</h3>
            <div className="space-y-1">
              {Object.entries(layerConfigs).map(([key, config]) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer text-xs py-1">
                  <input
                    type="checkbox"
                    checked={activeLayers.includes(key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        if (activeLayers.length >= 3 && !activeLayers.includes(key)) {
                          alert('建议：同时显示超过3个图层可能导致信息过载');
                        }
                        setActiveLayers([...activeLayers, key]);
                      } else {
                        setActiveLayers(activeLayers.filter(l => l !== key));
                      }
                    }}
                    className="rounded text-blue-600"
                  />
                  <span className="text-gray-700">{config.name}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* 瓶颈提示 */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <span className="text-red-600">⚠️</span>
              <div>
                <p className="text-xs font-semibold text-red-800">当前瓶颈</p>
                <p className="text-[10px] text-red-600 mt-1">
                  点焊工位 CT超标30%<br/>
                  请优先提升其产能
                </p>
              </div>
            </div>
          </div>
          
          {/* 图例 */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">📊 图例说明</h3>
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>正常/达标</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>预警/接近阈值</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>异常/超标</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span>主物流路径</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-cyan-500 rounded"></div>
                <span>水蜘蛛路线</span>
              </div>
            </div>
          </div>
        </aside>
        
        {/* 主地图区域 */}
        <main className="flex-1 relative bg-gray-100 overflow-hidden">
          {/* 地图控制 */}
          <div className="absolute top-4 right-4 z-10 bg-white rounded shadow-lg p-2 space-y-2">
            <button
              onClick={() => setScale(Math.min(scale + 0.1, 2))}
              className="block p-2 hover:bg-gray-100 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={() => setScale(Math.max(scale - 0.1, 0.5))}
              className="block p-2 hover:bg-gray-100 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button
              onClick={() => setScale(1)}
              className="block p-2 hover:bg-gray-100 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
          </div>
          
          {/* SVG地图 */}
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="0 0 800 600"
            style={{ transform: `scale(${scale})` }}
            className="transition-transform duration-300"
          >
            <defs>
              <marker id="arrowMainFlow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill={DESIGN_TOKENS.colors.mainFlow} />
              </marker>
              <marker id="arrowWaterSpider" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill={DESIGN_TOKENS.colors.waterSpider} />
              </marker>
              <marker id="arrowRework" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill={DESIGN_TOKENS.colors.rework} />
              </marker>
            </defs>
            
            {/* 背景网格 */}
            <rect width="800" height="600" fill={DESIGN_TOKENS.colors.light} />
            <text x="400" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill={DESIGN_TOKENS.colors.dark}>
              动车组侧墙产线 - U型精益布局
            </text>
            
            {/* U型布局边界 */}
            <path
              d="M 80 80 L 80 480 L 720 480 L 720 180 L 320 180 L 320 380 L 180 380 L 180 80 Z"
              stroke={DESIGN_TOKENS.colors.neutral}
              strokeWidth="1"
              strokeDasharray="5,5"
              fill="none"
              opacity="0.3"
            />
            
            {/* 意大利面图层（底层） */}
            {renderSpaghetti()}
            
            {/* 返工路径 */}
            {renderRework()}
            
            {/* 水蜘蛛路线 */}
            {renderWaterSpider()}
            
            {/* 主物流路径 */}
            {renderMainFlow()}
            
            {/* 行车系统 */}
            {renderCranes()}
            
            {/* 工位层 */}
            {data.workstations.map(renderWorkstation)}
            
            {/* AGV层 */}
            {renderAGVs()}
            
            {/* 在制品层 */}
            {renderProductsInTransit()}
            
            {/* 安灯层（顶层） */}
            {renderAndons()}
          </svg>
          
          {/* 选中工位详情 */}
          {selectedStation && (
            <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 w-80">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-sm font-semibold">{selectedStation.name}</h3>
                <button 
                  onClick={() => setSelectedStation(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">工位编号:</span>
                  <span className="font-medium">{selectedStation.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">周期时间(CT):</span>
                  <span className={`font-medium ${
                    selectedStation.metrics.ct <= selectedStation.metrics.takt ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedStation.metrics.ct}s / {selectedStation.metrics.takt}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">一次合格率(FPY):</span>
                  <span className={`font-medium ${
                    selectedStation.metrics.fpy >= 0.92 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(selectedStation.metrics.fpy * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">设备效率(OEE):</span>
                  <span className={`font-medium ${
                    selectedStation.metrics.oee >= 0.85 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(selectedStation.metrics.oee * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">在制品(WIP):</span>
                  <span className={`font-medium ${
                    selectedStation.metrics.wip <= selectedStation.metrics.capacity * 0.8 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedStation.metrics.wip} / {selectedStation.metrics.capacity}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-[10px] text-gray-500">
                    数据来源: MES系统实时采集<br/>
                    阈值标准: 附录E参数中心
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* 底部状态栏 */}
      <footer className="bg-white border-t px-6 py-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <span>更新时间: {data.timestamp.toLocaleTimeString('zh-CN')}</span>
            <span>|</span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
              实时更新中
            </span>
          </div>
          <div>
            <span>© 2024 数字孪生地图 V2.1M - 严格遵循《专题九》设计规范</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DigitalTwinProductionMap;