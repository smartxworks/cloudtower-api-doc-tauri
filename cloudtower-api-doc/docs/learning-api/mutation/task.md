---
title: 异步任务
---

### 返回值
CloudTower API 的变更类请求的返回值的类型将会是 `WithTask<T>` 对象或者一个对象数组 `Array<WithTask<T>>`, `WithTask` 是一个泛型类型，携带了 task_id 和对应的返回值。

```typescript
type WithTask<T> = {
  task_id: string | null;
  data: T;
};
```

这个设计是由于 CloudTower API 大部分都是异步的，为不堵塞调用，我们会在占位资源被创建后立刻返回，同时返回一个 task_id。所以变更请求正确返回了并不一定能代表请求真的成功了，返回的 data 也只能代表一个临时的状态，除了资源的 id 以外，其余值都是不稳定的。我们可以根据 task_id， 通过 `/v2/api/get-tasks` 来查询任务的状态，直到任务成功或者失败，才能真正的确认请求是否成功。同时再次使用返回的 data 的 id 来查询资源的最新状态。
如果 task_id 为 null， 则说明该请求是同步的，无需等待任务完成。