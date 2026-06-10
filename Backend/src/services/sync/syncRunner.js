const { syncJooble }      = require('./sources/jooble');
const { syncAdzuna }      = require('./sources/adzuna');
const { syncRemoteOK }    = require('./sources/remoteok');
const { syncHimalayas }   = require('./sources/himalayas');
const { syncCompanyJobs } = require('./sources/companyjobs');
const { seedCourses }     = require('./sources/courseSeeder');
const db                  = require('../../config/db');

const MIN_HOURS_BETWEEN_SYNC = 168;

const shouldSync = async (source) => {
  const result = await db.query(
    'SELECT last_synced FROM sync_log WHERE source = $1',
    [source]
  );
  const row = result.rows[0];
  if (!row || !row.last_synced) return true;
  const hoursSinceLast =
    (Date.now() - new Date(row.last_synced).getTime()) / (1000 * 60 * 60);
  return hoursSinceLast >= MIN_HOURS_BETWEEN_SYNC;
};

const markSynced = async (source, totalJobs) => {
  await db.query(
    `INSERT INTO sync_log (source, last_synced, total_jobs)
     VALUES ($1, NOW(), $2)
     ON CONFLICT (source) DO UPDATE SET
       last_synced = NOW(),
       total_jobs  = $2`,
    [source, totalJobs]
  );
};

const getSyncStatus = async () => {
  const result = await db.query('SELECT * FROM sync_log ORDER BY source');
  return result.rows;
};

const runAllSyncs = async (force = false) => {
  console.log('[syncRunner] ===== Sync check =====' + (force ? ' (FORCED)' : ''));

  const sources = [
    { name: 'jooble',       fn: syncJooble,      usesQuota: true  },
    { name: 'companyjobs',  fn: syncCompanyJobs, usesQuota: true  },
    { name: 'adzuna',       fn: syncAdzuna,      usesQuota: true  },
    { name: 'remoteok',     fn: syncRemoteOK,    usesQuota: false },
    { name: 'himalayas',    fn: syncHimalayas,   usesQuota: false },
  ];

  for (const source of sources) {
    const needsSync = force || (await shouldSync(source.name));

    if (!needsSync) {
      console.log('[syncRunner] ' + source.name + ' — skipping (synced recently)');
      continue;
    }

    try {
      console.log(
        '[syncRunner] Syncing: ' + source.name +
        (source.usesQuota ? ' [uses API quota]' : ' [unlimited]')
      );
      await source.fn();
      await markSynced(source.name, 0);
    } catch (err) {
      console.error('[syncRunner] ' + source.name + ' failed:', err.message);
    }
  }

  console.log('[syncRunner] ===== Complete =====');
};

const runCoursesSeed = async () => {
  await seedCourses();
};

module.exports = { runAllSyncs, runCoursesSeed, getSyncStatus };