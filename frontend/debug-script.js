// 前端调试脚本
// 在浏览器Console中粘贴并执行此脚本

(function debugFrontend() {
  console.log('%c前端调试助手', 'font-size: 20px; font-weight: bold; color: #4CAF50;');
  console.log('='.repeat(60));
  
  // 1. 页面基本信息
  console.log('\n📄 页面信息:');
  console.log({
    title: document.title,
    url: window.location.href,
    readyState: document.readyState,
    timestamp: new Date().toISOString()
  });
  
  // 2. 内存使用情况
  if (performance.memory) {
    const mem = performance.memory;
    const usage = (mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100;
    console.log('\n💾 内存使用:');
    console.table({
      '已使用': (mem.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      '总计': (mem.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      '限制': (mem.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
      '使用率': usage.toFixed(2) + '%',
      '状态': usage > 80 ? '⚠️ 警告' : usage > 90 ? '❌ 危险' : '✅ 正常'
    });
  }
  
  // 3. API配置检查
  console.log('\n⚙️ API配置:');
  import('./src/config/appConfig').then(module => {
    console.table(module.appConfig);
  }).catch(e => {
    console.error('无法加载配置:', e);
    console.log('提示: 在浏览器中直接访问时，import可能不可用');
  });
  
  // 4. WebSocket连接检查
  const wsResources = performance.getEntriesByType('resource')
    .filter(r => r.name.startsWith('ws://') || r.name.startsWith('wss://'));
  console.log('\n🔌 WebSocket连接:');
  console.log('连接数:', wsResources.length);
  if (wsResources.length > 0) {
    wsResources.forEach((ws, i) => {
      console.log(`  ${i + 1}. ${ws.name} (${ws.duration.toFixed(2)}ms)`);
    });
  }
  
  // 5. 网络请求统计
  const resources = performance.getEntriesByType('resource');
  const apiRequests = resources.filter(r => 
    r.name.includes('/api/v1/') || 
    r.name.includes('localhost:8000')
  );
  console.log('\n📡 API请求统计:');
  console.log('总请求数:', apiRequests.length);
  if (apiRequests.length > 0) {
    const failed = apiRequests.filter(r => r.responseStatus >= 400);
    const success = apiRequests.filter(r => r.responseStatus < 400 && r.responseStatus >= 200);
    console.log('成功:', success.length);
    console.log('失败:', failed.length);
    if (failed.length > 0) {
      console.warn('失败的请求:');
      failed.forEach(r => console.warn(`  - ${r.name} (${r.responseStatus})`));
    }
  }
  
  // 6. React检查
  console.log('\n⚛️ React状态:');
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools可用');
    try {
      const reactRoot = document.getElementById('root')?._reactRootContainer;
      if (reactRoot) {
        console.log('✅ React根节点已挂载');
      }
    } catch (e) {
      console.log('⚠️ 无法检查React根节点');
    }
  } else {
    console.log('⚠️ React DevTools不可用');
  }
  
  // 7. DOM节点统计
  console.log('\n🌳 DOM统计:');
  const allElements = document.querySelectorAll('*');
  console.log('总元素数:', allElements.length);
  console.log('深度:', Math.max(...Array.from(allElements).map(el => {
    let depth = 0;
    let current = el;
    while (current.parentElement) {
      depth++;
      current = current.parentElement;
    }
    return depth;
  })));
  
  // 8. 定时器检查（需要手动检查）
  console.log('\n⏱️ 定时器检查:');
  console.log('提示: 请在Sources标签中搜索setInterval和setTimeout');
  console.log('或使用以下代码监控:');
  console.log(`
let intervalCount = 0;
const originalSetInterval = window.setInterval;
window.setInterval = function(...args) {
  intervalCount++;
  console.log('创建setInterval #' + intervalCount, args[1] + 'ms');
  return originalSetInterval.apply(this, args);
};
  `);
  
  // 9. 错误检查
  console.log('\n❌ 错误检查:');
  const errors = [];
  window.addEventListener('error', (e) => {
    errors.push({
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno
    });
  });
  console.log('已设置错误监听器，错误将自动记录');
  
  // 10. 性能指标
  console.log('\n📊 性能指标:');
  if (performance.timing) {
    const timing = performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
    console.table({
      '页面加载时间': loadTime + 'ms',
      'DOM就绪时间': domReady + 'ms',
      'DNS查询': (timing.domainLookupEnd - timing.domainLookupStart) + 'ms',
      'TCP连接': (timing.connectEnd - timing.connectStart) + 'ms',
      '请求响应': (timing.responseEnd - timing.requestStart) + 'ms'
    });
  }
  
  // 11. 实时数据检查
  console.log('\n🔄 实时数据检查:');
  console.log('提示: 检查WebSocket是否正常接收数据');
  
  // 12. 提供快速测试命令
  console.log('\n🧪 快速测试命令:');
  console.log(`
// 测试KPI接口
fetch('http://localhost:8000/api/v1/map/kpi')
  .then(r => r.json())
  .then(d => console.log('KPI数据:', d));

// 测试实时实体接口
fetch('http://localhost:8000/api/v1/realtime/entities')
  .then(r => r.json())
  .then(d => console.log('实时数据:', d));

// 测试WebSocket连接
const ws = new WebSocket('ws://localhost:8000/api/v1/realtime/ws');
ws.onopen = () => console.log('✅ WebSocket连接成功');
ws.onmessage = (e) => console.log('收到消息:', JSON.parse(e.data));
ws.onerror = (e) => console.error('❌ WebSocket错误:', e);
  `);
  
  console.log('\n' + '='.repeat(60));
  console.log('调试信息收集完成！');
  console.log('='.repeat(60));
  
  // 返回调试对象供后续使用
  return {
    checkMemory: () => {
      if (performance.memory) {
        const mem = performance.memory;
        return {
          used: (mem.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
          total: (mem.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
          usage: ((mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100).toFixed(2) + '%'
        };
      }
      return null;
    },
    checkWebSocket: () => {
      return performance.getEntriesByType('resource')
        .filter(r => r.name.startsWith('ws://') || r.name.startsWith('wss://'))
        .map(r => ({ url: r.name, duration: r.duration }));
    },
    testAPI: async (endpoint) => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1${endpoint}`);
        const data = await res.json();
        return { success: res.ok, status: res.status, data };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }
  };
})();

