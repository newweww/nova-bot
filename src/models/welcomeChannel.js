const { Schema, model } = require('mongoose');

const welcomeChannelSchema = new Schema(
    {
        guildId: {
            type: String,
            require: true,
            unique: true,
        },
        channelId: {
            type: String,
            require: true,
            unique: true,
        },
        customMessage: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = model('WelcomeChannel', welcomeChannelSchema);