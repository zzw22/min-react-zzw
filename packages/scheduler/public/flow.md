```mermaid
flowchart TD
    A[开始] --> B{有新任务?}
    B -->|是| C[调用scheduleCallback]
    C --> D{任务有延迟?}
    D -->|是| E[加入timerQueue]
    D -->|否| F[加入taskQueue]
    E --> G{是否需要启动定时器?}
    G -->|是| H[启动requestHostTimeout]
    F --> I{是否需要启动消息循环?}
    I -->|是| J[启动requestHostCallback]
    H --> K[定时器触发handleTimeout]
    K --> L[调用advanceTimers]
    L --> M[将到期任务从timerQueue移到taskQueue]
    M --> N{taskQueue是否为空?}
    N -->|否| O[启动requestHostCallback]
    J --> P[启动schedulePerformWorkUntilDeadline]
    O --> P
    P --> Q[触发performWorkUntilDeadline]
    Q --> R[调用flushWork]
    R --> S[调用workLoop]
    S --> T{taskQueue是否有任务?}
    T -->|是| U{任务是否超时?}
    U -->|是| V[执行任务回调]
    U -->|否| W{时间切片是否用完?}
    W -->|否| V
    W -->|是| X[返回有更多工作]
    V --> Y{回调是否返回新函数?}
    Y -->|是| Z[更新任务回调]
    Y -->|否| AA[移除任务]
    Z --> BB[返回有更多工作]
    AA --> BB
    BB --> S
    T -->|否| CC{timerQueue是否有任务?}
    CC -->|是| DD[启动requestHostTimeout]
    CC -->|否| EE[返回无更多工作]
    X --> FF[继续调度performWorkUntilDeadline]
    EE --> GG[结束消息循环]
```


### 流程图说明
1. 任务调度流程 ：
   
   - 新任务通过 scheduleCallback 函数进入调度器
   - 根据任务是否有延迟，分别加入 timerQueue 或 taskQueue
   - 有延迟的任务会启动定时器，到期后自动移到 taskQueue
2. 任务执行流程 ：
   
   - 当 taskQueue 有任务时，启动消息循环
   - 通过 performWorkUntilDeadline 函数执行工作
   - 每个任务在时间切片内执行，时间切片用完后交还控制权
   - 任务执行完成后，继续执行下一个任务
3. 时间切片机制 ：
   
   - 每个时间切片默认5毫秒
   - 通过 shouldYieldToHost 函数判断是否需要交还控制权
   - 确保主线程不会被长时间阻塞
