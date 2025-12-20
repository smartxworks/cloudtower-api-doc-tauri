---
title: Asynchronous tasks
---

import Terminology from '@site/terminology.json'

### Return value

The return value of <>{Terminology['terminology']['en-US']['PRODUCT']} API requests that perform changes is either a <code>WithTask{`<T>`}</code> object or <code>Array{`<WithTask<T>>`}</code> objects. <code>WithTask</code> is a generic type that contains `task_id` and the corresponding return value. </>

```typescript
type WithTask<T> = {
  task_id: string | null;
  data: T;
};
```

<>This design exists because most {Terminology['terminology']['en-US']['PRODUCT']} API requests are asynchronous. To avoid blocking the caller, the API immediately returns after creating a placeholder resource, along with `task_id`. Therefore, a successful response from a change request does not necessarily mean that the request has actually succeeded. The returned data only represents a temporary state. Fields are unstable other than the resource ID. </>

You can track the task status using the `task_id` via `/v2/api/get-tasks`. You need to continuously poll until the task ends (task completed or failed) in order to know whether the task result is successful or failed, and thus confirm whether the request was truly successful. Meanwhile, you can use the ID in the returned data to query the latest state of the resource. If `task_id` is `null`, it indicates that the request is synchronous and there is no need to wait for the task to complete.