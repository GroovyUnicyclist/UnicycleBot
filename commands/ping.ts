import { SlashCommandBuilder, Interaction} from 'discord.js';
import { Command } from '../command';
import { Game } from '../game';

/**
 * 
 */
const command: Command =  {
	/**
	 * 
	 */
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!!!'),

	/**
	 * 
	 * @param interaction 
	 */
	async execute(interaction: Interaction, game: Game) {
		if (interaction.isChatInputCommand()) {
			await interaction.reply('Pong!').catch(console.error);
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