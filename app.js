/**
 * 三人刑HS编码税率查询器 - PWA版本
 * 使用Dexie.js操作IndexedDB，实现离线搜索和计算
 */

// IndexedDB数据库定义
const db = new Dexie('HSCodeDB');
db.version(1).stores({
  hsCodes: 'hs_code, standard_name, mfn_rate, vat_rate, consumption_rate',
  metadata: 'key'
});

// 全局变量
let hsData = [];
let isDataLoaded = false;
let deferredPrompt = null;
let currentMode = 'prefilled'; // 'prefilled' 或 'manual'

// 初始化应用
document.addEventListener('DOMContentLoaded', async () => {
  await initApp();
  setupEventListeners();
  setupPWA();
});

// 初始化应用
async function initApp() {
  try {
    // 检查IndexedDB中是否已有数据
    const count = await db.hsCodes.count();
    
    if (count === 0) {
      // 首次加载，从JSON文件导入数据
      await loadDataFromJSON();
    } else {
      // 从IndexedDB加载数据到内存
      await loadDataFromIndexedDB();
    }
    
    isDataLoaded = true;
    updateStatsBar();
    showReadyState();
  } catch (error) {
    console.error('初始化失败:', error);
    showErrorState('数据加载失败，请刷新页面重试');
  }
}

// 从JSON文件加载数据
async function loadDataFromJSON() {
  const container = document.getElementById('resultsContainer');
  container.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <div>首次加载，正在导入数据...</div>
    </div>
  `;
  
  const response = await fetch('data/hs_codes.json');
  if (!response.ok) {
    throw new Error('无法加载数据文件');
  }
  
  hsData = await response.json();
  
  // 将数据存入IndexedDB
  await db.hsCodes.bulkPut(hsData);
  await db.metadata.put({ key: 'lastUpdated', value: new Date().toISOString() });
  await db.metadata.put({ key: 'recordCount', value: hsData.length });
  
  console.log(`成功导入 ${hsData.length} 条记录到IndexedDB`);
}

// 从IndexedDB加载数据
async function loadDataFromIndexedDB() {
  hsData = await db.hsCodes.toArray();
  console.log(`从IndexedDB加载了 ${hsData.length} 条记录`);
}

// 更新状态栏
async function updateStatsBar() {
  const statsBar = document.getElementById('statsBar');
  const count = hsData.length;
  
  let lastUpdated = '未知';
  try {
    const meta = await db.metadata.get('lastUpdated');
    if (meta) {
      const date = new Date(meta.value);
      lastUpdated = date.toLocaleDateString('zh-CN');
    }
  } catch (e) {
    // 忽略错误
  }
  
  statsBar.textContent = `数据已加载 | 共 ${count.toLocaleString()} 条记录 | 更新于 ${lastUpdated}`;
}

// 显示就绪状态
function showReadyState() {
  const container = document.getElementById('resultsContainer');
  container.innerHTML = '<div class="no-results">请输入关键词开始搜索</div>';
}

// 显示错误状态
function showErrorState(message) {
  const container = document.getElementById('resultsContainer');
  container.innerHTML = `<div class="no-results">${message}</div>`;
}

// 搜索功能
function search(query) {
  if (!isDataLoaded || !query.trim()) {
    showReadyState();
    return;
  }

  const results = [];
  const trimmedQuery = query.trim();
  const lowerQuery = trimmedQuery.toLowerCase();

  // 策略1: 纯数字匹配HS编码前缀
  if (/^\d+$/.test(trimmedQuery)) {
    for (const item of hsData) {
      if (item.hs_code.startsWith(trimmedQuery)) {
        results.push(item);
      }
    }
  }

  // 策略2: 名称包含匹配
  for (const item of hsData) {
    if (item.standard_name.toLowerCase().includes(lowerQuery)) {
      // 去重
      if (!results.find(r => r.hs_code === item.hs_code)) {
        results.push(item);
      }
    }
  }

  // 策略3: 模糊匹配（如"智手"匹配"智能手机"）
  if (results.length < 10 && trimmedQuery.length >= 2) {
    const chars = trimmedQuery.split('');
    
    for (const item of hsData) {
      // 跳过已匹配的结果
      if (results.find(r => r.hs_code === item.hs_code)) continue;
      
      let match = true;
      let name = item.standard_name;
      
      for (const char of chars) {
        const idx = name.indexOf(char);
        if (idx === -1) {
          match = false;
          break;
        }
        name = name.substring(idx + 1);
      }
      
      if (match) {
        results.push(item);
      }
    }
  }

  displayResults(results);
}

// 显示搜索结果
function displayResults(results) {
  const container = document.getElementById('resultsContainer');
  
  if (results.length === 0) {
    container.innerHTML = '<div class="no-results">未找到相关结果</div>';
    return;
  }

  container.innerHTML = results.map(item => {
    const comprehensiveRate = calculateComprehensiveRate(
      item.mfn_rate || 0,
      item.vat_rate || 0,
      item.consumption_rate || 0
    );

    return `
      <div class="result-item" onclick="openCalcModal('${item.hs_code}')">
        <div class="hs-code">${item.hs_code}</div>
        <div class="product-name">${item.standard_name}</div>
        <div class="tax-rates">
          <span class="tax-tag">关税 ${formatRate(item.mfn_rate)}</span>
          <span class="tax-tag vat">增值税 ${formatRate(item.vat_rate)}</span>
          ${item.consumption_rate ? `<span class="tax-tag consumption">消费税 ${formatRate(item.consumption_rate)}</span>` : ''}
          <span class="tax-tag comprehensive">综合 ${(comprehensiveRate * 100).toFixed(2)}%</span>
        </div>
      </div>
    `;
  }).join('');
}

// 格式化税率显示
function formatRate(rate) {
  if (rate === null || rate === undefined) return '0%';
  return (rate * 100).toFixed(0) + '%';
}

// 计算综合税率
function calculateComprehensiveRate(mfnRate, vatRate, consumptionRate) {
  const mfn = mfnRate || 0;
  const vat = vatRate || 0;
  const consumption = consumptionRate || 0;
  
  if (consumption === 0) {
    return mfn + vat + mfn * vat;
  } else {
    return (mfn + consumption + vat + mfn * vat) / (1 - consumption);
  }
}

// 打开计算模态框（预填充模式）
function openCalcModal(hsCode) {
  const item = hsData.find(i => i.hs_code === hsCode);
  if (!item) return;

  currentMode = 'prefilled';
  
  document.getElementById('modalTitle').textContent = '商品核算';
  document.getElementById('modalSubtitle').textContent = `HS编码：${item.hs_code}`;
  document.getElementById('hsCodeInput').value = item.hs_code;
  document.getElementById('productNameInput').value = item.standard_name;
  document.getElementById('tariffRate').value = ((item.mfn_rate || 0) * 100).toFixed(2);
  document.getElementById('vatRate').value = ((item.vat_rate || 0) * 100).toFixed(2);
  document.getElementById('consumptionRate').value = ((item.consumption_rate || 0) * 100).toFixed(2);
  document.getElementById('goodsValue').value = '';
  document.getElementById('taxEvasionSection').style.display = 'none';
  
  calculateTax();
  
  document.getElementById('calcModal').classList.add('active');
}

// 打开手动核算模式
function openManualCalc() {
  currentMode = 'manual';
  
  document.getElementById('modalTitle').textContent = '手动核算';
  document.getElementById('modalSubtitle').textContent = '自由录入税率进行核算';
  document.getElementById('hsCodeInput').value = '';
  document.getElementById('productNameInput').value = '';
  document.getElementById('tariffRate').value = '';
  document.getElementById('vatRate').value = '';
  document.getElementById('consumptionRate').value = '';
  document.getElementById('goodsValue').value = '';
  document.getElementById('taxEvasionSection').style.display = 'none';
  document.getElementById('comprehensiveRate').textContent = '0.00%';
  
  document.getElementById('calcModal').classList.add('active');
}

// 关闭模态框
function closeModal() {
  document.getElementById('calcModal').classList.remove('active');
}

// 计算税率和偷逃税额
function calculateTax() {
  const tariffRate = parseFloat(document.getElementById('tariffRate').value) / 100 || 0;
  const vatRate = parseFloat(document.getElementById('vatRate').value) / 100 || 0;
  const consumptionRate = parseFloat(document.getElementById('consumptionRate').value) / 100 || 0;
  const goodsValue = parseFloat(document.getElementById('goodsValue').value) || 0;

  const comprehensiveRate = calculateComprehensiveRate(tariffRate, vatRate, consumptionRate);
  document.getElementById('comprehensiveRate').textContent = (comprehensiveRate * 100).toFixed(2) + '%';

  if (goodsValue > 0) {
    const taxEvasion = goodsValue * comprehensiveRate;
    document.getElementById('taxEvasionAmount').textContent = '¥' + taxEvasion.toLocaleString('zh-CN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
    document.getElementById('taxEvasionSection').style.display = 'block';
  } else {
    document.getElementById('taxEvasionSection').style.display = 'none';
  }
}

// 设置事件监听器
function setupEventListeners() {
  // 搜索输入
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    search(e.target.value);
  });

  // 回车键触发搜索
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      search(e.target.value);
    }
  });

  // 货值输入回车触发计算
  document.getElementById('goodsValue').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      calculateTax();
    }
  });

  // 税率输入变化时自动计算
  ['tariffRate', 'vatRate', 'consumptionRate'].forEach(id => {
    document.getElementById(id).addEventListener('input', calculateTax);
  });

  // 点击模态框外部关闭
  document.getElementById('calcModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('calcModal')) {
      closeModal();
    }
  });

  // ESC键关闭模态框
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

// 设置PWA功能
function setupPWA() {
  // 注册Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then((registration) => {
        console.log('Service Worker 注册成功:', registration);
      })
      .catch((error) => {
        console.log('Service Worker 注册失败:', error);
      });
  }

  // 监听安装提示
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // 显示安装按钮
    const installBtn = document.getElementById('installBtn');
    installBtn.classList.add('show');
    installBtn.addEventListener('click', installPWA);
  });

  // 监听已安装事件
  window.addEventListener('appinstalled', () => {
    console.log('PWA已安装');
    deferredPrompt = null;
    document.getElementById('installBtn').classList.remove('show');
  });
}

// 安装PWA
async function installPWA() {
  if (!deferredPrompt) return;
  
  deferredPrompt.prompt();
  
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`用户${outcome === 'accepted' ? '接受了' : '拒绝了'}安装`);
  
  deferredPrompt = null;
  document.getElementById('installBtn').classList.remove('show');
}

// 导出函数供HTML调用
window.openCalcModal = openCalcModal;
window.openManualCalc = openManualCalc;
window.closeModal = closeModal;
window.calculateTax = calculateTax;
