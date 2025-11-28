---
title: Asynchronous Task
---
import Terminology from '@site/terminology.json'

### Return Value
<>When you use {Terminology['en-US']['PRODUCT']} to manage resources, most of the time, the actual operations are put into an asynchronous task to execute, therefore, after an API that includes such operations as creation, deletion, and modification returns a result, the corresponding operations may still be in execution, and the status of the operations will be displayed by the corresponding asynchronous task.</>

In order to keep API invocations concise and consistent, this type of APIs will return the asynchronous task id as a parameter of `{ task_id: string }`.

After obtaining the `task_id`, you can further query the status and results of the asynchronous task via `/get-tasks`. Refer to `Task Center`for specific parameter types.

Please note that when a resource executes an asynchronous task, only the resource id is credible and stable, but the other fields of this resource and the fields of its associated resources could be modified in the asynchronous task. If you need to perform query or other operations on these fields, please use the resource id to perform operations again after the asynchronous task is completed.