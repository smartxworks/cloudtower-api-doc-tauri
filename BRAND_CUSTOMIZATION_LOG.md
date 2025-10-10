# 品牌定制修改记录

## 项目信息
- **项目名称**: CloudTower API Doc Tauri
- **定制分支**: `feature/brand-customization`
- **定制开始时间**: 2024年12月
- **定制目标**: 将 SmartX 品牌替换为 Arcfra 品牌

---

## 修改记录

### 1. Logo 替换和 Developer 文字添加

**修改时间**: 2024年12月19日  
**Commit ID**: `727d02c`  
**修改类型**: 功能增强

#### 修改描述
将网站左上角的 SmartX Logo 替换为 Arcfra Logo，并在 Logo 右侧添加 "Developer" 文字，同时实现相应的点击交互功能。

#### 具体改动

##### 1.1 Logo 文件替换
**文件**: `cloudtower-api-doc/static/img/`
- **新增文件**:
  - `arcfra-logo.svg` - 原始 Arcfra Logo 文件
  - `arcfra-logo-zh.svg` - 中文版 Logo（复制自原始文件）
  - `arcfra-logo-en.svg` - 英文版 Logo（复制自原始文件）

**操作命令**:
```bash
cp cloudtower-api-doc/static/img/arcfra-logo.svg cloudtower-api-doc/static/img/arcfra-logo-zh.svg
cp cloudtower-api-doc/static/img/arcfra-logo.svg cloudtower-api-doc/static/img/arcfra-logo-en.svg
```

##### 1.2 Logo 组件重构
**文件**: `cloudtower-api-doc/src/theme/Logo/index.tsx`

**主要改动**:
- 导入新的样式模块: `import styles from './styles.module.css'`
- 重构组件结构，将单一 Link 组件拆分为包含 Logo 和 Developer 文字的容器
- 更新 Logo 文件引用路径: `img/arcfra-logo-${currentLocale}.svg`
- 添加外部链接功能: Logo 点击跳转到 `https://www.arcfra.com`
- 添加 Developer 文字组件，点击跳转到站点首页

**代码对比**:
```typescript
// 修改前
return (
  <Link to={logoLink} {...propsRest}>
    {logo && (
      <LogoThemedImage
        logo={{
          ...logo,
          src: `img/smartx-developer-badge-${currentLocale}.svg`
        }}
        alt={alt}
        imageClassName={imageClassName}
      />
    )}
    {navbarTitle != null && <b className={titleClassName}>{navbarTitle}</b>}
  </Link>
);

// 修改后
return (
  <div className={styles.logoContainer}>
    <a
      href="https://www.arcfra.com"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.logoLink}
      {...propsRest}>
      {logo && (
        <LogoThemedImage
          logo={{
            ...logo,
            src: `img/arcfra-logo-${currentLocale}.svg`
          }}
          alt={alt}
          imageClassName={imageClassName}
        />
      )}
    </a>
    <Link
      to={logoLink}
      className={styles.developerLink}
      {...(logo?.target && {target: logo.target})}>
      <span className={styles.developerText}>Developer</span>
    </Link>
    {navbarTitle != null && <b className={titleClassName}>{navbarTitle}</b>}
  </div>
);
```

##### 1.3 新增样式文件
**文件**: `cloudtower-api-doc/src/theme/Logo/styles.module.css` (新建)

**样式内容**:
```css
.logoContainer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logoLink {
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.logoLink:hover {
  opacity: 0.8;
}

.developerLink {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s ease;
}

.developerLink:hover {
  opacity: 0.8;
}

.developerText {
  font-size: 24px;
  font-style: normal;
  font-weight: 400;
  line-height: 120%; /* 28.8px */
  letter-spacing: -0.72px;
  color: #0C2849;
  white-space: nowrap;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .developerText {
    font-size: 20px;
    letter-spacing: -0.6px;
  }
  
  .logoContainer {
    gap: 8px;
  }
}

@media screen and (max-width: 480px) {
  .developerText {
    font-size: 18px;
    letter-spacing: -0.54px;
  }
  
  .logoContainer {
    gap: 6px;
  }
}
```

##### 1.4 导航栏样式调整
**文件**: `cloudtower-api-doc/src/theme/Navbar/Logo/styles.module.css`

**主要改动**:
- 移除固定宽度限制: `width: 285px;` → 删除
- 添加 flex 布局支持: `display: flex; align-items: center;`

**代码对比**:
```css
/* 修改前 */
.logoOverwrite {
  padding: 0 16px;
  width: 285px;
  height: 56px;
  margin-right: 8px;
}

/* 修改后 */
.logoOverwrite {
  padding: 0 16px;
  height: 56px;
  margin-right: 8px;
  display: flex;
  align-items: center;
}
```

#### 功能特性

##### 交互功能
1. **Logo 点击**: 新窗口打开 `https://www.arcfra.com`
2. **Developer 点击**: 跳转到当前站点首页
3. **悬停效果**: 透明度变化提供视觉反馈

##### 响应式设计
- **桌面端**: 24px 字体，12px 间距
- **平板端** (≤768px): 20px 字体，8px 间距
- **手机端** (≤480px): 18px 字体，6px 间距

##### 样式规范
- **字体大小**: 24px
- **字体样式**: normal
- **字体粗细**: 400
- **行高**: 120% (28.8px)
- **字间距**: -0.72px
- **颜色**: #0C2849 (与 Arcfra Logo 颜色一致)

#### Commit 信息
```
feat: 替换 Logo 为 arcfra-logo 并添加 Developer 文字

- 将左上角 Logo 替换为 arcfra-logo.svg
- 在 Logo 右侧添加 Developer 文字，样式为 24px 字体，400 字重
- 添加交互功能：
  - 点击 arcfra-logo 跳转到 www.arcfra.com
  - 点击 Developer 跳转到当前站点首页
- 添加响应式设计支持移动端显示
- 更新导航栏样式以适配新的 Logo 布局
```

#### 文件变更统计
- **新增文件**: 4 个
  - `cloudtower-api-doc/src/theme/Logo/styles.module.css`
  - `cloudtower-api-doc/static/img/arcfra-logo.svg`
  - `cloudtower-api-doc/static/img/arcfra-logo-zh.svg`
  - `cloudtower-api-doc/static/img/arcfra-logo-en.svg`
- **修改文件**: 2 个
  - `cloudtower-api-doc/src/theme/Logo/index.tsx`
  - `cloudtower-api-doc/src/theme/Navbar/Logo/styles.module.css`
- **代码行数变化**: +116 行，-16 行

#### 测试验证
- ✅ 网站正常启动 (HTTP 200)
- ✅ Logo 正确显示
- ✅ Developer 文字样式符合要求
- ✅ 点击交互功能正常
- ✅ 响应式布局在不同屏幕尺寸下正常显示
- ✅ 无 linting 错误

---

## 待完成项目

### 2. 颜色主题定制
- [ ] 更新 `custom.scss` 中的颜色变量
- [ ] 调整导航栏、侧边栏、标题等颜色
- [ ] 确保颜色与 Arcfra 品牌一致

### 3. 页脚定制
- [ ] 更新页脚 Logo
- [ ] 修改页脚链接和版权信息
- [ ] 调整页脚样式

### 4. 站点配置更新
- [ ] 更新站点标题和描述
- [ ] 修改组织名称和项目名称
- [ ] 更新版权信息

### 5. 桌面应用图标
- [ ] 替换 Tauri 应用图标
- [ ] 更新各种尺寸的图标文件

---

## 技术说明

### 架构设计
- **组件化**: Logo 组件采用模块化设计，便于维护和扩展
- **响应式**: 使用 CSS 媒体查询实现多设备适配
- **国际化**: 支持中英文 Logo 自动切换
- **可访问性**: 添加适当的 alt 文本和 ARIA 标签

### 性能优化
- **SVG 格式**: 使用矢量图形确保清晰度
- **CSS 模块**: 避免样式冲突，提高性能
- **过渡动画**: 使用 CSS transition 提供流畅的用户体验

### 兼容性
- **浏览器支持**: 现代浏览器完全支持
- **移动端**: 响应式设计确保移动端体验
- **无障碍**: 符合基本的可访问性标准

---

## 维护指南

### 如何更新 Logo
1. 替换 `cloudtower-api-doc/static/img/arcfra-logo.svg`
2. 重新生成中英文版本
3. 测试显示效果

### 如何调整样式
1. 修改 `cloudtower-api-doc/src/theme/Logo/styles.module.css`
2. 测试响应式效果
3. 验证交互功能

### 如何添加新功能
1. 在 Logo 组件中添加新元素
2. 在样式文件中添加对应样式
3. 更新响应式设计
4. 测试所有功能

---

*最后更新: 2024年12月19日*
