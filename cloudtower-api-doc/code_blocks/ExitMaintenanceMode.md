
```sh
curl --location --request POST 'http://CLOUDTOWER_IP/v2/api/exit-maintance-mode' \
--header 'Authorization: YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
    "data": {
        "poweron_vms": [
            "vm_uuid_1"
        ],
        "live_migrate_back_vms": [
            "vm_uuid_2"
        ],
        "offline_migrate_back_vms": [
            "vm_uuid_3"
        ],
    },
    "where": {
        "host_id": $HOST_ID
    }
}'
```
