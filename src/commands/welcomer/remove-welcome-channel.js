const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const welcomeChannelSchema = require('../../models/welcomeChannel');

/**
 * 
 * @param {import('commandkit').SlashCommandProps} param0 
 */
async function run({ interaction }) {
    try {
        const targetChannel = interaction.options.getChannel('target-channel');

        await interaction.deferReply({ ephemeral: true });

        const query = {
            guildId: interaction.guildId,
            channelId: targetChannel.id,
        };

        const channelExistInDb = await welcomeChannelSchema.exists(query);

        if (!channelExistInDb) {
            interaction.followUp('This channel not in use');
            return;
        }

        welcomeChannelSchema.findOneAndDelete(query)
            .then(() => {
                interaction.followUp(`Removed ${targetChannel} from recieving message`);
            })
            .catch((error) => {
                interaction.followUp('Database Error');
                console.log(`Error in ${__filename}: \n`, error);
            })
    } catch (error) {
        console.log(`ERROR in ${__filename}:\n`, error)
    }
}

const data = new SlashCommandBuilder()
    .setName('remove-welcome-channel')
    .setDescription('Remove a welcome channel.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
        option
            .setName('target-channel')
            .setDescription('Channel to remove')
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(true)
    );

module.exports = { data, run };