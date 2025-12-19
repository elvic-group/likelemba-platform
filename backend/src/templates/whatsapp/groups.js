/**
 * Groups Templates
 */
module.exports = {
  listGroups: (groups) => {
    if (groups.length === 0) {
      return `📋 My Groups

You're not part of any groups yet.

Reply CREATE to create a new group, or ask for help.`.trim();
    }

    let message = `📋 My Groups\n\n`;
    groups.forEach((group, index) => {
      message += `${index + 1}. ${group.name}\n`;
      message += `   💰 ${group.contribution_amount} ${group.currency} (${group.frequency})\n`;
      message += `   👥 ${group.members_count} members\n`;
      message += `   Status: ${group.status}\n\n`;
    });

    message += `Reply with group number to view details, or CREATE to start a new group.`;

    return message.trim();
  },

  groupCreated: (group) => {
    return `🎉 Group created!

${group.name}
• Contribution: ${group.contribution_amount} ${group.currency} (${group.frequency})
• Starts: ${group.start_date}
• Members: ${group.members_count}

Invite members using this link:
${group.invite_link}

Reply RULES to view full rules or START when everyone has joined.`.trim();
  },

  joinGroup: (group) => {
    return `🤝 You've been invited to ${group.name}.

Contribution: ${group.contribution_amount} ${group.currency} (${group.frequency})

Reply AGREE to join, or RULES to see details.`.trim();
  },

  groupDetails: (group, members) => {
    let message = `📊 ${group.name}\n\n`;
    message += `💰 Contribution: ${group.contribution_amount} ${group.currency}\n`;
    message += `📅 Frequency: ${group.frequency}\n`;
    message += `👥 Members: ${members.length}/${group.members_count}\n\n`;
    message += `Members:\n`;
    members.forEach((member, index) => {
      message += `${index + 1}. ${member.display_name || member.phone_e164}\n`;
    });

    return message.trim();
  },
};

