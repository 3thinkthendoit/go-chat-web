# PC/移动端响应式架构文档

## 概述

本项目采用了统一的PC/移动端响应式架构，通过封装的hook和组件实现，便于维护和扩展。

## 核心组件

### 1. useMobile Hook

**文件位置**: `src/hooks/useMobile.ts`

**功能**: 自动检测当前设备是否为移动端，并提供响应式更新。

**使用方式**:
```typescript
import { useMobile } from '@/hooks/useMobile'

const { isMobile } = useMobile()
```

**特点**:
- 自动监听窗口大小变化
- 自动清理事件监听器
- 返回响应式的 `isMobile` ref

### 2. ResponsiveContainer 组件

**文件位置**: `src/components/base/ResponsiveContainer.vue`

**功能**: 通用的响应式容器组件，自动根据设备类型显示PC或移动端布局。

**Props**:
- `title`: PC端页面标题（可选）
- `showMobileHeader`: 是否显示移动端标题栏（默认true）
- `mobileTitle`: 移动端页面标题
- `showBack`: 是否显示返回按钮
- `customHeader`: 自定义移动端标题栏样式

**Slots**:
- `pc`: PC端自定义内容
- `mobile`: 移动端自定义内容
- `mobile-header`: 移动端自定义标题栏

**使用方式**:

```vue
<template>
  <ResponsiveContainer title="我的好友" mobile-title="我的好友">
    <template #pc>
      <!-- PC端内容 -->
    </template>
    <template #mobile>
      <!-- 移动端内容 -->
    </template>
  </ResponsiveContainer>
</template>
```

### 3. MobilePageHeader 组件

**文件位置**: `src/components/mobile/MobilePageHeader.vue`

**功能**: 移动端页面顶部标题栏组件。

**Props**:
- `title`: 标题文字
- `showBack`: 是否显示返回按钮

**Events**:
- `back`: 返回按钮点击事件

**使用方式**:
```vue
<MobilePageHeader title="消息" :show-back="true" @back="handleBack" />
```

## 页面开发规范

### 推荐方式：使用 ResponsiveContainer

对于需要同时支持PC和移动端的页面，推荐使用 `ResponsiveContainer` 组件：

```vue
<template>
  <ResponsiveContainer title="页面标题" mobile-title="移动端标题">
    <template #pc>
      <section class="pc-layout">
        <!-- PC端布局 -->
      </section>
    </template>
    <template #mobile>
      <div class="mobile-layout">
        <!-- 移动端布局 -->
      </div>
    </template>
  </ResponsiveContainer>
</template>
```

### 传统方式：直接使用 useMobile Hook

对于需要更细粒度控制的场景，可以直接使用 `useMobile` hook：

```vue
<script setup>
import { useMobile } from '@/hooks/useMobile'

const { isMobile } = useMobile()
</script>

<template>
  <template v-if="!isMobile">
    <!-- PC端内容 -->
  </template>
  <template v-else>
    <!-- 移动端内容 -->
  </template>
</template>
```

## 已实现的页面

以下页面已完成PC/移动端适配：

1. **消息页面** (`src/views/message/index.vue`)
   - PC: 侧边栏 + 聊天内容
   - 移动端: 页面切换 + 返回按钮

2. **通讯录页面** (`src/views/contact/layout.vue`)
   - PC: SubViewLayout布局
   - 移动端: 顶部标题 + 菜单列表

3. **好友列表** (`src/views/contact/friend.vue`)
   - PC: 表格列表 + 搜索
   - 移动端: 卡片列表 + 搜索

4. **笔记页面** (`src/views/note/index.vue`)
   - PC: 三栏布局（菜单 + 列表 + 内容）
   - 移动端: 单栏列表

5. **设置页面** (`src/views/setting/layout.vue`)
   - PC: SubViewLayout布局
   - 移动端: 顶部标题 + 菜单列表

6. **主布局** (`src/layout/MainLayout.vue`)
   - PC: 左侧菜单 + 内容区
   - 移动端: 内容区 + 底部TabBar

## 移动端断点

当前移动端断点设置为: `768px`

```typescript
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}
```

## 样式规范

### 移动端全局样式

**文件位置**: `src/assets/css/mobile.less`

包含以下内容：
- 禁用横向滚动
- 容器宽度限制
- 触摸区域优化
- 滚动条隐藏
- 头像样式（圆角方形）
- 暗色模式适配

### 暗色模式

所有组件都需要支持暗色模式：

```less
html[theme-mode='dark'] {
  .component-class {
    // 暗色模式样式
  }
}
```

## 最佳实践

1. **优先使用组件**: 对于简单场景，优先使用 `ResponsiveContainer` 组件
2. **统一断点**: 所有页面使用相同的断点 `768px`
3. **复用样式**: 移动端样式尽量复用，避免重复代码
4. **性能优化**: 使用 `useMobile` hook 会自动处理事件监听器的清理
5. **渐进增强**: 先实现PC端功能，再适配移动端

## 注意事项

1. **避免重复注册**: 不要在多个组件中重复使用 `useMobile` hook
2. **清理资源**: `useMobile` hook 会自动清理事件监听器，无需手动处理
3. **样式隔离**: PC端和移动端样式尽量分开，使用 scoped 样式
4. **测试覆盖**: 每个适配的页面都需要在PC和移动端分别测试

## 未来扩展

可以继续扩展的方向：
- 添加更多移动端专用组件
- 支持更多断点（平板、超大屏等）
- 优化移动端手势操作
- 添加移动端动画效果
