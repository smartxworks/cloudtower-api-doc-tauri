```ssh
curl --location --request POST 'http://CLOUDTOWER_IP/v2/api/get-vms' \ --header 'Authorization: YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
"where": {
"name": "YOUR_VM_NAME"
} }'
```