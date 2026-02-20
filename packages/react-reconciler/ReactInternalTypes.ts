/*
 * @Title: 
 * @Author: zhangzhiwei
 * @Date: 2026-02-19 16:47:34
 * @FilePath: \packages\react-reconciler\ReactInternalTypes.ts
 * @Description: 
 */
import type { Flags } from "./ReactFiberFlags";
import { Lanes } from "./ReactFiberLane";
import type { WorkTag } from "./ReactWorkTags";

export type Fiber = {
  // 标记fiber的类型，即描述的组件类型，如原生标签、函数组件、类组件、Fragment等。这里参考ReactWorkTags.js
  tag: WorkTag;

  // 标记组件在当前层级下的的唯一性
  // 满足三大原则：1. 同一层级下 2. 相同类型 3. 相同的key
  key: null | string;

  // elementType和type的区别：
  // elementType是组件的类型，如原生标签、函数组件、类组件等。
  // type是组件的具体实现，如原生标签是字符串，函数组件是函数，类组件是类。
  // 组件类型
  elementType: any;

  // 标记组件类型，如果是原生组件，这里是字符串，如果是函数组件，这里是函数，如果是类组件，这里是类
  type: any;

  // 如果组件是原生标签，DOM；如果是类组件，是实例；如果是函数组件，是null
  // 如果组件是原生根节点，stateNode存的是FiberRoot.  HostRoot=3
  stateNode: any;

  // 父fiber
  return: Fiber | null;

  // 单链表结构
  // 第一个子fiber
  child: Fiber | null;
  // 下一个兄弟fiber
  sibling: Fiber | null;
  // 记录了节点在当前层级中的位置下标，用于diff时候判断节点是否需要发生移动
  index: number;

  // 新的props
  pendingProps: any;
  // 上一次渲染时使用的 props
  memoizedProps: any;

  // 不同的组件的 memoizedState 存储不同
  // 函数组件 hook0
  // 类组件 state
  // HostRoot RootState
  memoizedState: any;

  // 标记本次更新需要执行的副作用（side-effect），如 DOM 插入、更新、删除等，对应 ReactFiberFlags.js 中的 Flags 枚举
  flags: Flags;

  // 缓存fiber
  alternate: Fiber | null;

  // 记录要删除的子节点
  deletions: Array<Fiber> | null;

  // 记录effect
  updateQueue: any;

  // 记录当前 fiber 节点的优先级
  lanes: Lanes;
  // 记录当前 fiber 节点的子节点的优先级
  childLanes: Lanes;
};

export type Container = Element | Document | DocumentFragment;

export type FiberRoot = {
  containerInfo: Container;
  current: Fiber;
  // 一个准备提交 work-in-progress， HostRoot
  finishedWork: Fiber | null;
  pendingLanes: Lanes;
};
