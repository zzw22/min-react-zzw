/*
 * @Title: 
 * @Author: zhangzhiwei
 * @Date: 2026-02-13 23:41:33
 * @FilePath: \packages\scheduler\src\SchedulerPriorities.ts
 * @Description: 
 */
export type PriorityLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const NoPriority = 0;
export const ImmediatePriority = 1;
export const UserBlockingPriority = 2;
export const NormalPriority = 3;
export const LowPriority = 4;
export const IdlePriority = 5;
