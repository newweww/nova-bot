const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const AutoRole = require('../../models/AutoRole');

/** @param {import('commandkit').SlashCommandProps} param0 */
async function run({ interaction }) {
    try {
        await interaction.deferReply({ ephemeral: true });

        const targetRoleId = interaction.options.getRole('role').id; // Getting role ID directly from option

        let autoRole = await AutoRole.findOne({ guildId: interaction.guild.id });

        if (autoRole) {
            if (autoRole.roleId === targetRoleId) {
                await interaction.editReply('Auto role has already been configured');
                return;
            }

            autoRole.roleId = targetRoleId;
        } else {
            autoRole = new AutoRole({
                guildId: interaction.guild.id,
                roleId: targetRoleId,
            });
        }

        await autoRole.save();
        await interaction.editReply("Autorole has now been configured.");
    } catch (error) {
        console.error(error);
        await interaction.editReply('An error occurred while configuring autorole.');
    }
}

const data = new SlashCommandBuilder()
    .setName('autorole-configure')
    .setDescription('Configure your auto-role for this server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption(option =>
        option
            .setName('role')
            .setDescription('Role you want')
            .setRequired(true)
    )
    .setDMPermission(false);



module.exports = { data, run };
