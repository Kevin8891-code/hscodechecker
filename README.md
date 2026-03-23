# 三人刑HS编码税率查询器 - PWA版本

基于原Kivy桌面应用转换的渐进式Web应用（PWA），支持离线使用，可在安卓手机上安装为原生应用。

## 功能特性

### 核心功能（与原应用一致）
- ✅ **HS编码搜索**：支持数字前缀匹配
- ✅ **商品名称搜索**：支持包含匹配（如"牛"匹配"牛肉"、"牛皮"）
- ✅ **模糊搜索**：支持字符跳跃匹配（如"智手"匹配"智能手机"）
- ✅ **综合税率显示**：自动计算并显示综合税率
- ✅ **税率核算**：支持预填充模式和手动核算模式
- ✅ **偷逃税额计算**：输入货值自动计算偷逃税额

### PWA特性
- ✅ **离线可用**：首次加载后完全离线运行
- ✅ **可安装**：可添加到手机主屏幕，像原生应用一样使用
- ✅ **数据持久化**：使用IndexedDB存储12000+条HS编码数据
- ✅ **快速响应**：本地搜索，无需网络请求
- ✅ **自动更新**：Service Worker管理缓存更新

## 文件结构

```
pwa/
├── index.html          # 主页面
├── app.js              # 应用逻辑（搜索、计算、IndexedDB操作）
├── manifest.json       # PWA配置
├── sw.js               # Service Worker（离线缓存）
├── data/
│   └── hs_codes.json   # HS编码数据（12000+条记录）
├── icons/              # 应用图标（各种尺寸）
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
└── README.md           # 本文件
```

## 使用方法

### 本地测试

```bash
# 进入PWA目录
cd pwa

# 启动本地服务器
python -m http.server 8080

# 浏览器访问
http://localhost:8080
```

### 部署到生产环境

#### 方案1：GitHub Pages（免费）
1. 创建GitHub仓库
2. 将`pwa`目录内容推送到仓库
3. 开启GitHub Pages功能
4. 访问分配的域名即可

#### 方案2：Netlify（免费）
1. 注册Netlify账号
2. 拖拽`pwa`文件夹到Netlify部署区域
3. 自动获得HTTPS域名

#### 方案3：Vercel（免费）
1. 安装Vercel CLI: `npm i -g vercel`
2. 在`pwa`目录运行: `vercel`
3. 按提示完成部署

#### 方案4：自有服务器
将`pwa`目录内容上传到任意Web服务器，确保：
- 支持HTTPS（PWA要求）
- 配置正确的MIME类型
- 根目录指向`pwa`文件夹

### 安卓手机安装

1. **浏览器访问**：使用Chrome浏览器访问部署的网址
2. **添加到主屏幕**：
   - 点击浏览器菜单（右上角三个点）
   - 选择"添加到主屏幕"或"安装应用"
3. **完成安装**：按照提示完成安装
4. **离线使用**：首次加载后，关闭网络也能正常使用

## 技术实现

### 数据存储
- 使用**IndexedDB**（通过Dexie.js库）存储12000+条HS编码数据
- 首次访问时从JSON文件导入数据到IndexedDB
- 后续访问直接从本地数据库读取

### 搜索算法
复现原Python应用的4种搜索策略：
1. **HS编码前缀匹配**：纯数字输入时匹配编码前缀
2. **名称包含匹配**：使用`includes`进行子串匹配
3. **模糊匹配**：字符跳跃匹配算法
4. **结果去重**：确保同一商品只显示一次

### 综合税率计算
```javascript
if (consumptionRate === 0) {
    return mfnRate + vatRate + mfnRate * vatRate;
} else {
    return (mfnRate + consumptionRate + vatRate + mfnRate * vatRate) / (1 - consumptionRate);
}
```

### Service Worker策略
- **静态资源**：缓存优先（Cache First）
- **数据文件**：网络优先（Network First），失败时回退到缓存

## 浏览器兼容性

- Chrome/Edge 80+
- Firefox 75+
- Safari 14+（iOS 14.5+支持PWA安装）
- Samsung Internet 12+

## 数据更新

如需更新HS编码数据：

1. 更新SQLite数据库
2. 运行导出脚本：
   ```bash
   cd ..
   python export_data.py
   ```
3. 重新部署PWA
4. 用户下次访问时会自动更新数据

## 与原Kivy应用的差异

| 特性 | Kivy版本 | PWA版本 |
|-----|---------|--------|
| 运行环境 | Windows桌面 | 任何支持浏览器的设备 |
| 安装方式 | 下载EXE | 浏览器安装 |
| 数据存储 | SQLite文件 | IndexedDB |
| 离线使用 | ✅ | ✅ |
| 更新方式 | 重新下载 | 自动更新 |
| 手机支持 | 需Buildozer打包 | 原生支持 |

## 注意事项

1. **首次加载**：首次访问需要下载约2.8MB的数据文件，请确保网络畅通
2. **存储空间**：IndexedDB需要约10MB存储空间
3. **隐私模式**：浏览器隐私模式下IndexedDB可能不可用
4. **数据持久化**：清除浏览器数据会导致本地数据丢失，需重新加载

## 许可证

与原应用保持一致

## 联系方式

如有问题或建议，请联系开发者
