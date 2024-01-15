```sh
curl --location --request POST 'http://CLOUDTOWER_IP/v2/api/enter-maintance-mode-precheck-result' \
--header 'Authorization: YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
    "where": {
        "id": $TASK_ID
    }
}'
```
