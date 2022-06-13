import { ActionRowBuilder, AutocompleteInteraction, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, CommandInteraction, Interaction, ModalActionRowComponentBuilder, ModalBuilder, ModalSubmitInteraction, SlashCommandBuilder, TextInputBuilder, TextInputStyle} from 'discord.js';
import { Command } from '../command';
import { Game } from '../game';

function createButtons(disabled: boolean = false): any {
    return new ActionRowBuilder()
        .setComponents([
            new ButtonBuilder()
                .setCustomId('approve_trick')
                .setLabel('Approve')
                .setStyle(ButtonStyle.Success)
                .setDisabled(disabled)
            , new ButtonBuilder()
                .setCustomId('deny_trick')
                .setLabel('Deny')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(disabled)
            , new ButtonBuilder()
                .setCustomId('rename_trick')
                .setLabel('Approve and Rename')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled)
        ])
}

async function executeCommand(interaction: ChatInputCommandInteraction, game: Game) {
    let fileUpload = undefined
    let fileLink = undefined
    try {
        fileUpload = interaction.options.get('video_upload')?.attachment?.attachment
        fileLink = interaction.options.get('video_link')?.value
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'There was an error while handling this interaction!',
            ephemeral: true
        }).catch(console.error);
    }

    let video = ''
    if (!fileUpload && !fileLink) {
        await interaction.reply({
            content: "Error: video not provided",
            ephemeral: true
        }).catch(console.error);
    } else {
        if (fileUpload) {
            video += fileUpload + '\n'
        }
        if (fileLink) {
            video += fileLink
        }
        video = video.trim()

        const channel = interaction.client.channels.cache.get('844654073684819979');
        if (channel && channel.isText()) {
            const trickName = interaction.options.get('trick_name')?.value
            if (typeof(trickName) === 'string') {
                let submissionText = `**New trick submission from ${interaction.user}:**\n${trickName} (${await game.hasTrick(trickName) ? 'existing' : 'new'} trick)\n\n${video}`
                let publicMessage = await interaction.reply({
                    content: submissionText
                }).catch(console.error);
                await channel.send({
                    content: submissionText + `\n{${interaction.channelId}, ${publicMessage?.id}}`,
                    components: [createButtons()]
                }).catch(console.error);
            } else {
                await interaction.reply({
                    content: "Error: unable to parse trick name",
                    ephemeral: true
                }).catch(console.error);
            }
        }
    }
}

async function executeAutocomplete(interaction: AutocompleteInteraction, game: Game) {
    const trick = interaction.options.getString('trick_name')
    if (trick) {
        await interaction.respond(await game.getTrickAutocompleteOptions(trick)).catch(console.error);
    }
}

async function handleButton(interaction: ButtonInteraction, game: Game) {
    let matches;
    let player;
    let trick;
    let channelId;
    let messageId;
    switch (interaction.customId) {
        case 'approve_trick':
            // interaction.deferReply()
            matches = interaction.message?.content.match(/\*\*.*<@(?<player>\d+)>:\*\*\n(?<trick>.+) \(.*trick\)\n\n.*\n{(?<channelId>\d+), (?<messageId>\d+)}/)?.groups
            player = matches?.player
            trick = matches?.trick
            channelId = matches?.channels
            messageId = matches?.message
            if (player && trick) {
                await game.addTrickRecipient(trick, player)

                await interaction.update({
                    content: interaction.message?.content + `\n\n**This trick has been approved!**`,
                    components: [createButtons(true)]
                }).catch(console.error);

                await interaction.followUp({
                    content: `<@${player}> has been approved for landing: ${trick}`,
                    ephemeral: true
                }).catch(console.error);

                // if (messageId && channelId) {
                //     const channel = interaction.client.channels.cache.get(channelId)
                //     if (channel?.isTextBased()) {
                //         let message = channel.messages.cache.get(messageId)
                //         await message?.edit(message.content + `\n\n**This trick has been approved!**`).catch(console.error)
                //     }
                // }
            } else {
                interaction.reply({
                    content: "Error: Could not fetch trick and user",
                    ephemeral: true
                }).catch(console.error);
            }
            break;
        case 'deny_trick':
            matches = interaction.message?.content.match(/\*\*.*<@(?<player>\d+)>:\*\*\n(?<trick>.+) \(.*trick\)\n\n.*\n{(?<channelId>\d+), (?<messageId>\d+)}/)?.groups
            player = matches?.player
            trick = matches?.trick
            channelId = matches?.channels
            messageId = matches?.message
            if (player && trick) {
                await interaction.update({
                    content: interaction.message?.content + `\n\n**This trick has been denied! :(**`,
                    components: createButtons(true)
                }).catch(console.error);

                await interaction.followUp({
                    content: `<@${player}> has been denied for the following trick: ${trick}`
                }).catch(console.error);

                // if (channelId && messageId) {
                //     const channel = interaction.client.channels.cache.get(channelId)
                //     if (channel?.isTextBased()) {
                //         let message = channel.messages.cache.get(messageId)
                //         message?.edit(message.content + `\n\n**This trick has been denied! :(**`)
                //     }
                // }
            } else {
                await interaction.reply({
                    content: "Error: Could not fetch trick and user",
                    ephemeral: true
                }).catch(console.error);
            }
            break;
        case 'rename_trick':
            const modal = new ModalBuilder()
                .setCustomId('rename_modal')
                .setTitle('Rename submission')
                .addComponents([
                    new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([
                        new TextInputBuilder().setCustomId('rename_modal_new_name').setLabel('New Trick Name').setStyle(TextInputStyle.Short)
                    ])
                ])
            await interaction.showModal(modal).catch(console.error);
            break;
        default:
            await interaction.reply({
                content: "Error: Unknown interaction",
                ephemeral: true
            }).catch(console.error);
    }
}

async function executeModalSubmit(interaction: ModalSubmitInteraction, game: Game) {
    if (interaction.customId === 'rename_modal') {
        let trick = interaction.fields.getTextInputValue('rename_modal_new_name')
        let matches = interaction.message?.content.match(/\*\*.*<@(?<player>\d+)>:\*\*\n.+ \(.*trick\)\n\n.*\n\n{(?<channelId>\d+), (?<messageId>\d+)}/)?.groups
        let player = matches?.player
        let channelId = matches?.channels
        let messageId = matches?.message
        if (player && trick) {
            await game.addTrickRecipient(trick, player)

            await interaction.editReply({
                content: interaction.message?.content + `\n\n**This trick has been approved!**`,
                components: createButtons(true)
            }).catch(console.error);

            await interaction.followUp({
                content: `<@${player}> has been approved for landing: ${trick}`
            }).catch(console.error);

            // if (channelId && messageId) {
            //     const channel = interaction.client.channels.cache.get(channelId)
            //     if (channel?.isTextBased()) {
            //         let message = channel.messages.cache.get(messageId)
            //         message?.edit(message.content + `\n\n**This trick has been approved!**`)
            //     }
            // }
        } else {
            await interaction.reply({
                content: "Error: Could not fetch trick and user",
                ephemeral: true
            }).catch(console.error);
        }
    } else {
        await interaction.reply({
            content: "Error: Unknown interaction",
            ephemeral: true
        }).catch(console.error);
    }
}

/**
 * 
 */
const command: Command = {
	/**
	 * 
	 */
	data: new SlashCommandBuilder()
        .setName('submit')
        .setDescription('Submit a trick for the trick colelctor game!')
        .addStringOption(option => option
            .setName('trick_name')
            .setDescription('The trick you are submitting a video for')
            .setRequired(true)
            .setAutocomplete(true)
        ).addAttachmentOption(option => option
            .setName('video_upload')
            .setDescription('Upload a video submission straight to Discord')
            .setRequired(false)
        ).addStringOption(option => option
            .setName('video_link')
            .setDescription('Insert a link to your video submission')
            .setRequired(false)
        ),

	/**
	 * 
	 * @param interaction 
	 */
	async execute(interaction: Interaction, game: Game) {
        if (interaction.isChatInputCommand()) {
            await executeCommand(interaction, game);
        } else if (interaction.isAutocomplete()) {
            await executeAutocomplete(interaction, game);
        } else if (interaction.isButton()) {
            await handleButton(interaction, game);
        } else if (interaction.isModalSubmit()) {
            await executeModalSubmit(interaction, game);
        } else if (interaction.isRepliable()) {
            await interaction.followUp({
				content: 'Error: Unimplemented interaction',
				ephemeral: true
			})
        }
	},

	/**
	 * 
	 */
	buttonIds: ['approve_trick', 'deny_trick', 'rename_trick', 'rename_modal'],
};

module.exports = command