import { ContextMenuCommandBuilder, ButtonBuilder, ButtonStyle, Interaction, ActionRowBuilder, EmbedBuilder, ApplicationCommandType, ContextMenuCommandInteraction } from 'discord.js';
import { Command } from '../command';
import { Game } from '../game';

function getStringWithSpaces(str: string, spaces: number, prepend: boolean = false): string {
    let output = str;
    let end = spaces - output.length;
    for (let i = 0; i < end; i++) {
        if (prepend) {
           output = ` ${output}` 
        } else {
            output = `${output} `
        }
        
    }
    return output
}

async function formatPlayerTricks(user: string, page: number, game: Game): Promise<string> {
    let output = "";
    let tricks = await game.getPaginatedPlayerTricks(user, page);
    for (const trick of tricks) {
        let trickScore = await game.getTrickScore(trick)
        if (trickScore >= 0) {
            output += `\`${getStringWithSpaces(trickScore + ' points', 9)} | \`${trick}\n`
        }
    }
    return output
}

function createButtons(page: number, lastPage: number): any {
    return new ActionRowBuilder()
        .addComponents([
            new ButtonBuilder()
                .setCustomId('stats_prev')
                .setLabel('previous')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === 1)
            , new ButtonBuilder()
                .setCustomId('stats_next')
                .setLabel('next')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === lastPage)
		])
    
}

async function createPlayerEmbed(user: string, page: number, totalPages: number, game: Game): Promise<EmbedBuilder> {
    return new EmbedBuilder()
        .setDescription(`**Player stats for: <@${user}>**\n__Total points: ${await game.getPlayerScore(BigInt(user))}__\n${await formatPlayerTricks(user, page, game)}`)
        .setFooter({"text": `${page}/${totalPages}`})
}

async function executeCommand(interaction: ContextMenuCommandInteraction, game: Game) {
	const user = interaction.targetId
    const player = user ? await game.getPlayer(BigInt(user)) : undefined;
    if (player) {
        const trickPages = await game.getPlayerTricksPages(player.tricks)
        if (trickPages) {
            await interaction.reply({
                embeds: [await createPlayerEmbed(player.id.toString(), 1, trickPages, game)],
                components: [await createButtons(1, trickPages)],
                ephemeral: true
            }).catch(console.error);
        } else {
            await interaction.reply({
                content: "Error: provided user has no data",
                ephemeral: true
            }).catch(console.error);
        }
    } else {
        await interaction.reply({
            content: "Error: provided user has no data",
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
	data: new ContextMenuCommandBuilder()
		.setName('Game Stats')
		.setType(ApplicationCommandType.User),

	/**
	 * 
	 * @param interaction 
	 */
	async execute(interaction: Interaction, game: Game) {
		if (interaction.isContextMenuCommand()) {
			await executeCommand(interaction, game);
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
	buttonIds: [],

};

module.exports = command