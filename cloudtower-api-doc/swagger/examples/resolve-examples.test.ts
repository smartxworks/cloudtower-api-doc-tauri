import { expect, it } from "vitest";
import { resolveExamples } from "./resolve-examples";

it("applies the latest override for each API path without changing earlier versions", () => {
  const shared = { "/create-vm": { curl: "shared" }, "/login": { curl: "login" } };
  const v410 = { curl: "4.10", exampleValue: { datastore_id: "id" } };
  const v411 = { curl: "4.11" };
  const overrides = {
    "4.11.0": { "/create-vm": v411 },
    "4.10.0": { "/create-vm": v410, "/new-api": { curl: "new" } },
  };

  expect(resolveExamples(shared, overrides, "4.9.0")).toEqual(shared);
  expect(resolveExamples(shared, overrides, "4.10.0")["/create-vm"]).toEqual(v410);
  expect(resolveExamples(shared, overrides, "4.10.2")["/create-vm"]).toEqual(v410);
  expect(resolveExamples(shared, overrides, "5.0.0")).toEqual({
    ...shared,
    "/create-vm": v411,
    "/new-api": { curl: "new" },
  });
});
