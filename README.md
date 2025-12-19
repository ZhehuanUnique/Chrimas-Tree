# 手势控制粒子圣诞树 🎄

一个基于手势识别的交互式粒子圣诞树应用，通过检测手部动作（张开5指和收紧5指）来控制圣诞树的生成和清除。

## 功能特点

- 📱 **手机摄像头支持**：自动请求摄像头权限，支持前置/后置摄像头
- ✋ **手势识别**：使用 MediaPipe Hands 实时检测手部动作
- 🎄 **粒子圣诞树**：根据手势动态生成和清除粒子圣诞树
- ✨ **视觉效果**：粒子闪烁、浮动动画，多种颜色装饰
- 📱 **响应式设计**：完美适配手机和桌面端

## 使用方法

1. **打开页面**
   - 直接在浏览器中打开 `index.html`
   - 或使用本地服务器（推荐）

2. **允许摄像头权限**
   - 浏览器会提示请求摄像头权限，请点击"允许"

3. **手势控制**
   - **张开5指**：生成粒子圣诞树
   - **收紧5指**：清除粒子圣诞树

## 技术栈

- **MediaPipe Hands**：Google 的手势识别库
- **Canvas API**：粒子渲染
- **WebRTC**：摄像头访问
- **原生 JavaScript**：无需构建工具

## 文件结构

```
Chrimas-Tree/
├── index.html          # 主页面
├── style.css           # 样式文件
├── main.js             # 主程序入口
├── hand-gesture.js     # 手势识别模块
├── particle-tree.js    # 粒子圣诞树系统
└── README.md          # 说明文档
```

## 本地运行

### 方法1：直接打开（可能有限制）
直接在浏览器中打开 `index.html`

### 方法2：使用本地服务器（推荐）

**Python 3:**
```bash
python -m http.server 8080
```

**Node.js (需要安装 http-server):**
```bash
npx http-server -p 8080
```

然后在浏览器中访问 `http://localhost:8080`

## 浏览器要求

- Chrome/Edge（推荐）
- Firefox
- Safari（iOS 11+）
- 支持 WebRTC 和 Canvas API 的现代浏览器

## 注意事项

1. **HTTPS 要求**：某些浏览器可能要求 HTTPS 才能访问摄像头
   - 本地开发可以使用 `http://localhost`
   - 部署到服务器建议使用 HTTPS

2. **性能优化**：
   - 在性能较低的设备上，可以降低粒子数量
   - 修改 `particle-tree.js` 中的 `particlesPerLayer` 参数

3. **手势识别**：
   - 确保手部在摄像头视野内
   - 光线充足的环境效果更好
   - 手势需要清晰，避免遮挡

## 自定义设置

### 调整粒子数量
编辑 `particle-tree.js` 中的 `particlesPerLayer` 参数

### 调整圣诞树大小
修改 `generateTree()` 方法中的 `treeHeight` 和 `treeWidth` 参数

### 修改颜色
在 `generateTree()` 方法中的 `colors` 数组中添加或修改颜色

## 许可证

MIT License

## 作者

Created with ❤️ for Christmas

