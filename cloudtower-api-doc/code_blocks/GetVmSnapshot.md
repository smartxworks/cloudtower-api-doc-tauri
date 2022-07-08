```ssh
curl --location --request POST 'http://CLOUDTOWER_IP/v2/api/get-vm-snapshots' \
--header 'Authorization: YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{ "where": {
"id": "STEP_2_SNAPSHOT_ID" }
}'
```