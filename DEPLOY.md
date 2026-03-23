# PWA部署指南

## 快速部署选项

### 选项1：GitHub Pages（推荐，免费且简单）

#### 步骤：
1. **创建GitHub仓库**
   - 登录GitHub
   - 创建新仓库（如：`hscodechecker-pwa`）

2. **上传文件**
   ```bash
   # 在pwa目录下初始化git
   git init
   git add .
   git commit -m "Initial PWA commit"
   
   # 关联远程仓库
   git remote add origin https://github.com/你的用户名/hscodechecker-pwa.git
   git push -u origin main
   ```

3. **开启GitHub Pages**
   - 进入仓库Settings
   - 左侧菜单选择Pages
   - Source选择"Deploy from a branch"
   - Branch选择"main"，文件夹选择"/ (root)"
   - 点击Save

4. **访问应用**
   - 等待几分钟
   - 访问 `https://你的用户名.github.io/hscodechecker-pwa`

---

### 选项2：Netlify（推荐，支持自动部署）

#### 步骤：
1. **注册账号**
   - 访问 https://www.netlify.com
   - 使用GitHub账号登录

2. **部署方式A：拖拽部署**
   - 压缩`pwa`文件夹为zip
   - 在Netlify控制台拖拽上传
   - 立即获得域名

3. **部署方式B：Git部署（推荐）**
   - 连接GitHub仓库
   - 选择包含PWA代码的仓库
   - 构建设置保持默认
   - 点击Deploy

4. **配置自定义域名**（可选）
   - 在Domain settings中添加自定义域名
   - 配置DNS解析

---

### 选项3：Vercel（推荐，国内访问较快）

#### 步骤：
1. **安装Vercel CLI**
   ```bash
   npm i -g vercel
   # 或使用npx
   npx vercel
   ```

2. **部署**
   ```bash
   cd pwa
   vercel
   ```

3. **按提示操作**
   - 登录Vercel账号
   - 确认部署设置
   - 等待部署完成

4. **获取域名**
   - 部署完成后会显示访问链接
   - 格式：`https://你的项目名-用户名.vercel.app`

---

### 选项4：腾讯云静态网站托管（国内推荐）

#### 步骤：
1. **注册腾讯云账号**
   - 访问 https://cloud.tencent.com

2. **开通静态网站托管**
   - 进入云开发控制台
   - 创建新环境
   - 开通静态网站托管

3. **上传文件**
   - 在控制台直接上传文件
   - 或使用CLI工具

4. **配置域名**（可选）
   - 绑定自定义域名
   - 配置HTTPS证书

---

### 选项5：阿里云OSS+CDN（企业推荐）

#### 步骤：
1. **创建OSS Bucket**
   - 登录阿里云控制台
   - 创建OSS存储桶
   - 开启静态网站托管

2. **上传文件**
   - 使用OSS客户端上传`pwa`目录内容

3. **配置CDN**（可选）
   - 添加CDN加速域名
   - 配置HTTPS证书
   - 开启HTTP/2

4. **配置域名**
   - 添加自定义域名
   - 配置CNAME解析

---

## 部署检查清单

部署完成后，请检查以下项目：

### 基础功能
- [ ] 页面能正常加载
- [ ] 搜索功能正常工作
- [ ] 综合税率显示正确
- [ ] 税率计算模态框正常弹出
- [ ] 偷逃税额计算正确

### PWA功能
- [ ] 能安装到主屏幕
- [ ] 离线状态下能正常使用
- [ ] 图标显示正确
- [ ] 主题色正确显示

### 性能检查
- [ ] 首次加载时间 < 5秒
- [ ] 搜索响应时间 < 1秒
- [ ] 数据文件正确缓存

## 常见问题

### Q1: 为什么首次加载很慢？
A: 首次需要下载约2.8MB的数据文件。建议：
- 使用CDN加速
- 开启Gzip压缩
- 考虑分片加载数据

### Q2: 如何更新数据？
A: 
1. 更新SQLite数据库
2. 重新运行`export_data.py`
3. 重新部署
4. 用户下次访问时自动更新

### Q3: 如何强制用户更新？
A: 修改`sw.js`中的`CACHE_NAME`版本号，用户下次访问时会自动更新。

### Q4: 国内访问慢怎么办？
A: 建议使用：
- 腾讯云静态网站托管
- 阿里云OSS+CDN
- 又拍云等国内CDN服务

### Q5: 如何绑定自定义域名？
A: 所有主流平台都支持：
- 在平台控制台添加域名
- 配置DNS解析（CNAME记录）
- 等待DNS生效
- 配置HTTPS证书

## 安全建议

1. **启用HTTPS**：所有PWA功能需要HTTPS
2. **配置CSP**：在服务器配置Content-Security-Policy
3. **数据验证**：虽然数据是静态的，但仍建议验证JSON完整性
4. **定期备份**：保留数据文件备份

## 性能优化建议

1. **启用Gzip/Brotli压缩**：减少传输大小
2. **使用CDN**：加速静态资源访问
3. **图片优化**：使用WebP格式图标
4. **代码分割**：如应用变大，考虑分割代码
5. **预加载关键资源**：在HTML中添加`<link rel="preload">`

## 监控建议

部署后建议设置：
- 访问统计（Google Analytics等）
- 错误监控（Sentry等）
- 性能监控（Lighthouse CI等）

## 联系支持

如部署过程中遇到问题，请：
1. 查看浏览器控制台错误信息
2. 检查网络请求是否正常
3. 参考各平台的官方文档
4. 在GitHub Issues中寻求帮助
