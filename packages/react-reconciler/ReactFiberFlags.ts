/*
 * @Title: 
 * @Author: zhangzhiwei
 * @Date: 2026-02-19 16:48:33
 * @FilePath: \packages\react-reconciler\ReactFiberFlags.js
 * @Description: 
 */
export type Flags = number;

// 无标志位
export const NoFlags = /*                      */ 0b0000000000000000000000000000;
// 放置操作：组件首次渲染时添加到DOM
export const Placement = /*                    */ 0b0000000000000000000000000010;
// 更新操作：组件props或state变化导致的重新渲染
export const Update = /*                       */ 0b0000000000000000000000000100; // 4
// 子组件删除操作：从DOM中移除子组件
export const ChildDeletion = /*                */ 0b0000000000000000000000010000; // 16
// 被动操作：如useEffect中的副作用
export const Passive = /*                      */ 0b0000000000000000100000000000; // 2048
