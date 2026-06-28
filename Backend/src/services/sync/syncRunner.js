const { syncJooble }      = require('./sources/jooble');
const { syncAdzuna }      = require('./sources/adzuna');
const { syncRemoteOK }    = require('./sources/remoteok');
const { syncHimalayas }   = require('./sources/himalayas');
const { syncCompanyJobs } = require('./sources/companyjobs');
const { seedCourses }     = require('./sources/courseSeeder');
const db                  = require('../../config/db');

// Sync every 48 hours (was 168 = weekly — too slow for a demo)
const MIN_HOURS_BETWEEN_SYNC = 48;

const shouldSync = async (source) => {
  try {
    const result = await db.query(
      'SELECT last_synced FROM sync_log WHERE source = $1',
      [source]
    );
    const row = result.rows[0];
    if (!row || !row.last_synced) return true;
    const hoursSinceLast =
      (Date.now() - new Date(row.last_synced).getTime()) / (1000 * 60 * 60);
    return hoursSinceLast >= MIN_HOURS_BETWEEN_SYNC;
  } catch {
    return true; // if sync_log table doesn't exist yet, allow sync
  }
};

const markSynced = async (source, totalJobs) => {
  try {
    await db.query(
      `INSERT INTO sync_log (source, last_synced, total_jobs)
       VALUES ($1, NOW(), $2)
       ON CONFLICT (source) DO UPDATE SET
         last_synced = NOW(),
         total_jobs  = $2`,
      [source, totalJobs]
    );
  } catch (err) {
    console.error('[syncRunner] markSynced failed for ' + source + ':', err.message);
  }
};

const getSyncStatus = async () => {
  try {
    const result = await db.query('SELECT * FROM sync_log ORDER BY source');
    return result.rows;
  } catch {
    return [];
  }
};

const runAllSyncs = async (force = false) => {
  console.log('[syncRunner] ===== Sync check =====' + (force ? ' (FORCED)' : ''));

  const sources = [
    // Free APIs — no quota issues, run these first
    { name: 'remoteok',    fn: syncRemoteOK,    usesQuota: false },
    { name: 'himalayas',   fn: syncHimalayas,   usesQuota: false },
    // Paid/quota APIs — run after free ones
    { name: 'jooble',      fn: syncJooble,      usesQuota: true  },
    { name: 'companyjobs', fn: syncCompanyJobs, usesQuota: true  },
    { name: 'adzuna',      fn: syncAdzuna,      usesQuota: true  },
  ];

  for (const source of sources) {
    const needsSync = force || (await shouldSync(source.name));

    if (!needsSync) {
      console.log('[syncRunner] ' + source.name + ' — skipping (synced < 48h ago)');
      continue;
    }

    try {
      console.log(
        '[syncRunner] Syncing: ' + source.name +
        (source.usesQuota ? ' [uses API quota]' : ' [free]')
      );
      await source.fn();
      await markSynced(source.name, 0);
    } catch (err) {
      console.error('[syncRunner] ' + source.name + ' failed:', err.message);
    }
  }

  // Always re-seed courses (they're hardcoded, no API limit)
  try {
    await seedCourses();
    await markSynced('courses', 8);
  } catch (err) {
    console.error('[syncRunner] courses seed failed:', err.message);
  }

  console.log('[syncRunner] ===== Complete =====');
};

const runCoursesSeed = async () => {
  await seedCourses();
};

module.exports = { runAllSyncs, runCoursesSeed, getSyncStatus };