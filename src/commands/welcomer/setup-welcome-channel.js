const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const welcomeChannelSchema = require('../../models/welcomeChannel');

/**
 * 
 * @param {import('commandkit').SlashCommandProps} param0 
 */
async function run({ interaction }) {
    try {
        const targetChannel = interaction.options.getChannel('target-channel');
        const customMessage = interaction.options.getString('custom-message');

        await interaction.deferReply({ ephemeral: true })

        const query = {
            guildId: interaction.guildId,
            channelId: targetChannel.id,
        };

        const channelExistInDb = await welcomeChannelSchema.exists(query);

        if (channelExistInDb) {
            interaction.followUp('This channel already in use');
            return;
        }

        const newWelcomeChannel = new welcomeChannelSchema({
            ...query,
            customMessage,
        });

        newWelcomeChannel  
            .save()
            .then(() => {
                interaction.followUp(`Configured ${targetChannel} to recieve welcome message`)
            })
            .catch((error) => {
                interaction.followUp('Database Error');
                console.log(`Error in ${__filename}: \n`, error)
            })
    } catch (error) {
        console.log(`ERROR in ${__filename}:\n`, error)
    }
}

const data = new SlashCommandBuilder()
    .setName('setup-welcome-channel')
    .setDescription('Setup channel to show message')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) => 
        option
            .setName('target-channel')
            .setDescription('choose channel to show message.')
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(true)
    )
    .addStringOption((option) => 
        option  
            .setName('custom-message')
            .setDescription('TEMPLATES: {mention-member} {username} {server-name}')
    )

module.exports = { data, run }