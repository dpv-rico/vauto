// release-plugins/analyze-feats.js
const semver = require('semver');

module.exports = {
  // semantic-release calls analyzeCommits(pluginConfig, context)
  analyzeCommits: async (pluginConfig, context) => {
    const { commits = [], lastRelease = {}, logger } = context;
    const lastVersion = lastRelease.version || '0.0.0';
    const parsed = semver.parse(lastVersion);

    if (!parsed) {
      logger.error(`Invalid lastRelease.version: ${lastVersion}`);
      return null;
    }

    // Count commits that are conventional "feat" type.
    const featCount = commits.reduce((count, commit) => {
      // commit.type may exist if other plugins parsed it; fallback to message regex
      const type = commit.type || (commit.message && commit.message.split(':')[0]);
      const isFeat = type === 'feat' || /^feat(\(|:)/.test(commit.message || '');
      return count + (isFeat ? 1 : 0);
    }, 0);

    if (featCount === 0) {
      // No release if there are no breaking/feat/fix commits per your policy
      return null;
    }

    const newMinor = parsed.minor + featCount;
    const newVersion = `${parsed.major}.${newMinor}.0`;

    logger.log(`Last version: ${lastVersion}; featCount: ${featCount}; newVersion: ${newVersion}`);

    // Return an explicit release object so semantic-release uses this version
    return { release: { version: newVersion } };
  }
};
