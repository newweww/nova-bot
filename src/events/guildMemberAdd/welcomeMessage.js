const welcomeChannelSchema = require('../../models/welcomeChannel');
const { EmbedBuilder } = require('discord.js');


/**
 * 
 * @param {import('discord.js').GuildMember} guildMember 
 */
module.exports = async (guildMember) => {
    try {
        if (guildMember.user.bot) return;

        const welcomeConfigs = await welcomeChannelSchema.find({
            guildId: guildMember.guild.id,
        });

        if (!welcomeConfigs.length) return;

        for (const welcomeConfig of welcomeConfigs) {
            const targetChannel =
                guildMember.guild.channels.cache.get(welcomeConfig.channelId) ||
                (await guildMember.guild.channels.fetch(
                    welcomeConfig.channelId
                ));

            if (!targetChannel) {
                welcomeChannelSchema.findOneAndDelete({
                    guildId: guildMember.guild.id,
                    channelId: welcomeConfig.channelId,
                }).catch(() => { });
            }

            const customMessage = welcomeConfig.customMessage ||
                'Hi {username}, Welcome to {server-name}!';

            const welcomeMessage = customMessage
                .replace('{mention-member}', `<@${guildMember.id}>`)
                .replace('{username}', guildMember.user.username)
                .replace('{server-name}', guildMember.guild.name)
                .replace('{member-count}', String(guildMember.guild.approximateMemberCount));

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setImage(guildMember.user.displayAvatarURL({ size: 500 }))
                .setTitle('ยินดีต้อนรับ!!!')
                .setDescription(`${welcomeMessage}`)


            targetChannel.send({ content: 'ฮัลโลวว เว้ลค้าม', embeds: [embed] }).catch(() => { });

        }
    } catch (error) {
        console.log(`ERROR in ${__filename}:\n`, error);
    }
};
