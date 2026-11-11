
### how to update web

every push commit will trigget vercel develop a new url env;
every pr will trigger vercel develop a new dev url env;


### how to update app

when add a new tag `v*` will trigger github action to release new assets, includes source code and desktop app


### for developer

please read [Contribute](https://github.com/smartxworks/cloudtower-api-doc-tauri/blob/master/contribute.md)

### Generate API request examples

After adding the Swagger spec for a release, generate examples for that version and later releases:

```sh
yarn api:new-example -v 4.11.0 --versioned
```

The generator saves only examples that differ from the inherited examples under `4.11.0` in `cloudtower-api-doc/swagger/examples/swagger-examples-by-version.json`. Each endpoint uses its latest override at or below the selected version, falling back to the shared example. Earlier releases keep their existing examples.

Use `yarn api:new-example -v <version>` without `--versioned` to regenerate the shared `swagger-examples.json`. Rerunning with `--versioned` replaces the overrides for that version, so review the diff and reapply any manual edits you want to keep.
