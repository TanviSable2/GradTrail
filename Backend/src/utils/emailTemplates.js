function deadlineReminderTemplate({ userEmail, jobTitle, company, deadline, daysLeft, applyUrl, domain, jobType, reminderDate }) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9f9f9;border-radius:8px">
      <h2 style="color:#3b82f6">📋 Application Reminder — GradTrail</h2>
      <p>Hi <strong>${userEmail}</strong>,</p>
      <p>You set a reminder for a job you saved on GradTrail. Here's the details:</p>
      <div style="background:#fff;padding:16px;border-radius:6px;border-left:4px solid #3b82f6;margin:16px 0">
        <h3 style="margin:0 0 8px">${jobTitle}</h3>
        <p style="margin:4px 0;color:#555">${company}${domain ? ' — ' + domain : ''}</p>
        <p style="margin:4px 0;color:#555">Type: ${jobType || 'Job'}</p>
        <p style="margin:4px 0">
          <strong>Deadline:</strong>
          <span style="color:${deadline === 'No deadline listed — apply soon!' ? '#f59e0b' : '#e65c00'}">
            ${deadline}
          </span>
        </p>
        <p style="margin:4px 0;color:#888;font-size:12px">Reminder set for: ${reminderDate || 'Today'}</p>
      </div>
      <p style="color:#555">You saved this job ${daysLeft} day(s) ago and haven't applied yet. Don't miss out!</p>
      <a href="${applyUrl}"
         style="display:inline-block;background:#3b82f6;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:8px">
        Apply Now →
      </a>
      <p style="color:#999;font-size:12px;margin-top:24px">
        You received this because you enabled reminders on GradTrail. Visit your
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/reminders" style="color:#3b82f6">Reminders page</a>
        to manage your reminders.
      </p>
    </div>
  `;
}

module.exports = {
  deadlineReminderTemplate,
};