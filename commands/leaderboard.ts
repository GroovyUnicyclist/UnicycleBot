import { SlashCommandBuilder, ButtonInteraction, InteractionReplyOptions, MessagePayload, Interaction, CommandInteraction, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../command';
import { Game } from '../game';

/**
 * 
 * @param str 
 * @param spaces 
 * @param prepend 
 * @returns 
 */
function getStringWithSpaces(str: string, spaces: number, prepend: boolean = false): string {
    var output = str;
    var end = spaces - output.length;
    for (var i = 0; i < end; i++) {
        if (prepend) {
           output = ` ${output}` 
        } else {
            output = `${output} `
        }
        
    }
    return output
}

/**
 * 
 * @param page 
 * @returns 
 */
async function formatLeaderboard(page: number, game: Game): Promise<string> {
    var players = await game.getPaginatedLeaderboard(page);
    var output = "`Rank Points User`\n";
    for (var i = 0; i < players.length; i++) {
        var playerScore = await game.getPlayerScore(BigInt(players[i]!.id));
        output += `\`${getStringWithSpaces(((page-1)*10 + i + 1) + '.', 5)}${getStringWithSpaces(playerScore.toString(), 6)}\` <@${players[i]!.id}>\n`
    }
    return output
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
                    "custom_id": "leaderboard_prev",
                    "disabled": page === 1
                },
                {
                    "type": 2,
                    "label": "next",
                    "style": 1,
                    "custom_id": "leaderboard_next",
                    "disabled": page === await game.getLeaderboardPages()
                }
            ]
        }
    ]
}

async function executeCommand(interaction: ChatInputCommandInteraction, game: Game) {
    await interaction.reply({
        embeds: [
          {
            "title": "Leaderboard",
            "description": await formatLeaderboard(1, game),
            "footer": {
              "text": `1/${await game.getLeaderboardPages()}`
            }
          }
        ],
        components: await createButtons(1, game),
        ephemeral: true
    }).catch(console.error);
}

async function executeButton(interaction: ButtonInteraction, game: Game) {
    var currentPage = parseInt(interaction.message.embeds[0]?.footer?.text.replace(/^(\d+)(.+)$/i,'$1') ?? '1');
    if (currentPage <= 0 || currentPage > await game.getLeaderboardPages()) {
        await interaction.reply({
            content: 'Error: Unable to change page',
            ephemeral: true
        }).catch(console.error);
    } else if (interaction.customId === "leaderboard_prev") {
        await interaction.update({
            embeds: [
                {
                    "title": "Leaderboard",
                    "description": await formatLeaderboard(currentPage - 1, game),
                    "footer": {
                    "text": `${currentPage - 1}/${await game.getLeaderboardPages()}`
                    }
                }
                ],
                components: await createButtons(currentPage - 1, game)
        }).catch(console.error);
    } else if (interaction.customId === "leaderboard_next") {
        await interaction.update({
            embeds: [
                {
                    "title": "Leaderboard",
                    "description": await formatLeaderboard(currentPage + 1, game),
                    "footer": {
                    "text": `${currentPage + 1}/${await game.getLeaderboardPages()}`
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
		.setName('leaderboard')
		.setDescription('Leaderboard'),
    
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
    buttonIds: ["leaderboard_prev", "leaderboard_next"],

};

module.exports = command;