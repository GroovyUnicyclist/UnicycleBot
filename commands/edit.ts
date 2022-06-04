import { SlashCommandBuilder, Interaction, ChatInputCommandInteraction, AutocompleteInteraction} from 'discord.js';
import { Command } from '../command';
import { Game } from '../game';

async function executeAddCommand(interaction: ChatInputCommandInteraction, game: Game) {
	const trick = interaction.options.getString('trick_name')
	const player = interaction.options.getUser('player')?.id
	if (trick && player) {
		await game.addTrickRecipient(trick, player)
		const score = await game.getTrickScore(trick)
		await interaction.reply({
			content: `Awarded \`${score}\` points to <@${player}> for the following trick: \`${trick}\``
		}).catch(console.error);
	}
}

async function executeRemoveCommand(interaction: ChatInputCommandInteraction, game: Game) {
	const trick = interaction.options.getString('trick_name')
	const player = interaction.options.getUser('player')?.id
	if (trick && player) {
		const score = await game.getTrickScore(trick)
		await game.removeTrickRecipient(trick, player)
		await interaction.reply({
			content: `Revoked \`${score}\` points from <@${player}> for the following trick: \`${trick}\``
		}).catch(console.error);
	}
}

async function executeMergeCommand(interaction: ChatInputCommandInteraction, game: Game) {
	const trick = interaction.options.getString('trick')
	const trickToBeMerged = interaction.options.getString('trick_to_be_merged')
	if (trick && trickToBeMerged) {
		await game.mergeTricks(trick, trickToBeMerged)
		await interaction.reply({
			content: `Merged \`${trickToBeMerged}\` data into \`${trick}\``
		}).catch(console.error);
	}
}

async function executeAutocomplete(interaction: AutocompleteInteraction, game: Game) {
	const trick = interaction.options.getString('trick_name');
    if (trick) {
        await interaction.respond(await game.getTrickAutocompleteOptions(trick, interaction.options.getSubcommand(true) === 'add')).catch(console.error);
    }
}

/**
 * 
 */
const command: Command =  {
	/**
	 * 
	 */
	data: new SlashCommandBuilder()
		.setName('edit')
		.setDescription('Edit trick records')
		.addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a trick from a player\'s records')
				.addUserOption(option => option.setName('player').setDescription('The player').setRequired(true))
                .addStringOption(option => option.setName('trick_name').setDescription('The trick').setRequired(true).setAutocomplete(true)))
		.addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a trick from a player\'s records')
                .addUserOption(option => option.setName('player').setDescription('The player').setRequired(true))
				.addStringOption(option => option.setName('trick_name').setDescription('The trick').setRequired(true).setAutocomplete(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('merge')
				.setDescription('Merge two existing tricks')
				.addStringOption(option => option.setName('trick').setDescription('The trick whose name will be used').setRequired(true).setAutocomplete(true))
				.addStringOption(option => option.setName('trick_to_be_merged').setDescription('The trick to be merged').setRequired(true).setAutocomplete(true))),

	/**
	 * 
	 * @param interaction 
	 */
	async execute(interaction: Interaction, game: Game) {
		if (interaction.isChatInputCommand()) {
            switch (interaction.options.getSubcommand(true)) {
                case 'add': 
                    await executeAddCommand(interaction, game)
                    break;
                case 'remove': 
                    await executeRemoveCommand(interaction, game)
                    break;
				case 'merge': 
                    await executeMergeCommand(interaction, game)
                    break;
                default:
                    await interaction.reply({
                        content: 'Error: Unimplemented interaction',
				        ephemeral: true
                    }).catch(console.error);
            }
        } else if (interaction.isAutocomplete()) {
            await executeAutocomplete(interaction, game);
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