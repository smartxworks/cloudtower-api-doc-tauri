```bash
curl --location --request POST 'http://CLOUDTOWER_IP/v2/api/get-tasks' \ --header 'Authorization: YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
"where": {
"id": "STEP_2_TASK_ID"
} }'
```