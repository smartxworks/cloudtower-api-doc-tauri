const compareVersions = new Intl.Collator("en", { numeric: true }).compare;

function resolveExamples(shared, overridesByVersion, version) {
  const applicableVersions = Object.keys(overridesByVersion)
    .filter(since => compareVersions(since, version) <= 0)
    .sort(compareVersions);
  return Object.assign({}, shared, ...applicableVersions.map(since => overridesByVersion[since]));
}

module.exports = { resolveExamples };
