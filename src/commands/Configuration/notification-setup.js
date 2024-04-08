const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const NotificationConfig = require('../../models/NotificationConfig');
const Parser = require('rss-parser');

const parser = new Parser();

/** @param {import('commandkit').SlashCommandProps} param0 */
async function run({ interaction }) {
    try {
        await interaction.deferReply({ ephemeral: true });

        const targetYtChannelId = interaction.options.getString('youtube-id');
        const targetNotificationChannel = interaction.options.getChannel('target-channel');
        const targetCustomMessage = interaction.options.getString('custom-message');

        const duplicateExists = await NotificationConfig.exists({
            notificationChannelId: targetNotificationChannel.id,
            ytChannelId: targetYtChannelId,
        });

        if (duplicateExists) {
            interaction.followUp(
                'That Youtube Channel has already been configured for that text channel. Run `/notification-remove` first.'
            );
            return;
        }

        const YOUTUBE_RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${targetYtChannelId}`;

        const feed = await parser.parseURL(YOUTUBE_RSS_URL).catch((e) => {
            interaction.followUp('Error fetching, check the id');
        });

        if (!feed) return;

        const channelName = feed.title;

        const notificationConfig = new NotificationConfig({
            guildId: interaction.guildId,
            notificationChannelId: targetNotificationChannel.id,
            ytChannelId: targetYtChannelId,
            customMessage: targetCustomMessage,
            lastChecked: new Date(),
            lastCheckedVid: null,
        });

        if (feed.items.length) {
            const latestVideo = feed.items[0];

            notificationConfig.lastCheckedVid = {
                id: latestVideo.id.split(':')[2],
                pubDate: latestVideo.pubDate,
            };
        }

        notificationConfig
            .save()
            .then(() => {
                const embed = new EmbedBuilder()
                    .setTitle('YTCH Config Success!')
                    .setDescription(
                        `${targetNotificationChannel} will now get update by ${channelName}`
                    )
                    .setTimestamp();

                interaction.followUp({ embeds: [embed] });
            })
            .catch((error) => {
                console.error('Error saving notification configuration:', error);
                interaction.followUp('An error occurred while saving the notification configuration. Please try again.');
            });
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
}

const data = new SlashCommandBuilder()
    .setName('notification-setup')
    .setDescription('Setup Youtube notification for a channel.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
        option
            .setName('youtube-id')
            .setDescription('The ID of the Youtube channel.')
            .setRequired(true)
    )
    .addChannelOption((option) =>
        option
            .setName('target-channel')
            .setDescription('The Channel to get notification in')
            .addChannelTypes(
                ChannelType.GuildText,
                ChannelType.GuildAnnouncement
            )
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('custom-message')
            .setDescription(
                'Templates: {VIDEO_TITLE} {VIDEO_URL} {CHANNEL_NAME} {CHANNEL_URL}'
            )
    );

module.exports = { data, run };
