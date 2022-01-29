
### how to update web

url: https://cloudtower-api-preview.vercel.app/

every push commit will trigget vercel develop a new url env;
every pr will trigger vercel develop a new dev url env;


### how to update app

when add a new tag `v*` will trigger github action to release new assets, includes source code and desktop app


### for developer

#### how to scan 

run `GITLAB_TOKEN=xxx yarn scan` 