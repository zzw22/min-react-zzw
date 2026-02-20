import { FiberRoot } from "./ReactInternalTypes";

// 车道类型定义
export type Lanes = number;      // 车道集合（多个车道的位掩码）
export type Lane = number;       // 单个车道
export type LaneMap<T> = Array<T>; // 车道映射表

// 总车道数
export const TotalLanes = 31;

// 基础常量
// lane都是数字，可以表示优先级。lane值越小，优先级越高。
export const NoLanes: Lanes = /*                        */ 0b0000000000000000000000000000000; // 无车道
export const NoLane: Lane = /*                          */ 0b0000000000000000000000000000000;  // 无车道

// 同步车道（最高优先级）
export const SyncHydrationLane: Lane = /*               */ 0b0000000000000000000000000000001; // 同步水合车道
export const SyncLane: Lane = /*                        */ 0b0000000000000000000000000000010; // 同步车道
export const SyncLaneIndex: number = 1;                 // 同步车道索引

// 输入连续车道（高优先级）
export const InputContinuousHydrationLane: Lane = /*    */ 0b0000000000000000000000000000100; // 输入连续水合车道
export const InputContinuousLane: Lane = /*             */ 0b0000000000000000000000000001000; // 输入连续车道

// 默认车道（中优先级）
export const DefaultHydrationLane: Lane = /*            */ 0b0000000000000000000000000010000; // 默认水合车道
export const DefaultLane: Lane = /*                     */ 0b0000000000000000000000000100000; // 默认车道

// 同步更新车道集合
export const SyncUpdateLanes: Lane =
  SyncLane | InputContinuousLane | DefaultLane;

// 过渡车道（中低优先级）
const TransitionHydrationLane: Lane = /*                */ 0b0000000000000000000000001000000; // 过渡水合车道
const TransitionLanes: Lanes = /*                       */ 0b0000000001111111111111110000000; // 过渡车道集合
const TransitionLane1: Lane = /*                        */ 0b0000000000000000000000010000000; // 过渡车道1
const TransitionLane2: Lane = /*                        */ 0b0000000000000000000000100000000; // 过渡车道2
const TransitionLane3: Lane = /*                        */ 0b0000000000000000000001000000000; // 过渡车道3
const TransitionLane4: Lane = /*                        */ 0b0000000000000000000010000000000; // 过渡车道4
const TransitionLane5: Lane = /*                        */ 0b0000000000000000000100000000000; // 过渡车道5
const TransitionLane6: Lane = /*                        */ 0b0000000000000000001000000000000; // 过渡车道6
const TransitionLane7: Lane = /*                        */ 0b0000000000000000010000000000000; // 过渡车道7
const TransitionLane8: Lane = /*                        */ 0b0000000000000000100000000000000; // 过渡车道8
const TransitionLane9: Lane = /*                        */ 0b0000000000000001000000000000000; // 过渡车道9
const TransitionLane10: Lane = /*                       */ 0b0000000000000010000000000000000; // 过渡车道10
const TransitionLane11: Lane = /*                       */ 0b0000000000000100000000000000000; // 过渡车道11
const TransitionLane12: Lane = /*                       */ 0b0000000000001000000000000000000; // 过渡车道12
const TransitionLane13: Lane = /*                       */ 0b0000000000010000000000000000000; // 过渡车道13
const TransitionLane14: Lane = /*                       */ 0b0000000000100000000000000000000; // 过渡车道14
const TransitionLane15: Lane = /*                       */ 0b0000000001000000000000000000000; // 过渡车道15

// 重试车道（低优先级）
const RetryLanes: Lanes = /*                            */ 0b0000011110000000000000000000000; // 重试车道集合
const RetryLane1: Lane = /*                             */ 0b0000000010000000000000000000000; // 重试车道1
const RetryLane2: Lane = /*                             */ 0b0000000100000000000000000000000; // 重试车道2
const RetryLane3: Lane = /*                             */ 0b0000001000000000000000000000000; // 重试车道3
const RetryLane4: Lane = /*                             */ 0b0000010000000000000000000000000; // 重试车道4

export const SomeRetryLane: Lane = RetryLane1;          // 某个重试车道

// 选择性水合车道
export const SelectiveHydrationLane: Lane = /*          */ 0b0000100000000000000000000000000; // 选择性水合车道

// 非空闲车道集合
const NonIdleLanes: Lanes = /*                          */ 0b0000111111111111111111111111111; // 非空闲车道集合

// 空闲车道（最低优先级）
export const IdleHydrationLane: Lane = /*               */ 0b0001000000000000000000000000000; // 空闲水合车道
export const IdleLane: Lane = /*                        */ 0b0010000000000000000000000000000; // 空闲车道

// 特殊车道
export const OffscreenLane: Lane = /*                   */ 0b0100000000000000000000000000000; // 离屏车道
export const DeferredLane: Lane = /*                    */ 0b1000000000000000000000000000000; // 延迟车道

// 可调度更新的车道集合
// Any lane that might schedule an update. This is used to detect infinite
// update loops, so it doesn't include hydration lanes or retries.
export const UpdateLanes: Lanes =
  SyncLane | InputContinuousLane | DefaultLane | TransitionLanes;

// 下一个过渡车道
let nextTransitionLane: Lane = TransitionLane1;

// 判断是否是过渡车道
export function isTransitionLane(lane: Lane): boolean {
  return (lane & TransitionLanes) !== NoLanes;
}

// 判断是否包含非空闲工作
export function includesNonIdleWork(lanes: Lanes): boolean {
  return (lanes & NonIdleLanes) !== NoLanes;
}

// 获取优先级最高的车道
// 因为在 lane 的值中，值越小，代表的优先级越高
// 获取最低位的1，如4194240&-4194240就是64
// 负数原码转换为补码的方法：符号位保持1不变，数值位按位求反，末位加1
export function getHighestPriorityLane(lanes: Lanes): Lane {
  return lanes & -lanes;
}

// 判断是否包含某个车道或某些车道
export function includesSomeLane(a: Lanes | Lane, b: Lanes | Lane): boolean {
  return (a & b) !== NoLanes;
}

// 合并两个车道或车道集合
export function mergeLanes(a: Lanes | Lane, b: Lanes | Lane): Lanes {
  return a | b;
}

// 从车道集合中移除某个车道或某些车道
// 比如执行完节点的 Update 操作之后，则需要移除 fiber.flags 的 Update
export function removeLanes(set: Lanes, subset: Lanes | Lane): Lanes {
  return set & ~subset;
}

// 获取两个车道集合的交集
// 与 includesSomeLane 不同，includesSomeLane返回的是是否有交叉，即结果是boolean
// intersectLanes 返回交叉的车道集合
export function intersectLanes(a: Lanes | Lane, b: Lanes | Lane): Lanes {
  return a & b;
}

// 返回优先级较高的车道
// 如果 a < b, 则说明a的优先级高于b，因为lane越小，优先级越高
export function higherPriorityLane(a: Lane, b: Lane): Lane {
  return a !== NoLane && a < b ? a : b;
}

// 获取下一组要处理的车道
// 用于确定当前应该处理哪些车道的更新
export function getNextLanes(root: FiberRoot, wipLanes: Lanes): Lanes {
  const pendingLanes = root.pendingLanes;
  if (pendingLanes === NoLanes) {
    return NoLanes;
  }

  let nextLanes = getHighestPriorityLanes(pendingLanes);

  if (nextLanes === NoLanes) {
    return NoLanes;
  }
  
  // 如果我们已经在render阶段中，切换lanes会中断当前渲染进程，导致丢失进度
  // 只有当新lanes的优先级更高时，我们才应该这样做
  if (wipLanes !== NoLanes && wipLanes !== nextLanes) {
    const nextLane = getHighestPriorityLane(nextLanes);
    const wipLane = getHighestPriorityLane(wipLanes);
    if (
      nextLane >= wipLane ||
      // Default priority updates不应中断transition
      // default updates和transition updates之间唯一的区别在于前者不支持刷新过渡
      (nextLane === DefaultLane && (wipLane & TransitionLanes) !== NoLanes)
    ) {
      // 继续完成正在进行中的树，不中断
      return wipLanes;
    }
  }

  return nextLanes;
}

// 获取最高优先级的车道集合
function getHighestPriorityLanes(lanes: Lanes | Lane): Lanes {
  // 首先检查是否有同步更新车道
  const pendingSyncLanes = lanes & SyncUpdateLanes;
  if (pendingSyncLanes !== 0) {
    // 将DefaultLane、SyncLane和ContinuousLane统一为SyncLane
    // 并在根上使用一个单独的字段来跟踪它们应该使用queueMicrotask、requestAnimationFrame还是完全同步（在flushSync的情况下）进行调度
    // https://github.com/facebook/react/pull/25524
    return pendingSyncLanes;
  }
  
  // 根据最高优先级的车道类型返回相应的车道集合
  switch (getHighestPriorityLane(lanes)) {
    case SyncHydrationLane:
      return SyncHydrationLane;
    case SyncLane:
      return SyncLane;
    case InputContinuousHydrationLane:
      return InputContinuousHydrationLane;
    case InputContinuousLane:
      return InputContinuousLane;
    case DefaultHydrationLane:
      return DefaultHydrationLane;
    case DefaultLane:
      return DefaultLane;
    case TransitionHydrationLane:
      return TransitionHydrationLane;
    case TransitionLane1:
    case TransitionLane2:
    case TransitionLane3:
    case TransitionLane4:
    case TransitionLane5:
    case TransitionLane6:
    case TransitionLane7:
    case TransitionLane8:
    case TransitionLane9:
    case TransitionLane10:
    case TransitionLane11:
    case TransitionLane12:
    case TransitionLane13:
    case TransitionLane14:
    case TransitionLane15:
      return lanes & TransitionLanes;
    case RetryLane1:
    case RetryLane2:
    case RetryLane3:
    case RetryLane4:
      return lanes & RetryLanes;
    case SelectiveHydrationLane:
      return SelectiveHydrationLane;
    case IdleHydrationLane:
      return IdleHydrationLane;
    case IdleLane:
      return IdleLane;
    case OffscreenLane:
      return OffscreenLane;
    case DeferredLane:
      // 延迟工作应该总是与其他工作纠缠在一起，所以这不应该被访问到
      return NoLanes;
    default:
      // 这不应该被访问到，但作为回退，返回整个位掩码
      return lanes;
  }
}

// 判断是否只包含非紧急的车道
export function includesOnlyNonUrgentLanes(lanes: Lanes): boolean {
  // TODO: Should hydration lanes be included here? This function is only
  // used in `updateDeferredValueImpl`.
  const UrgentLanes = SyncLane | InputContinuousLane | DefaultLane;
  return (lanes & UrgentLanes) === NoLanes;
}

// 判断是否只包含过渡车道
export function includesOnlyTransitions(lanes: Lanes): boolean {
  return (lanes & TransitionLanes) === lanes;
}

// 申请下一个过渡车道
// 循环遍历车道，将每个新的transition分配到下一个车道
// 在大多数情况下，这意味着每个transition都有自己的车道，直到我们用完所有车道并循环回到开头
export function claimNextTransitionLane(): Lane {
  const lane = nextTransitionLane;
  nextTransitionLane <<= 1;
  if ((nextTransitionLane & TransitionLanes) === NoLanes) {
    nextTransitionLane = TransitionLane1;
  }
  return lane;
}


