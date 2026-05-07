// Migration-safe backfill: existing orgs/users created before the accountType
// field existed get patched at startup based on the existing org.type mapping.
// Idempotent — running multiple times is safe.
const Organization = require('../models/Organization');
const User = require('../models/User');
const { ORG_TYPE_TO_ACCOUNT } = require('../models/Organization');

async function backfillAccountTypes() {
  // Orgs missing accountType
  const staleOrgs = await Organization.find({ $or: [{ accountType: { $exists: false } }, { accountType: null }] });
  let orgPatched = 0;
  for (const org of staleOrgs) {
    org.accountType = ORG_TYPE_TO_ACCOUNT[org.type];
    await org.save();
    orgPatched++;
  }

  // Users missing accountType — derive from their org
  const staleUsers = await User.find({ $or: [{ accountType: { $exists: false } }, { accountType: null }] }).populate('organization');
  let userPatched = 0;
  for (const u of staleUsers) {
    const at = u.organization?.accountType || ORG_TYPE_TO_ACCOUNT[u.organization?.type];
    if (at) {
      u.accountType = at;
      await u.save();
      userPatched++;
    }
  }

  if (orgPatched || userPatched) {
    console.log(`[migrate] backfilled accountType on ${orgPatched} orgs, ${userPatched} users`);
  }
}

module.exports = { backfillAccountTypes };
