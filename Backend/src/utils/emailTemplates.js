function deadlineReminderTemplate({ userEmail, jobTitle, company, deadline, daysLeft, applyUrl, domain, jobType }) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9f9f9;border-radius:8px">
      <h2 style="color:#e65c00">Application Deadline Reminder</h2>
      <p>Hi <strong>${userEmail}</strong>,</p>
      <p>The deadline for a ${jobType} you are tracking is approaching:</p>
      <div style="background:#fff;padding:16px;border-radius:6px;border-left:4px solid #e65c00">
        <h3 style="margin:0">${jobTitle}</h3>
        <p style="margin:4px 0;color:#555">${company} - ${domain}</p>
        <p style="margin:4px 0">
          <strong>Deadline:</strong> ${deadline}
          <span style="color:#e65c00;font-weight:bold">(${daysLeft} day${daysLeft !== 1 ? 's' : ''} left)</span>
        </p>
      </div>
      <br/>
      <a href="${applyUrl}" style="background:#e65c00;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
        Apply Now
      </a>
      <p style="color:#999;font-size:12px;margin-top:24px">
        You are receiving this because you enabled reminders for this job on NextStep.
      </p>
    </div>
  `;
}

function interviewReminderTemplate({ userEmail, jobTitle, company, interviewDate }) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9f9f9;border-radius:8px">
      <h2 style="color:#1a73e8">Interview Reminder - Tomorrow</h2>
      <p>Hi <strong>${userEmail}</strong>,</p>
      <p>You have an interview scheduled:</p>
      <div style="background:#fff;padding:16px;border-radius:6px;border-left:4px solid #1a73e8">
        <h3 style="margin:0">${jobTitle}</h3>
        <p style="margin:4px 0;color:#555">${company}</p>
        <p style="margin:4px 0"><strong>When:</strong> ${interviewDate}</p>
      </div>
      <p style="color:#999;font-size:12px;margin-top:24px">Sent by NextStep. Good luck.</p>
    </div>
  `;
}

function newJobAlertTemplate({ userEmail, jobs }) {
  const jobCards = jobs.map(j => `
    <div style="background:#fff;padding:14px;border-radius:6px;margin-bottom:12px;border-left:4px solid #1a73e8">
      <strong>${j.title}</strong> - ${j.company}<br/>
      <span style="color:#555;font-size:13px">${j.domain} - ${j.job_type} - ${j.location || 'Remote'}</span><br/>
      ${j.deadline
        ? `<span style="color:#e65c00;font-size:13px">Deadline: ${new Date(j.deadline).toLocaleDateString('en-IN')}</span><br/>`
        : ''}
      <a href="${j.apply_url}" style="color:#1a73e8;font-size:13px">View and Apply</a>
    </div>
  `).join('');

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9f9f9;border-radius:8px">
      <h2 style="color:#1a73e8">New Opportunities For You</h2>
      <p>Hi <strong>${userEmail}</strong>, here are new listings matching your profile:</p>
      ${jobCards}
      <p style="color:#999;font-size:12px;margin-top:24px">
        You receive these because your profile is active on NextStep.
      </p>
    </div>
  `;
}

module.exports = { deadlineReminderTemplate, interviewReminderTemplate, newJobAlertTemplate };