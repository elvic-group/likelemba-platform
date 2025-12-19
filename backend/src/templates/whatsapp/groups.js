/**
 * Groups Templates - Enhanced
 */
module.exports = {
  listGroups: (groups) => {
    if (groups.length === 0) {
      return `📋 My Groups

━━━━━━━━━━━━━━━━━━━━
You're not part of any groups yet.
━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━
What would you like to do?
━━━━━━━━━━━━━━━━━━━━

1️⃣ Create New Group
2️⃣ Join with Invite Link
3️⃣ Get Help

━━━━━━━━━━━━━━━━━━━━
💡 Reply CREATE to start a new group
💡 Or ask me anything!`.trim();
    }

    let message = `📋 My Groups

━━━━━━━━━━━━━━━━━━━━
Your Savings Groups:
━━━━━━━━━━━━━━━━━━━━

`;
    groups.forEach((group, index) => {
      const statusEmoji = group.status === 'active' ? '✅' : group.status === 'pending' ? '⏳' : '⏸️';
      message += `${index + 1}️⃣ ${group.name}\n`;
      message += `   💰 ${group.contribution_amount} ${group.currency}\n`;
      message += `   📅 ${group.frequency}\n`;
      message += `   👥 ${group.members_count} members\n`;
      message += `   ${statusEmoji} ${group.status}\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━
💡 Reply with group number to view details
💡 Reply CREATE to start a new group`;

    return message.trim();
  },

  groupCreated: (group) => {
    return `🎉 Group Created Successfully!

━━━━━━━━━━━━━━━━━━━━
Group Details:
━━━━━━━━━━━━━━━━━━━━

📛 Name: ${group.name}
💰 Contribution: ${group.contribution_amount} ${group.currency}
📅 Frequency: ${group.frequency}
📆 Starts: ${group.start_date}
👥 Members: ${group.members_count}

━━━━━━━━━━━━━━━━━━━━
🔗 Invite Link:
━━━━━━━━━━━━━━━━━━━━

${group.invite_link}

━━━━━━━━━━━━━━━━━━━━
📤 Share this link with your members!

━━━━━━━━━━━━━━━━━━━━
What's next?

1️⃣ View Group Rules
2️⃣ Invite More Members
3️⃣ Start Group

━━━━━━━━━━━━━━━━━━━━
💡 Reply RULES to view full rules
💡 Reply START when everyone has joined`.trim();
  },

  joinGroup: (group) => {
    return `🤝 Group Invitation

━━━━━━━━━━━━━━━━━━━━
You've been invited to join:
━━━━━━━━━━━━━━━━━━━━

📛 ${group.name}

━━━━━━━━━━━━━━━━━━━━
Group Details:
━━━━━━━━━━━━━━━━━━━━

💰 Contribution: ${group.contribution_amount} ${group.currency}
📅 Frequency: ${group.frequency}
👥 Members: ${group.members_count}

━━━━━━━━━━━━━━━━━━━━
Would you like to join?

1️⃣ Yes, I Agree
2️⃣ View Rules First
3️⃣ Decline

━━━━━━━━━━━━━━━━━━━━
💡 Reply AGREE to join
💡 Reply RULES to see details`.trim();
  },

  groupDetails: (group, members) => {
    let message = `📊 Group Details

━━━━━━━━━━━━━━━━━━━━
${group.name}
━━━━━━━━━━━━━━━━━━━━

💰 Contribution: ${group.contribution_amount} ${group.currency}
📅 Frequency: ${group.frequency}
👥 Members: ${members.length}/${group.members_count}
📆 Status: ${group.status}

━━━━━━━━━━━━━━━━━━━━
👥 Group Members:
━━━━━━━━━━━━━━━━━━━━

`;
    members.forEach((member, index) => {
      message += `${index + 1}️⃣ ${member.display_name || member.phone_e164}\n`;
    });

    message += `\n━━━━━━━━━━━━━━━━━━━━
💡 Reply 0 to go back
💡 Reply MENU for main menu`;

    return message.trim();
  },
};
