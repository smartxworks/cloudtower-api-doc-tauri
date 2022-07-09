```ssh
curl -X 'POST' \
 'http://CLOUDTOWER_IP/v2/api/login' \
 -H 'accept: application/json' \
 -H 'content-language: en-US' \
 -H 'Content-Type: application/json' \
 -d '{
 "username": "string",
 "source": "LOCAL",
 "password": "string"
}'
```