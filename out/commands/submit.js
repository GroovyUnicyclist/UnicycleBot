"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
function createButtons(disabled = false) {
    return new discord_js_1.ActionRowBuilder()
        .setComponents([
        new discord_js_1.ButtonBuilder()
            .setCustomId('approve_trick')
            .setLabel('Approve')
            .setStyle(discord_js_1.ButtonStyle.Success)
            .setDisabled(disabled),
        new discord_js_1.ButtonBuilder()
            .setCustomId('deny_trick')
            .setLabel('Deny')
            .setStyle(discord_js_1.ButtonStyle.Danger)
            .setDisabled(disabled),
        new discord_js_1.ButtonBuilder()
            .setCustomId('rename_trick')
            .setLabel('Approve and Rename')
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setDisabled(disabled)
    ]);
}
function executeCommand(interaction, game) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var fileUpload = (_b = (_a = interaction.options.get('video_upload')) === null || _a === void 0 ? void 0 : _a.attachment) === null || _b === void 0 ? void 0 : _b.attachment;
            var fileLink = (_c = interaction.options.get('video_link')) === null || _c === void 0 ? void 0 : _c.value;
        }
        catch (error) {
            console.error(error);
            yield interaction.reply({
                content: 'There was an error while handling this interaction!',
                ephemeral: true
            }).catch(console.error);
        }
        var video = '';
        if (!fileUpload && !fileLink) {
            yield interaction.reply({
                content: "Error: video not provided",
                ephemeral: true
            }).catch(console.error);
        }
        else {
            if (fileUpload) {
                video += fileUpload + '\n';
            }
            if (fileLink) {
                video += fileLink;
            }
            video = video.trim();
            const channel = interaction.client.channels.cache.get('844654073684819979');
            if (channel && channel.isText()) {
                const trickName = (_d = interaction.options.get('trick_name')) === null || _d === void 0 ? void 0 : _d.value;
                if (typeof (trickName) === 'string') {
                    var submissionText = `**New trick submission from ${interaction.user}:**\n${trickName} (${(yield game.hasTrick(trickName)) ? 'existing' : 'new'} trick)\n\n${video}`;
                    var publicMessage = yield interaction.reply({
                        content: submissionText
                    }).catch(console.error);
                    yield channel.send({
                        content: submissionText + `\n{${interaction.channelId}, ${publicMessage === null || publicMessage === void 0 ? void 0 : publicMessage.id}}`,
                        components: [createButtons()]
                    }).catch(console.error);
                }
                else {
                    yield interaction.reply({
                        content: "Error: unable to parse trick name",
                        ephemeral: true
                    }).catch(console.error);
                }
            }
        }
    });
}
function executeAutocomplete(interaction, game) {
    return __awaiter(this, void 0, void 0, function* () {
        const trick = interaction.options.getString('trick_name');
        if (trick) {
            yield interaction.respond(yield game.getTrickAutocompleteOptions(trick)).catch(console.error);
        }
    });
}
function handleButton(interaction, game) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        var matches;
        var player;
        var trick;
        var channelId;
        var messageId;
        switch (interaction.customId) {
            case 'approve_trick':
                // interaction.deferReply()
                matches = (_b = (_a = interaction.message) === null || _a === void 0 ? void 0 : _a.content.match(/\*\*.*<@(?<player>\d+)>:\*\*\n(?<trick>.+) \(.*trick\)\n\n.*\n{(?<channelId>\d+), (?<messageId>\d+)}/)) === null || _b === void 0 ? void 0 : _b.groups;
                player = matches === null || matches === void 0 ? void 0 : matches.player;
                trick = matches === null || matches === void 0 ? void 0 : matches.trick;
                channelId = matches === null || matches === void 0 ? void 0 : matches.channels;
                messageId = matches === null || matches === void 0 ? void 0 : matches.message;
                if (player && trick) {
                    yield game.addTrickRecipient(trick, player);
                    yield interaction.update({
                        content: ((_c = interaction.message) === null || _c === void 0 ? void 0 : _c.content) + `\n\n**This trick has been approved!**`,
                        components: [createButtons(true)]
                    }).catch(console.error);
                    yield interaction.followUp({
                        content: `<@${player}> has been approved for landing: ${trick}`,
                        ephemeral: true
                    }).catch(console.error);
                    // if (messageId && channelId) {
                    //     const channel = interaction.client.channels.cache.get(channelId)
                    //     if (channel?.isTextBased()) {
                    //         var message = channel.messages.cache.get(messageId)
                    //         await message?.edit(message.content + `\n\n**This trick has been approved!**`).catch(console.error)
                    //     }
                    // }
                }
                else {
                    interaction.reply({
                        content: "Error: Could not fetch trick and user",
                        ephemeral: true
                    }).catch(console.error);
                }
                break;
            case 'deny_trick':
                matches = (_e = (_d = interaction.message) === null || _d === void 0 ? void 0 : _d.content.match(/\*\*.*<@(?<player>\d+)>:\*\*\n(?<trick>.+) \(.*trick\)\n\n.*\n{(?<channelId>\d+), (?<messageId>\d+)}/)) === null || _e === void 0 ? void 0 : _e.groups;
                player = matches === null || matches === void 0 ? void 0 : matches.player;
                trick = matches === null || matches === void 0 ? void 0 : matches.trick;
                channelId = matches === null || matches === void 0 ? void 0 : matches.channels;
                messageId = matches === null || matches === void 0 ? void 0 : matches.message;
                if (player && trick) {
                    yield interaction.update({
                        content: ((_f = interaction.message) === null || _f === void 0 ? void 0 : _f.content) + `\n\n**This trick has been denied! :(**`,
                        components: createButtons(true)
                    }).catch(console.error);
                    yield interaction.followUp({
                        content: `<@${player}> has been denied for the following trick: ${trick}`
                    }).catch(console.error);
                    // if (channelId && messageId) {
                    //     const channel = interaction.client.channels.cache.get(channelId)
                    //     if (channel?.isTextBased()) {
                    //         var message = channel.messages.cache.get(messageId)
                    //         message?.edit(message.content + `\n\n**This trick has been denied! :(**`)
                    //     }
                    // }
                }
                else {
                    yield interaction.reply({
                        content: "Error: Could not fetch trick and user",
                        ephemeral: true
                    }).catch(console.error);
                }
                break;
            case 'rename_trick':
                const modal = new discord_js_1.ModalBuilder()
                    .setCustomId('rename_modal')
                    .setTitle('Rename submission')
                    .addComponents([
                    new discord_js_1.ActionRowBuilder().addComponents([
                        new discord_js_1.TextInputBuilder().setCustomId('rename_modal_new_name').setLabel('New Trick Name').setStyle(discord_js_1.TextInputStyle.Short)
                    ])
                ]);
                yield interaction.showModal(modal).catch(console.error);
                break;
            default:
                yield interaction.reply({
                    content: "Error: Unknown interaction",
                    ephemeral: true
                }).catch(console.error);
        }
    });
}
function executeModalSubmit(interaction, game) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        if (interaction.customId === 'rename_modal') {
            var trick = interaction.fields.getTextInputValue('rename_modal_new_name');
            var matches = (_b = (_a = interaction.message) === null || _a === void 0 ? void 0 : _a.content.match(/\*\*.*<@(?<player>\d+)>:\*\*\n.+ \(.*trick\)\n\n.*\n\n{(?<channelId>\d+), (?<messageId>\d+)}/)) === null || _b === void 0 ? void 0 : _b.groups;
            var player = matches === null || matches === void 0 ? void 0 : matches.player;
            var channelId = matches === null || matches === void 0 ? void 0 : matches.channels;
            var messageId = matches === null || matches === void 0 ? void 0 : matches.message;
            if (player && trick) {
                yield game.addTrickRecipient(trick, player);
                yield interaction.editReply({
                    content: ((_c = interaction.message) === null || _c === void 0 ? void 0 : _c.content) + `\n\n**This trick has been approved!**`,
                    components: createButtons(true)
                }).catch(console.error);
                yield interaction.followUp({
                    content: `<@${player}> has been approved for landing: ${trick}`
                }).catch(console.error);
                // if (channelId && messageId) {
                //     const channel = interaction.client.channels.cache.get(channelId)
                //     if (channel?.isTextBased()) {
                //         var message = channel.messages.cache.get(messageId)
                //         message?.edit(message.content + `\n\n**This trick has been approved!**`)
                //     }
                // }
            }
            else {
                yield interaction.reply({
                    content: "Error: Could not fetch trick and user",
                    ephemeral: true
                }).catch(console.error);
            }
        }
        else {
            yield interaction.reply({
                content: "Error: Unknown interaction",
                ephemeral: true
            }).catch(console.error);
        }
    });
}
/**
 *
 */
const command = {
    /**
     *
     */
    data: new discord_js_1.SlashCommandBuilder()
        .setName('submit')
        .setDescription('Submit a trick for the trick colelctor game!')
        .addStringOption(option => option
        .setName('trick_name')
        .setDescription('The trick you are submitting a video for')
        .setRequired(true)
        .setAutocomplete(true)).addAttachmentOption(option => option
        .setName('video_upload')
        .setDescription('Upload a video submission straight to Discord')
        .setRequired(false)).addStringOption(option => option
        .setName('video_link')
        .setDescription('Insert a link to your video submission')
        .setRequired(false)),
    /**
     *
     * @param interaction
     */
    execute(interaction, game) {
        return __awaiter(this, void 0, void 0, function* () {
            if (interaction.isChatInputCommand()) {
                yield executeCommand(interaction, game);
            }
            else if (interaction.isAutocomplete()) {
                yield executeAutocomplete(interaction, game);
            }
            else if (interaction.isButton()) {
                yield handleButton(interaction, game);
            }
            else if (interaction.isModalSubmit()) {
                yield executeModalSubmit(interaction, game);
            }
            else if (interaction.isRepliable()) {
                yield interaction.followUp({
                    content: 'Error: Unimplemented interaction',
                    ephemeral: true
                });
            }
        });
    },
    /**
     *
     */
    buttonIds: ['approve_trick', 'deny_trick', 'rename_trick', 'rename_modal'],
};
module.exports = command;
