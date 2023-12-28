```ssh
curl -X 'POST' \
 'http://CLOUDTOWER_API/api' \
 -H 'accept: application/json' \
 -H 'content-language: en-US' \
 -H 'Authorization: YOUR_TOKEN' \
 -H 'Content-Type: application/json' \
 -d '{
  "operationName": "vnc",
  "variables": { "input": { "vm": { "id": $VM_ID } } },
  "query": "query vnc($input: VncInput!) { vnc(input: $input) { vm_uuid host_ip cluster_ip raw_token token}}"
}'
```