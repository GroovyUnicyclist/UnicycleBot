import { SlashCommandBuilder, ButtonInteraction, InteractionReplyOptions, MessagePayload, Interaction, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../command';
import { Game } from '../game'

/**
 * 
 * @param page 
 * @returns 
 */
async function formatTricks(page: number, game: Game): Promise<string> {
    var tricks = await game.getPaginatedTricks(page);
    var output = "```";
    for (var i = 0; i < tricks.length; i++) {
        var trickScore = await game.getTrickScore(tricks[i]!.name)
        output += `${trickScore} points ${trickScore >= 10 ? "" : " "}| ${tricks[i]!.name}\n`
    }
    return tricks.length > 0  ? output + "```" : ''
}

/**
 * 
 * @param page 
 * @returns 
 */
async function createButtons(page: number, game: Game): Promise<any> {
    return [
        {
            "type": 1,
            "components": [
                {
                    "type": 2,
                    "label": "previous",
                    "style": 1,
                    "custom_id": "tricks_prev",
                    "disabled": page === 1
                },
                {
                    "type": 2,
                    "label": "next",
                    "style": 1,
                    "custom_id": "tricks_next",
                    "disabled": page === await game.getTricksPages()
                }
            ]
        }
    ]
}

async function executeCommand(interaction: ChatInputCommandInteraction, game: Game) {
    await interaction.reply({
        embeds: [
            {
                "title": "Tricks",
                "description": await formatTricks(1, game),
                "footer": {
                    "text": `1/${await game.getTricksPages()}`
                }
            }
        ],
        components: await createButtons(1, game),
        ephemeral: true
    }).catch(console.error);
}

async function executeButton(interaction: ButtonInteraction, game: Game) {
    var currentPage = parseInt(interaction.message.embeds[0]?.footer?.text.replace(/^(\d+)(.+)$/i, '$1') ?? '1');
    if (currentPage <= 0 || currentPage > await game.getTricksPages()) {
        await interaction.reply({
            content: 'Error: Unable to change page',
            ephemeral: true
        }).catch(console.error);
    } else if (interaction.customId === "tricks_prev") {
        await interaction.update({
            embeds: [
                {
                    "title": "Tricks",
                    "description": await formatTricks(currentPage - 1, game),
                    "footer": {
                        "text": `${currentPage - 1}/${await game.getTricksPages()}`
                    }
                }
            ],
            components: await createButtons(currentPage - 1, game)
        }).catch(console.error);
    } else if (interaction.customId === "tricks_next") {
        await interaction.update({
            embeds: [
                {
                    "title": "Tricks",
                    "description": await formatTricks(currentPage + 1, game),
                    "footer": {
                        "text": `${currentPage + 1}/${await game.getTricksPages()}`
                    }
                }
            ],
            components: await createButtons(currentPage + 1, game)
        }).catch(console.error);
    } else {
        await interaction.reply({
            content: 'Error: Unknown interaction',
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
        .setName('tricks')
        .setDescription('Displays a list of tricks that have been done'),

    /**
     * 
     * @param interaction 
     */
    async execute(interaction: Interaction, game: Game) {
        if (interaction.isChatInputCommand()) {
            await executeCommand(interaction, game);
        } else if (interaction.isButton()) {
            await executeButton(interaction, game);
        } else if (interaction.isRepliable()) {
            await interaction.reply({
                content: 'Error: Unimplemented interaction',
                ephemeral: true
            }).catch(console.error);
        }
    },

    /**
     * 
     */
    buttonIds: ["tricks_prev", "tricks_next"],

};

module.exports = command;