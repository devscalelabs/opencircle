module.exports = {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/changelog", {
      "changelogFile": "CHANGELOG.md"
    }],
    ["@semantic-release/npm", {
      "npmPublish": false,
      "tarballDir": "dist"
    }],
    ["@semantic-release/git", {
      "assets": ["CHANGELOG.md", "package.json", "packages/*/package.json", "apps/*/package.json",
"apps/api/pyproject.toml"],
      "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }]
  ]
};
