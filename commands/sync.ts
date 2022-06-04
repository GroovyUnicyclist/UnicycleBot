import { SlashCommandBuilder, Interaction, ChatInputCommandInteraction} from 'discord.js';
import { Command } from '../command';
import { Game } from '../game';

async function executeCommand(interaction: ChatInputCommandInteraction, game: Game) {
    game.syncData();
    await interaction.reply({
        content: 'Game data synced!',
        ephemeral: true
    }).catch(console.error);
}

/**
 * 
 */
const command: Command =  {
	/**
	 * 
	 */
	data: new SlashCommandBuilder()
		.setName('sync')
		.setDescription('Recalculates player scores'),

	/**
	 * 
	 * @param interaction 
	 */
	async execute(interaction: Interaction, game: Game) {
		if (interaction.isChatInputCommand()) {
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

module.exports = command;