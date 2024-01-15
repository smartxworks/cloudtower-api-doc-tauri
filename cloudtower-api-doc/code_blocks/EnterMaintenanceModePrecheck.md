```sh
curl --location --request POST 'http://CLOUDTOWER_IP/v2/api/enter-maintenance-mode-precheck' \
--header 'Authorization: YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
    "where": {
        "id": "$HOST_ID"
    }
}'
```
