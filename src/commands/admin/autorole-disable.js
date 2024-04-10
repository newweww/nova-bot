const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const AutoRole = require('../../models/AutoRole');

/** @param {import('commandkit').SlashCommandProps} param0 */
async function run({interaction}) {
    try {
        await interaction.deferReply();

        if (!(await AutoRole.exists({ guildId: interaction.guild.id }))) {
            await interaction.editReply('Autorole not setup');
            return;
        }

        await AutoRole.findOneAndDelete({ guildId: interaction.guild.id });
        await interaction.editReply("Autorole disabled");
    } catch (error) {
        console.log(error);
    }
}

const data = new SlashCommandBuilder()
    .setName('autorole-disable')
    .setDescription('Disable auto-role in this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)

module.exports = { data, run };
