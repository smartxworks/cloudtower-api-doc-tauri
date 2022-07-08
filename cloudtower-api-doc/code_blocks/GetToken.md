```ssh
curl -X 'POST' \
 'http://192.168.31.209/v2/api/login' \
 -H 'accept: application/json' \
 -H 'content-language: en-US' \
 -H 'Content-Type: application/json' \
 -d '{
 "username": "string",
 "source": "LOCAL",
 "password": "string"
}'
```