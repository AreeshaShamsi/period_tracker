/**
 * Lunari Authentication Migration Tool
 * 
 * Manages migration of legacy PostgreSQL users (with password hashes) to Firebase Authentication.
 * 
 * Usage:
 *   node backend/database/migrateExistingUsers.js [--inspect|--audit]
 *   node backend/database/migrateExistingUsers.js --link --email <user-email> --uid <firebase-uid>
 *   node backend/database/migrateExistingUsers.js --migrate
 */

const path = require('path');
const dotenv = require('dotenv');

// Load environment from backend/.env if present
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { pool, query } = require('../src/config/database');
const { getAuth, isFirebaseConfigured } = require('../src/config/firebase');

async function inspectLegacyUsers() {
  console.log('\n======================================================');
  console.log(' Lunari Legacy User Migration Audit');
  console.log('======================================================\n');

  const unmigratedRes = await query(`
    SELECT u.id, u.name, u.email, u.google_id, u.firebase_uid,
           (u.password_hash IS NOT NULL) AS has_password,
           u.auth_provider, u.created_at,
           COUNT(DISTINCT p.id) AS periods_count,
           COUNT(DISTINCT s.id) AS symptoms_count,
           up.onboarding_completed
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    LEFT JOIN periods p ON u.id = p.user_id
    LEFT JOIN symptom_logs s ON u.id = s.user_id
    WHERE u.firebase_uid IS NULL
    GROUP BY u.id, up.onboarding_completed
    ORDER BY u.id ASC
  `);

  const unmigratedUsers = unmigratedRes.rows;
  console.log(`Found ${unmigratedUsers.length} legacy user(s) with unmapped Firebase UID (firebase_uid IS NULL):\n`);

  if (unmigratedUsers.length === 0) {
    console.log('✓ All users in PostgreSQL are already mapped to Firebase UIDs.');
    return;
  }

  let authInstance = null;
  let canQueryFirebase = false;
  try {
    if (isFirebaseConfigured()) {
      authInstance = getAuth();
      // Test if service account credentials allow admin API lookups
      if (process.env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        canQueryFirebase = true;
      }
    }
  } catch (err) {
    // Admin lookups unavailable without service account key
  }

  for (const user of unmigratedUsers) {
    console.log(`------------------------------------------------------`);
    console.log(`User ID:           ${user.id}`);
    console.log(`Name:              ${user.name}`);
    console.log(`Email:             ${user.email}`);
    console.log(`Has Password Hash: ${user.has_password}`);
    console.log(`Current Provider:  ${user.auth_provider}`);
    console.log(`Periods Logged:    ${user.periods_count}`);
    console.log(`Symptoms Logged:   ${user.symptoms_count}`);
    console.log(`Onboarding Done:   ${user.onboarding_completed}`);

    if (canQueryFirebase && authInstance) {
      try {
        const fbUser = await authInstance.getUserByEmail(user.email);
        const providers = fbUser.providerData.map((p) => p.providerId).join(', ') || 'none';
        console.log(`Firebase Status:   EXISTS in Firebase Auth`);
        console.log(`Firebase UID:      ${fbUser.uid}`);
        console.log(`Email Verified:    ${fbUser.emailVerified}`);
        console.log(`Firebase Provider: ${providers}`);
      } catch (fbErr) {
        if (fbErr.code === 'auth/user-not-found') {
          console.log(`Firebase Status:   NOT FOUND in Firebase Auth (needs first sign-in)`);
        } else {
          console.log(`Firebase Status:   Error querying Firebase (${fbErr.message})`);
        }
      }
    } else {
      console.log(`Firebase Status:   Ready for runtime token mapping upon Google sign-in`);
    }
  }

  console.log(`\n======================================================`);
  console.log(' Migration Guidance:');
  console.log(' 1. When a legacy user signs in with Google, their verified');
  console.log('    Firebase UID will automatically and safely map at runtime.');
  console.log(' 2. To explicitly link a user now, run:');
  console.log('    node database/migrateExistingUsers.js --link --email <email> --uid <firebase_uid>');
  console.log('======================================================\n');
}

async function linkUserManually(email, firebaseUid) {
  if (!email || !firebaseUid) {
    console.error('Error: Both --email and --uid arguments are required.');
    process.exit(1);
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanUid = firebaseUid.trim();

  console.log(`\nLinking PostgreSQL user for "${cleanEmail}" to Firebase UID "${cleanUid}"...`);

  const userRes = await query(
    `SELECT u.id, u.name, u.email, u.google_id, u.firebase_uid,
            (u.password_hash IS NOT NULL) AS has_password,
            u.auth_provider
     FROM users u
     WHERE LOWER(u.email) = LOWER($1)`,
    [cleanEmail]
  );

  if (userRes.rows.length === 0) {
    console.error(`Error: No PostgreSQL user found with email "${cleanEmail}".`);
    process.exit(1);
  }

  const user = userRes.rows[0];

  if (user.firebase_uid && user.firebase_uid !== cleanUid) {
    console.error(
      `Error: User ID ${user.id} is already linked to a different Firebase UID (${user.firebase_uid}). Aborting to prevent account takeover.`
    );
    process.exit(1);
  }

  // Check if target UID is already assigned to another user
  const uidConflict = await query(
    'SELECT id, email FROM users WHERE firebase_uid = $1 AND id != $2',
    [cleanUid, user.id]
  );

  if (uidConflict.rows.length > 0) {
    console.error(
      `Error: Firebase UID "${cleanUid}" is already assigned to User ID ${uidConflict.rows[0].id} (${uidConflict.rows[0].email}).`
    );
    process.exit(1);
  }

  // Update user safely
  const updatedRes = await query(
    `UPDATE users
     SET firebase_uid = $1,
         google_id = COALESCE(google_id, $1),
         auth_provider = CASE WHEN password_hash IS NOT NULL THEN 'both' ELSE 'google' END,
         updated_at = NOW()
     WHERE id = $2
     RETURNING id, name, email, google_id, firebase_uid, auth_provider, (password_hash IS NOT NULL) AS has_password`,
    [cleanUid, user.id]
  );

  const updated = updatedRes.rows[0];
  console.log('\n✓ Successfully linked user:');
  console.log(`  User ID:           ${updated.id}`);
  console.log(`  Email:             ${updated.email}`);
  console.log(`  Firebase UID:      ${updated.firebase_uid}`);
  console.log(`  Google ID:         ${updated.google_id}`);
  console.log(`  Auth Provider:     ${updated.auth_provider}`);
  console.log(`  Password Hash:     Preserved (has_password: ${updated.has_password})`);
  console.log('\nExisting profile, period, and symptom data remain completely intact.\n');
}

async function migrateAllVerifiedUsers() {
  console.log('\nStarting batch migration of verified Firebase users...');
  let authInstance;
  try {
    authInstance = getAuth();
  } catch (err) {
    console.error('Error: Firebase Admin SDK credentials required for batch migration:', err.message);
    process.exit(1);
  }

  const unmigratedRes = await query(
    'SELECT id, name, email, password_hash FROM users WHERE firebase_uid IS NULL ORDER BY id ASC'
  );

  const users = unmigratedRes.rows;
  console.log(`Found ${users.length} unmigrated user(s) to process.\n`);

  let linkedCount = 0;
  let skippedCount = 0;

  for (const user of users) {
    try {
      const fbUser = await authInstance.getUserByEmail(user.email);
      if (!fbUser.emailVerified && fbUser.providerData.every((p) => p.providerId === 'password')) {
        console.log(`- User ID ${user.id} (${user.email}): Skipped (Firebase email unverified)`);
        skippedCount++;
        continue;
      }

      await query(
        `UPDATE users
         SET firebase_uid = $1,
             google_id = COALESCE(google_id, $1),
             auth_provider = CASE WHEN password_hash IS NOT NULL THEN 'both' ELSE 'google' END,
             updated_at = NOW()
         WHERE id = $2`,
        [fbUser.uid, user.id]
      );

      console.log(`✓ User ID ${user.id} (${user.email}) -> Linked to Firebase UID ${fbUser.uid}`);
      linkedCount++;
    } catch (fbErr) {
      if (fbErr.code === 'auth/user-not-found') {
        console.log(`- User ID ${user.id} (${user.email}): Skipped (No Firebase user found)`);
      } else {
        console.log(`! User ID ${user.id} (${user.email}): Error (${fbErr.message})`);
      }
      skippedCount++;
    }
  }

  console.log(`\nBatch migration completed: ${linkedCount} linked, ${skippedCount} skipped.\n`);
}

async function main() {
  const args = process.argv.slice(2);

  try {
    if (args.includes('--link')) {
      const emailIdx = args.indexOf('--email');
      const uidIdx = args.indexOf('--uid');
      const email = emailIdx !== -1 ? args[emailIdx + 1] : null;
      const uid = uidIdx !== -1 ? args[uidIdx + 1] : null;
      await linkUserManually(email, uid);
    } else if (args.includes('--migrate')) {
      await migrateAllVerifiedUsers();
    } else {
      await inspectLegacyUsers();
    }
  } catch (err) {
    console.error('Migration script error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  inspectLegacyUsers,
  linkUserManually,
  migrateAllVerifiedUsers,
};
