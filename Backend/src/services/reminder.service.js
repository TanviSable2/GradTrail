const pool = require('../config/db');
const transporter = require('../config/email');
const { getJobsWithActiveReminders, getNewJobsForUser } = require('../db/queries/job.queries');
const { deadlineReminderTemplate, interviewReminderTemplate, newJobAlertTemplate } = require('../utils/emailTemplates');

async function sendDeadlineReminders() {
  console.log('[reminders] Checking deadline reminders...');
  const { rows } = await getJobsWithActiveReminders();
  console.log(`[reminders] Found ${rows.length} deadline reminders to send`);

  for (const row of rows) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: row.user_email,
        subject: `${row.days_until_deadline} day(s) left to apply: ${row.title} at ${row.company}`,
        html: deadlineReminderTemplate({
          userEmail: row.user_email,   // no name — use email
          jobTitle: row.title,
          company: row.company,
          deadline: new Date(row.deadline).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
          }),
          daysLeft: row.days_until_deadline,
          applyUrl: row.apply_url,
          domain: row.domain,
          jobType: row.job_type,
        })
      });

      await pool.query(
        `UPDATE applications SET deadline_reminder_sent = TRUE WHERE id = $1`,
        [row.application_id]
      );

      console.log(`[reminders] Sent to ${row.user_email} for "${row.title}"`);
    } catch (err) {
      console.error(`[reminders] Failed app ${row.application_id}:`, err.message);
    }
  }
}

async function sendNewJobAlerts() {
  console.log('[reminders] Checking new job alerts...');

  // no name column — only select id and email
  const { rows: users } = await pool.query(
    `SELECT id, email FROM users WHERE role = 'student' OR role IS NULL`
  );

  for (const user of users) {
    try {
      const { rows: newJobs } = await getNewJobsForUser(user.id, 24);
      if (!newJobs.length) continue;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: `${newJobs.length} new opportunit${newJobs.length > 1 ? 'ies' : 'y'} matching your profile`,
        html: newJobAlertTemplate({ userEmail: user.email, jobs: newJobs })
      });

      console.log(`[reminders] New job alert sent to ${user.email} (${newJobs.length} jobs)`);
    } catch (err) {
      console.error(`[reminders] Alert failed for user ${user.id}:`, err.message);
    }
  }
}

async function sendInterviewReminders() {
  console.log('[reminders] Checking interview reminders...');

  const { rows } = await pool.query(
    `SELECT
       a.id AS application_id,
       u.email AS user_email,
       j.title,
       j.company,
       a.interview_date
     FROM applications a
     JOIN users u ON u.id = a.user_id
     JOIN jobs j ON j.id = a.job_id
     WHERE
       a.remind_me = TRUE
       AND a.interview_reminder_sent = FALSE
       AND a.interview_date IS NOT NULL
       AND a.interview_date > NOW()
       AND a.interview_date <= NOW() + INTERVAL '1 day'`
  );

  console.log(`[reminders] Found ${rows.length} interview reminders to send`);

  for (const row of rows) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: row.user_email,
        subject: `Interview Tomorrow: ${row.title} at ${row.company}`,
        html: interviewReminderTemplate({
          userEmail: row.user_email,
          jobTitle: row.title,
          company: row.company,
          interviewDate: new Date(row.interview_date).toLocaleString('en-IN')
        })
      });

      await pool.query(
        `UPDATE applications SET interview_reminder_sent = TRUE WHERE id = $1`,
        [row.application_id]
      );

      console.log(`[reminders] Interview reminder sent to ${row.user_email}`);
    } catch (err) {
      console.error(`[reminders] Failed:`, err.message);
    }
  }
}

async function runAllReminders() {
  console.log('[reminders] ===== Running all reminders =====');
  await sendDeadlineReminders();
  await sendInterviewReminders();
  console.log('[reminders] ===== Done =====');
}

module.exports = { sendDeadlineReminders, sendInterviewReminders, sendNewJobAlerts, runAllReminders };