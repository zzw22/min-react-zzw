<!--
 * @Title: 
 * @Author: zhangzhiwei
 * @Date: 2026-02-19 16:58:14
 * @FilePath: \packages\react-reconciler\ReactFiberLane.md
 * @Description: 
-->
eactFiberLane.ts 是 React Fiber 架构中的核心文件，主要负责 管理更新的优先级 。它通过"车道"（Lane）的概念来实现 React 的并发特性，确保高优先级的更新能够及时响应，低优先级的更新不会阻塞主线程。
 核心功能
1. 优先级管理系统
   
   - 定义了从高到低的优先级层级（同步、输入连续、默认、过渡、重试、空闲等）
   - 使用位掩码（bitmask）技术高效管理多个优先级
   - 提供优先级比较和选择机制
2. 车道分配与管理
   
   - 为不同类型的更新分配专用车道
   - 支持车道的合并、移除、交集等操作
   - 实现过渡车道的循环分配机制
3. 并发控制
   
   - 确定当前应该处理哪些更新（ getNextLanes ）
   - 避免低优先级更新阻塞高优先级更新
   - 支持更新的中断和恢复 运行机制
1. 车道初始化
   
   - 定义 31 个车道（ TotalLanes = 31 ）
   - 为每种优先级分配对应的位掩码
   - 初始化过渡车道计数器
2. 更新调度流程
   
   - 当有更新发生时，根据更新类型分配相应的车道
   - 通过 getNextLanes 选择当前应该处理的最高优先级车道
   - 执行对应车道的更新任务
   - 更新完成后移除相应车道标记
3. 优先级判断
   
   - 使用 getHighestPriorityLane 获取最高优先级车道
   - 通过 higherPriorityLane 比较两个车道的优先级
   - 使用 includesSomeLane 检查是否包含特定优先级的车道 关键函数解析
1. getNextLanes(root, wipLanes)
   
   - 作用 ：决定下一组要处理的车道
   - 逻辑 ：获取最高优先级车道，如果当前正在处理的车道优先级更高，则继续处理当前车道
   - 调用时机 ：在渲染阶段开始时，决定本次渲染应该处理哪些更新
2. getHighestPriorityLane(lanes)
   
   - 作用 ：获取一组车道中优先级最高的那个
   - 原理 ：使用 lanes & -lanes 获取最低位的 1，对应最高优先级
   - 应用 ：在多个更新同时存在时，选择优先级最高的进行处理
3. claimNextTransitionLane()
   
   - 作用 ：为过渡更新分配车道
   - 机制 ：循环使用过渡车道，确保每个过渡更新都有独立车道
   - 应用 ：用于 useTransition 等并发特性
4. removeLanes(set, subset)
   
   - 作用 ：从车道集合中移除特定车道
   - 原理 ：使用位运算 set & ~subset
   - 应用 ：更新完成后清理车道标记 在 React 渲染流程中的位置
ReactFiberLane.ts 在 React 渲染流程中扮演着重要角色：

1. 调度阶段 ：
   
   - 当组件状态变化时， scheduleUpdateOnFiber 会为更新分配车道
   - 通过 requestUpdateLane 确定更新的优先级
2. 渲染阶段 ：
   
   - performConcurrentWorkOnRoot 调用 getNextLanes 选择要处理的车道
   - 根据车道优先级决定是否中断当前渲染
3. 提交阶段 ：
   
   - 更新完成后，通过 markRootFinished 清理相关车道标记 优先级层级划分
优先级 车道类型 示例 用途 最高 同步车道 SyncLane 用户输入、关键更新 高 输入连续车道 InputContinuousLane 连续输入（如拖拽） 中 默认车道 DefaultLane 一般状态更新 中低 过渡车道 TransitionLane1-15 useTransition 更新 低 重试车道 RetryLane1-4 失败重试 最低 空闲车道 IdleLane 空闲时执行的任务
 技术亮点
1. 位掩码技术 ：使用位运算高效管理多个优先级，减少内存占用和提高计算速度
2. 优先级继承 ：确保相关更新能够继承正确的优先级
3. 动态车道分配 ：通过循环分配过渡车道，避免车道耗尽
4. 中断机制 ：支持高优先级更新中断低优先级更新，提高响应速度
### 总结
ReactFiberLane.ts 是 React 并发特性的核心实现，通过精心设计的车道系统，确保了 React 应用能够：

- 及时响应用户输入等紧急更新
- 平滑处理过渡动画等非紧急更新
- 避免更新阻塞导致的界面卡顿
- 支持可中断的渲染过程
这种基于优先级的调度机制，是 React 18 及以后版本实现 Concurrent Mode 的关键技术之一，为用户带来了更加流畅的交互体验。