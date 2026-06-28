const pool = require('../config/db');
const transporter = require('../config/email');
const { getJobsWithActiveReminders, getNewJobsForUser } = require('../db/queries/job.queries');
const { deadlineReminderTemplate, newJobAlertTemplate } = require('../utils/emailTemplates');

async function sendDeadlineReminders() {
  console.log('[reminders] Checking reminders...');
  const { rows } = await getJobsWithActiveReminders();
  console.log('[reminders] Found ' + rows.length + ' reminders to send');

  for (const row of rows) {
    try {
      const subject = row.deadline
        ? 'Reminder: ' + row.title + ' at ' + row.company + ' — apply before deadline!'
        : 'Reminder: You saved ' + row.title + ' at ' + row.company + ' — have you applied?';

      await transporter.sendMail({
        from:    process.env.EMAIL_FROM,
        to:      row.user_email,
        subject: subject,
        html:    deadlineReminderTemplate({
          userEmail:    row.user_email,
          jobTitle:     row.title,
          company:      row.company,
          deadline:     row.deadline
            ? new Date(row.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
            : 'No deadline listed — apply soon!',
          daysLeft:     row.remind_days_before,
          applyUrl:     row.apply_url,
          domain:       row.domain,
          jobType:      row.job_type,
          reminderDate: new Date(row.reminder_date).toLocaleDateString('en-IN'),
        }),
      });

      await pool.query(
        `UPDATE applications SET deadline_reminder_sent = TRUE WHERE id = $1`,
        [row.application_id]
      );

      console.log('[reminders] Sent to ' + row.user_email + ' for "' + row.title + '"');
    } catch (err) {
      console.error('[reminders] Failed for app ' + row.application_id + ':', err.message);
    }
  }
}

async function sendNewJobAlerts() {
  console.log('[reminders] Checking new job alerts...');
  const { rows: users } = await pool.query(
    `SELECT id, email FROM users WHERE role = 'student' OR role IS NULL`
  );

  for (const user of users) {
    try {
      const { rows: newJobs } = await getNewJobsForUser(user.id, 24);
      if (!newJobs.length) continue;

      await transporter.sendMail({
        from:    process.env.EMAIL_FROM,
        to:      user.email,
        subject: newJobs.length + ' new opportunit' + (newJobs.length > 1 ? 'ies' : 'y') + ' matching your profile',
        html:    newJobAlertTemplate({ userEmail: user.email, jobs: newJobs }),
      });

      console.log('[reminders] Job alert sent to ' + user.email + ' (' + newJobs.length + ' jobs)');
    } catch (err) {
      console.error('[reminders] Alert failed for user ' + user.id + ':', err.message);
    }
  }
}

async function runAllReminders() {
  console.log('[reminders] ===== Running =====');
  await sendDeadlineReminders();
  await sendNewJobAlerts();
  console.log('[reminders] ===== Done =====');
}

module.exports = { sendDeadlineReminders, sendNewJobAlerts, runAllReminders };