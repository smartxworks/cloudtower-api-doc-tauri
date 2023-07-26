
### how to update web

url: https://cloudtower-api-preview.vercel.app/

every push commit will trigget vercel develop a new url env;
every pr will trigger vercel develop a new dev url env;


### how to update app

when add a new tag `v*` will trigger github action to release new assets, includes source code and desktop app


### for developer

#### how to setup repo

run  `yarn install --pure-lockfile && yarn start`

#### how to update api swagger

1. add new version in versions.json
2. run `yarn api:sync` 

#### how to quick create new api docs

run `yarn api:new`

#### how to check document missing locales

run `yarn api:scan`

#### how to add new documents / markdown file

please see: https://docs.google.com/document/d/1h9Wjd2yPfoAyZ-1dCa8IH5ltDK6kYglEzW-w4hu72pA/edit
