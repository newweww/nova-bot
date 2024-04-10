const AutoRole = require('../../models/AutoRole');

module.exports = async (client, member) => {
    try {
        console.log('Received new member:', member.user.tag);

        if (!member.guild) {
            console.log('Guild not found for the member.');
            return;
        }

        const guild = member.guild;

        await guild.members.fetch(client.user);

        const botMember = guild.members.cache.get(client.user.id);
        if (!botMember) {
            console.log('Bot member data is not available.');
            return;
        }

        if (!botMember.permissions.has('MANAGE_ROLES')) {
            console.log('Bot does not have the "Manage Roles" permission.');
            return;
        }

        const autoRole = await AutoRole.findOne({ guildId: guild.id });
        if (!autoRole) {
            console.log('AutoRole configuration not found for this guild.');
            return;
        }

        const role = guild.roles.cache.get(autoRole.roleId);
        if (!role) {
            console.log('AutoRole role not found.');
            return;
        }

        if (role.comparePositionTo(botMember.roles.highest) > 0) {
            console.log('Bot\'s highest role is lower in hierarchy than the target role.');
            return;
        }
        
        await member.roles.add(role);
        console.log(`Assigned role ${role.name} to ${member.user.tag}`);
    } catch (error) {
        console.error('Error in auto-role assignment:', error);
    }
};
