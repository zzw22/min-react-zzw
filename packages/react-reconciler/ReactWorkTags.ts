/*
 * @Title: React 工作标签定义
 * @Author: zhangzhiwei
 * @Date: 2026-02-19 16:53:54
 * @FilePath: \packages\react-reconciler\ReactWorkTags.ts
 * @Description: 定义 React 中各种组件和节点的类型标签
 */

// 工作标签类型定义
export type WorkTag =
  | 0   // FunctionComponent
  | 1   // ClassComponent
  | 2   // IndeterminateComponent
  | 3   // HostRoot
  | 4   // HostPortal
  | 5   // HostComponent
  | 6   // HostText
  | 7   // Fragment
  | 8   // Mode
  | 9   // ContextConsumer
  | 10  // ContextProvider
  | 11  // ForwardRef
  | 12  // Profiler
  | 13  // SuspenseComponent
  | 14  // MemoComponent
  | 15  // SimpleMemoComponent
  | 16  // LazyComponent
  | 17  // IncompleteClassComponent
  | 18  // DehydratedFragment
  | 19  // SuspenseListComponent
  | 21  // ScopeComponent
  | 22  // OffscreenComponent
  | 23  // LegacyHiddenComponent
  | 24  // CacheComponent
  | 25  // TracingMarkerComponent
  | 26  // HostHoistable
  | 27  // HostSingleton;

// 组件类型标签
export const FunctionComponent = 0;                     // 函数组件
export const ClassComponent = 1;                        // 类组件
export const IndeterminateComponent = 2;                // 未确定类型的组件（在知道是函数还是类之前）

// 宿主环境相关标签
export const HostRoot = 3;                              // 宿主树的根节点，可能嵌套在另一个节点内
export const HostPortal = 4;                            // 子树，可能是不同渲染器的入口点
export const HostComponent = 5;                         // 宿主组件（如 DOM 元素）
// 示例：在 reconciler 中用于标记原生 DOM 节点，如 <div>、<span> 等，对应 fiber.tag = HostComponent
export const HostText = 6;                              // 宿主文本节点
// 示例：在 reconciler 中用于标记普通的文本节点，如 <div> 中的文本，对应 fiber.tag = HostText
export const HostHoistable = 26;                        // 可提升的宿主组件
// 示例：在 reconciler 中用于标记可提升的宿主组件，如 <div>、<span> 等，对应 fiber.tag = HostHoistable
export const HostSingleton = 27;                        // 单例宿主组件
// 示例：在 reconciler 中用于标记单例组件，如 <body>、<html> 等，对应 fiber.tag = HostSingleton



// 结构相关标签
export const Fragment = 7;                              // 片段组件（<>...</>）
export const DehydratedFragment = 18;                   // 脱水片段（服务端渲染相关）

// 上下文相关标签
export const ContextConsumer = 9;                       // 上下文消费者
export const ContextProvider = 10;                      // 上下文提供者

// 特殊功能组件标签
export const ForwardRef = 11;                           // 转发 ref 的组件
export const Profiler = 12;                             // 性能分析组件
export const SuspenseComponent = 13;                    //  suspense 组件
export const SuspenseListComponent = 19;                // suspense 列表组件
export const MemoComponent = 14;                        // memo 组件（带比较函数）
export const SimpleMemoComponent = 15;                  // 简单 memo 组件（使用浅比较）
export const LazyComponent = 16;                        // 懒加载组件

// 状态相关标签
export const IncompleteClassComponent = 17;             // 未完成的类组件（正在初始化）

// 模式和作用域标签
export const Mode = 8;                                  // 模式组件（如 StrictMode）
export const ScopeComponent = 21;                       // 作用域组件

// 高级特性标签
export const OffscreenComponent = 22;                   // 离屏组件（用于虚拟化等）
export const LegacyHiddenComponent = 23;                // 遗留的隐藏组件
export const CacheComponent = 24;                       // 缓存组件（React 18+）
export const TracingMarkerComponent = 25;               // 追踪标记组件
