/**
 * 堆的类型定义，本质是一个数组
 * @template T 堆中元素的类型，必须是Node类型或其子类型
 */
export type Heap<T extends Node> = Array<T>;

/**
 * 堆节点的类型定义
 */
export type Node = {
  id: number; // 任务的唯一标识
  sortIndex: number; // 排序的依据，值越小优先级越高
};

/**
 * 获取堆顶元素（最小堆的堆顶是最小元素）
 * @param heap 堆数组
 * @returns 堆顶元素，如果堆为空则返回null
 */
export function peek<T extends Node>(heap: Heap<T>): T | null {
  return heap.length === 0 ? null : heap[0];
}

/**
 * 向堆中添加元素并调整堆结构，保持最小堆性质
 * @param heap 堆数组
 * @param node 要添加的节点
 */
export function push<T extends Node>(heap: Heap<T>, node: T): void {
  // 1. 把node放到堆的最后
  const index = heap.length;
  heap.push(node);
  // 2. 调整最小堆，从下往上堆化
  siftUp(heap, node, index);
}

/**
 * 从下往上堆化，调整堆结构以保持最小堆性质
 * 当新元素添加到堆末尾时，需要将其向上移动到正确位置
 * @param heap 堆数组
 * @param node 要调整的节点
 * @param i 节点当前所在的索引位置
 */
function siftUp<T extends Node>(heap: Heap<T>, node: T, i: number): void {
  let index = i;
  while (index > 0) {
    const parentIndex = (index - 1) >>> 1;
    const parent = heap[parentIndex];
    if (compare(parent, node) > 0) {
      // node子节点更小，和根节点交换
      heap[parentIndex] = node;
      heap[index] = parent;
      index = parentIndex;
    } else {
      return;
    }
  }
}

/**
 * 删除并返回堆顶元素（最小堆的堆顶是最小元素）
 * 删除后会调整堆结构以保持最小堆性质
 * @param heap 堆数组
 * @returns 被删除的堆顶元素，如果堆为空则返回null
 */
export function pop<T extends Node>(heap: Heap<T>): T | null {
  if (heap.length === 0) {
    return null;
  }
  const first = heap[0];
  const last = heap.pop()!;
  if (first !== last) {
    // 证明heap中有2个或者更多个元素
    heap[0] = last;
    siftDown(heap, last, 0);
  }

  return first;
}

/**
 * 从上往下堆化，调整堆结构以保持最小堆性质
 * 当堆顶元素被替换后，需要将其向下移动到正确位置
 * @param heap 堆数组
 * @param node 要调整的节点
 * @param i 节点当前所在的索引位置
 */
function siftDown<T extends Node>(heap: Heap<T>, node: T, i: number): void {
  let index = i;
  const length = heap.length;
  const halfLength = length >>> 1;
  while (index < halfLength) {
    const leftIndex = (index + 1) * 2 - 1;
    const left = heap[leftIndex];
    const rightIndex = leftIndex + 1;
    const right = heap[rightIndex]; // right不一定存在，等下还要判断是否存在
    if (compare(left, node) < 0) {
      // left<node
      if (rightIndex < length && compare(right, left) < 0) {
        // right存在，且right<left
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        // left更小或者right不存在
        heap[index] = left;
        heap[leftIndex] = node;
        index = leftIndex;
      }
    } else if (rightIndex < length && compare(right, node) < 0) {
      // left>=node && right<node
      heap[index] = right;
      heap[rightIndex] = node;
      index = rightIndex;
    } else {
      // 根节点最小，不需要调整
      return;
    }
  }
}

/**
 * 比较两个节点的优先级
 * 首先比较sortIndex，sortIndex小的优先级高
 * 如果sortIndex相同，则比较id，id小的优先级高
 * @param a 要比较的第一个节点
 * @param b 要比较的第二个节点
 * @returns 比较结果，负数表示a优先级高，正数表示b优先级高，0表示相等
 */
function compare(a: Node, b: Node) {
  const diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
}
