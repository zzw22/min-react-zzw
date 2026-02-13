// ! 实现一个单线程任务调度器
import { getCurrentTime } from "shared/utils";
import { peek, pop, push } from "./SchedulerMinHeap";
import {
  PriorityLevel,
  NormalPriority,
  IdlePriority,
  ImmediatePriority,
  LowPriority,
  UserBlockingPriority,
  NoPriority,
} from "./SchedulerPriorities";
import {
  lowPriorityTimeout,
  maxSigned31BitInt,
  normalPriorityTimeout,
  userBlockingPriorityTimeout,
} from "./SchedulerFeatureFlags";

/**
 * 任务回调函数类型定义
 * @param didUserCallbackTimeout 表示任务是否已超时
 * @returns 可以返回一个新的回调函数表示任务需要继续执行，或返回null/undefined表示任务完成
 */
type Callback = (didUserCallbackTimeout: boolean) => Callback | null | undefined;

/**
 * 任务类型定义
 */
export type Task = {
  id: number; // 任务的唯一标识
  callback: Callback | null; // 任务的回调函数
  priorityLevel: PriorityLevel; // 任务的优先级
  startTime: number; // 任务的开始时间
  expirationTime: number; // 任务的过期时间
  sortIndex: number; // 任务在堆中的排序索引
};

/**
 * 任务队列（最小堆）：存储没有延迟的任务
 */
const taskQueue: Array<Task> = [];

/**
 * 定时器队列（最小堆）：存储有延迟的任务
 */
const timerQueue: Array<Task> = [];

/**
 * 任务ID计数器，用于生成唯一的任务ID
 */
let taskIdCounter = 1;

/**
 * 当前正在执行的任务
 */
let currentTask: Task | null = null;

/**
 * 当前正在执行任务的优先级
 */
let currentPriorityLevel: PriorityLevel = NoPriority;

/**
 * 记录时间切片的起始时间戳
 */
let startTime = -1;

/**
 * 时间切片的长度（毫秒）
 */
let frameInterval = 5;

/**
 * 是否有工作正在执行的标志
 */
let isPerformingWork = false;

/**
 * 主线程是否正在调度的标志
 */
let isHostCallbackScheduled = false;

/**
 * 消息循环是否正在运行的标志
 */
let isMessageLoopRunning = false;

/**
 * 是否有任务在倒计时的标志
 */
let isHostTimeoutScheduled = false;

/**
 * 任务超时的定时器ID
 */
let taskTimeoutID = -1;

/**
 * 判断是否应该将控制权交还给主线程
 * 当时间切片已用完时，应该将控制权交还给主线程
 * @returns 是否应该交还控制权
 */
function shouldYieldToHost() {
  const timeElapsed = getCurrentTime() - startTime;

  if (timeElapsed < frameInterval) {
    return false;
  }

  return true;
}

/**
 * 任务调度器的入口函数，用于调度一个新任务
 * @param priorityLevel 任务的优先级
 * @param callback 任务的回调函数
 * @param options 可选的调度选项，包含delay属性表示延迟执行的时间
 */
function scheduleCallback(
  priorityLevel: PriorityLevel,
  callback: Callback,
  options?: { delay: number }
) {
  const currentTime = getCurrentTime();
  let startTime;

  if (typeof options === "object" && options !== null) {
    let delay = options.delay;
    if (typeof delay === "number" && delay > 0) {
      // 有效的延迟时间
      startTime = currentTime + delay;
    } else {
      // 无效的延迟时间
      startTime = currentTime;
    }
  } else {
    // 无延迟
    startTime = currentTime;
  }

  // expirationTime 是过期时间，理论上的任务执行时间

  let timeout: number;
  switch (priorityLevel) {
    case ImmediatePriority:
      // 立即超时，SVVVVIP
      timeout = -1;
      break;
    case UserBlockingPriority:
      // 最终超时，VIP
      timeout = userBlockingPriorityTimeout;
      break;
    case IdlePriority:
      // 永不超时
      timeout = maxSigned31BitInt;
      break;
    case LowPriority:
      // 最终超时
      timeout = lowPriorityTimeout;
      break;
    case NormalPriority:
    default:
      timeout = normalPriorityTimeout;
      break;
  }

  const expirationTime = startTime + timeout;
  const newTask: Task = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: -1,
  };

  // 如果任务开始时间晚于当前时间，说明任务有延迟
  if (startTime > currentTime) {
    // newTask任务有延迟
    newTask.sortIndex = startTime;
    // 任务在timerQueue到达开始时间之后，就会被推入 taskQueue
    push(timerQueue, newTask);
    // 每次只倒计时一个任务，倒计时的任务就是堆顶任务
    if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
      if (isHostTimeoutScheduled) {
        // newTask 才是堆顶任务，才应该最先到达执行时间，newTask应该被倒计时，但是其他任务也被倒计时了，说明有问题
        cancelHostTimeout();
      } else {
        isHostTimeoutScheduled = true;
      }

      requestHostTimeout(handleTimeout, startTime - currentTime);
    }
  } else {
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);

    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;
      requestHostCallback();
    }
  }
}

/**
 * 请求主线程调度工作
 */
function requestHostCallback() {
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    schedulePerformWorkUntilDeadline();
  }
}

/**
 * 执行工作直到时间切片结束
 */
function performWorkUntilDeadline() {
  if (isMessageLoopRunning) {
    const currentTime = getCurrentTime();
    // 记录了一个work的起始时间，其实就是一个时间切片的起始时间，这是个时间戳
    startTime = currentTime;
    let hasMoreWork = true;
    try {
      // 推进定时器队列，将已到开始时间的任务从timerQueue移动到taskQueue
      advanceTimers(currentTime);
      // 刷新工作队列，执行所有可以执行的任务
      hasMoreWork = flushWork(currentTime);
    } finally {
      if (hasMoreWork) {
        schedulePerformWorkUntilDeadline();
      } else {
        isMessageLoopRunning = false;
      }
    }
  }
}

/**
 * 使用MessageChannel创建一个宏任务来调度工作
 * 这样可以确保工作在主线程空闲时执行
 */
const channel = new MessageChannel();
const port = channel.port2;
channel.port1.onmessage = performWorkUntilDeadline;

/**
 * 调度工作直到时间切片结束
 */
function schedulePerformWorkUntilDeadline() {
  port.postMessage(null);
}

/**
 * 刷新工作队列，执行所有可以执行的任务
 * @param initialTime 初始时间
 * @returns 是否还有更多工作需要执行
 */
function flushWork(initialTime: number) {
  isHostCallbackScheduled = false;
  isPerformingWork = true;

  let previousPriorityLevel = currentPriorityLevel;
  try {
    return workLoop(initialTime);
  } finally {
    currentTask = null;
    currentPriorityLevel = previousPriorityLevel;
    isPerformingWork = false;
  }
}
/**
 * 取消当前正在执行的任务
 * 由于最小堆没法直接删除任务，因此只能将任务的callback设置为null
 * 当任务位于堆顶时会被自动删除
 */
function cancelCallback() {
  currentTask!.callback = null;
}

/**
 * 获取当前正在执行任务的优先级
 * @returns 当前任务的优先级
 */
function getCurrentPriorityLevel(): PriorityLevel {
  return currentPriorityLevel;
}

/**
 * 工作循环函数，执行所有可以执行的任务
 * 一个work就是一个时间切片内执行的一些task
 * 时间切片要循环，就是work要循环(loop)
 * @param initialTime 初始时间
 * @returns 是否还有更多任务需要执行
 */
function workLoop(initialTime: number): boolean {
  let currentTime = initialTime;
  advanceTimers(currentTime);
  currentTask = peek(taskQueue);
  while (currentTask !== null) {
    if (currentTask.expirationTime > currentTime && shouldYieldToHost()) {
      break;
    }

    // 执行任务
    const callback = currentTask.callback;
    if (typeof callback === "function") {
      // 有效的任务
      currentTask.callback = null;
      currentPriorityLevel = currentTask.priorityLevel;
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      const continuationCallback = callback(didUserCallbackTimeout);
      currentTime = getCurrentTime();
      if (typeof continuationCallback === "function") {
        currentTask.callback = continuationCallback;
        advanceTimers(currentTime);
        return true;
      } else {
        if (currentTask === peek(taskQueue)) {
          pop(taskQueue);
        }
        advanceTimers(currentTime);
      }
    } else {
      // 无效的任务
      pop(taskQueue);
    }

    currentTask = peek(taskQueue);
  }

  if (currentTask !== null) {
    return true;
  } else {
    const firstTimer = peek(timerQueue);
    if (firstTimer !== null) {
      requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
    }

    return false;
  }
}

/**
 * 请求一个主机超时
 * @param callback 超时后要执行的回调函数
 * @param ms 超时时间（毫秒）
 */
function requestHostTimeout(
  callback: (currentTime: number) => void,
  ms: number
) {
  taskTimeoutID = setTimeout(() => {
    callback(getCurrentTime());
  }, ms);
}

/**
 * 取消主机超时
 */
function cancelHostTimeout() {
  clearTimeout(taskTimeoutID);
  taskTimeoutID = -1;
}

/**
 * 推进定时器队列，将已到开始时间的任务从timerQueue移动到taskQueue
 * @param currentTime 当前时间
 */
function advanceTimers(currentTime: number) {
  let timer = peek(timerQueue);
  while (timer !== null) {
    if (timer.callback === null) {
      // 无效的任务
      pop(timerQueue);
    } else if (timer.startTime <= currentTime) {
      // 有效的任务
      // 任务已经到达开始时间，可以推入taskQueue
      pop(timerQueue);
      timer.sortIndex = timer.expirationTime;
      push(taskQueue, timer);
    } else {
      return;
    }
    timer = peek(timerQueue);
  }
}

/**
 * 处理超时事件，将已到开始时间的延迟任务从timerQueue移动到taskQueue
 * @param currentTime 当前时间
 */
function handleTimeout(currentTime: number) {
  isHostTimeoutScheduled = false;
  //  把延迟任务从timerQueue中推入taskQueue
  advanceTimers(currentTime);

  if (!isHostCallbackScheduled) {
    if (peek(taskQueue) !== null) {
      isHostCallbackScheduled = true;
      requestHostCallback();
    } else {
      const firstTimer = peek(timerQueue);
      if (firstTimer !== null) {
        requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
      }
    }
  }
}
// todo 实现一个单线程任务调度器
export {
  ImmediatePriority,
  UserBlockingPriority,
  NormalPriority,
  IdlePriority,
  LowPriority,
  scheduleCallback, // 某个任务进入调度器，等待调度
  cancelCallback, // 取消某个任务，由于最小堆没法直接删除，因此只能初步把 task.callback 设置为null
  getCurrentPriorityLevel, // 获取当前正在执行任务的优先级
  shouldYieldToHost as shouldYield, // 把控制权交换给主线程
};
