import { SlashCommandBuilder, Interaction, ChatInputCommandInteraction, AutocompleteInteraction} from 'discord.js';
import { Command } from '../command';
import { Game } from '../game';

async function executeAddCommand(interaction: ChatInputCommandInteraction, game: Game) {
	const trick = interaction.options.getString('trick_name')
	const player = interaction.options.getUser('player')?.id
	if (trick && player) {
		if (await game.addTrickRecipient(trick, player)) {
			const score = await game.getTrickScore(trick)
			await interaction.reply({
				content: `Awarded \`${score}\` points to <@${player}> for the following trick: \`${trick}\``
			}).catch(console.error);
		} else {
			await interaction.reply({
                content: 'Error: Failed to update edit records.',
                ephemeral: true
            }).catch(console.error);
		}
	} else {
		await interaction.reply({
			content: 'Error: Failed to update edit records.',
			ephemeral: true
		}).catch(console.error);
	}
}

async function executeRemoveCommand(interaction: ChatInputCommandInteraction, game: Game) {
	const trick = interaction.options.getString('trick_name')
	const player = interaction.options.getUser('player')?.id
	if (trick && player) {
		const score = await game.getTrickScore(trick)
		if (await game.removeTrickRecipient(trick, player)) {
			await interaction.reply({
				content: `Revoked \`${score}\` points from <@${player}> for the following trick: \`${trick}\``
			}).catch(console.error);
		} else {
			await interaction.reply({
				content: 'Error: Failed to update edit records.',
				ephemeral: true
			}).catch(console.error);
		}
	} else {
		await interaction.reply({
			content: 'Error: Failed to update edit records.',
			ephemeral: true
		}).catch(console.error);
	}
}

async function executeMergeCommand(interaction: ChatInputCommandInteraction, game: Game) {
	const trick = interaction.options.getString('trick')
	const trickToBeMerged = interaction.options.getString('trick_to_be_merged')
	if (trick && trickToBeMerged) {
		if(await game.mergeTricks(trick, trickToBeMerged)) {
			await interaction.reply({
				content: `Merged \`${trickToBeMerged}\` data into \`${trick}\``
			}).catch(console.error);
		} else {
			await interaction.reply({
				content: 'Error: Failed to update edit records.',
				ephemeral: true
			}).catch(console.error);
		}
	} else {
		await interaction.reply({
			content: 'Error: Failed to update edit records.',
			ephemeral: true
		}).catch(console.error);
	}
}

async function executeRenameCommand(interaction: ChatInputCommandInteraction, game: Game) {
	const trick = interaction.options.getString('trick_name')?.toLowerCase();
	const new_trick = interaction.options.getString('new_trick_name')?.toLowerCase();
	if (trick && new_trick) {
		if (await game.renameTrick(trick, new_trick)) {
			await interaction.reply({
				content: `Successfully renamed \`${trick}\` to \`${new_trick}\``
			}).catch(console.error);
		} else {
			await interaction.reply({
                content: 'Error: Failed to update edit records.',
                ephemeral: true
            }).catch(console.error);
		}
	} else {
		await interaction.reply({
			content: 'Error: Failed to update edit records.',
			ephemeral: true
		}).catch(console.error);
	}
}

async function executeAutocomplete(interaction: AutocompleteInteraction, game: Game) {
	let trick = interaction.options.getString('trick_name');
    if (trick) {
        await interaction.respond(await game.getTrickAutocompleteOptions(trick, interaction.options.getSubcommand(true) === 'add')).catch(console.error);
    } else {
		trick = interaction.options.getString('trick_to_be_merged');
		if (trick) await interaction.respond(await game.getTrickAutocompleteOptions(trick)).catch(console.error);
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
				.addStringOption(option => option.setName('trick_name').setDescription('The trick whose name will be used').setRequired(true).setAutocomplete(true))
				.addStringOption(option => option.setName('trick_to_be_merged').setDescription('The trick to be merged').setRequired(true).setAutocomplete(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('rename')
				.setDescription('Rename an existing trick')
				.addStringOption(option => option.setName('trick_name').setDescription('The trick to rename').setRequired(true).setAutocomplete(true))
				.addStringOption(option => option.setName('new_trick_name').setDescription('The new name for the trick').setRequired(true))),

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
				case 'rename': 
                    await executeRenameCommand(interaction, game)
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