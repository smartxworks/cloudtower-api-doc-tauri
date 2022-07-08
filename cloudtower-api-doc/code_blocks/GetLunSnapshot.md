```ssh
curl --location --request POST 'http://CLOUDTOWER_IP/v2/api/get-iscsi-lun-snapshots' \
--header 'Authorization: YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{ "where": {
"name_in": ["STEP_4_SNAPSHOT_LOCAL_ID_1", "STEP_4_SNAPSHOT_LOCAL_ID_2"] }
}'
```