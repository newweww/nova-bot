const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const NotificationConfig = require('../../models/NotificationConfig');


/** @param {import('commandkit').SlashCommandProps} param0 */
async function run({ interaction }) {
    try {
        await interaction.deferReply({ ephemeral: true })

        const targetYtChannelId = interaction.options.getString('youtube-id');
        const targetNotificationChannel = interaction.options.getChannel('target-channel');

        const targetChannel = await NotificationConfig.findOne({
            ytChannelId: targetYtChannelId,
            notificationChannelId: targetNotificationChannel.id,
        });

        if(!targetChannel) {
            interaction.followUp('Channel not found')
            return;
        }

        NotificationConfig.findOneAndDelete({ _id: targetChannel._id })
            .then(() => {
                interaction.followUp('Turn off notification');
            })
            .catch((e) => {
                interaction.followUp('PLease try again');
            })

    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
}

const data = new SlashCommandBuilder()
    .setName('notification-remove')
    .setDescription('Turn off Youtube Noti for a channel.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) => 
        option
            .setName('youtube-id')        
            .setDescription('ID of YT channel')
            .setRequired(true)
    )
    .addChannelOption((option) => 
        option  
            .setName('target-channel')
            .setDescription('The Channel to turn off.')
            .addChannelTypes(
                ChannelType.GuildText, 
                ChannelType.GuildAnnouncement
            )
            .setRequired(true)
    )

module.exports = { data, run }