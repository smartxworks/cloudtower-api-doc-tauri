
```sh
curl --location --request POST 'http://CLOUDTOWER_IP/v2/api/enter-maintance-mode' \
--header 'Authorization: YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
    "where": {
        "host_id": $HOST_ID
    },
    "data": {
        "shutdown_vms": $SHUTDOWN_VMS
    }
}'
```
