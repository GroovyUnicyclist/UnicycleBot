import { SlashCommandBuilder, ButtonInteraction, Interaction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AutocompleteInteraction, CommandInteraction, ChatInputCommandInteraction, Attachment } from 'discord.js';
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

async function formatTrickLanders(trick: string, page: number, game: Game): Promise<string> {
    let output = "";
    let trickLanders = await game.getPaginatedTrickLanders(trick, page);
    trickLanders.forEach(trickLander => {
        output += `<@${trickLander}>\n`
    })
    return output
}

async function formatPlayerTricks(user: string, page: number, game: Game): Promise<string> {
    let output = "";
    let tricks = await game.getPaginatedPlayerTricks(user, page);
    for (const trick of tricks) {
        let trickScore = await game.getTrickScore(trick)
        if (trickScore >= 0) {
            output += `\`${getStringWithSpaces(trickScore + ' points', 9)} - \` ${trick}\n`
        }
    }
    return output
}

/**
 * 
 * @param page 
 * @returns 
 */
async function createButtons(page: number, lastPage: number, game: Game, trickName: string = ""): Promise<any> {
    const trick = await game.getTrick(trickName)
    const example = trick ? trick.example_link : undefined
    const tutorial = trick ? trick.tutorial : undefined
    let actionRow = new ActionRowBuilder()
        .setComponents([
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
    if (example) {
        actionRow.addComponents([
            new ButtonBuilder()
                .setLabel('Example')
                .setURL(example)
                .setStyle(ButtonStyle.Link)
        ])
    }
    if (tutorial) {
        actionRow.addComponents([
            new ButtonBuilder()
                .setLabel('Tutorial')
                .setURL(tutorial)
                .setStyle(ButtonStyle.Link)
        ])
    }
    return actionRow
}

async function createTrickEmbed(trick: string, page: number, totalPages: number, game: Game): Promise<EmbedBuilder> {
    return new EmbedBuilder()
        .setTitle(`Trick stats for: ${trick}`)
        .setDescription(`This trick is worth ${await game.getTrickScore(trick)} points.`)
        .addFields([{"name": "Landed by:", "value": `${await formatTrickLanders(trick, page, game)}`, "inline": false}])
        .setFooter({"text": `${page}/${totalPages}`})
}

async function createPlayerEmbed(user: string, page: number, totalPages: number, game: Game): Promise<EmbedBuilder> {
    return new EmbedBuilder()
        .setDescription(`**Player stats for: <@${user}>**\n__Total points: ${await game.getPlayerScore(BigInt(user))}__\n${await formatPlayerTricks(user, page, game)}`)
        .setFooter({"text": `${page}/${totalPages}`})
}

async function executeTrickCommand(interaction: ChatInputCommandInteraction, game: Game): Promise<void> {
    const trickName = interaction.options.getString('trick_name');
    const trick = trickName ? await game.getTrick(trickName) : undefined;
    if (trick) {
        const trickPages = await game.getTrickPlayersPages(trick);
        if (trickPages) {
            await interaction.reply({
                embeds: [await createTrickEmbed(trick.name, 1, trickPages, game)],
                components: [await createButtons(1, trickPages, game, trick.name)],
                ephemeral: true
            }).catch(console.error);
        } else {
            await interaction.reply({
                content: "Error: provided trick not found",
                ephemeral: true
            }).catch(console.error);
        }
    } else {
        await interaction.reply({
            content: "Error: provided trick not found",
            ephemeral: true
        }).catch(console.error);
    }
}

async function executePlayerCommand(interaction: ChatInputCommandInteraction, game: Game): Promise<void> {
    const user = interaction.options.getUser('player')?.id
    const player = user ? await game.getPlayer(BigInt(user)) : undefined;
    if (player) {
        const trickPages = await game.getPlayerTricksPages(player.tricks)
        if (trickPages) {
            await interaction.reply({
                embeds: [await createPlayerEmbed(player.id.toString(), 1, trickPages, game)],
                components: [await createButtons(1, trickPages, game)],
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

async function executeAutocomplete(interaction: AutocompleteInteraction, game: Game) {
    const trickName = interaction.options.getString('trick_name');
    if (trickName) {
        await interaction.respond(await game.getTrickAutocompleteOptions(trickName)).catch(console.error);
    }
}

async function executeTrickButton(interaction: ButtonInteraction, game: Game) {
    let trickName =  interaction.message.embeds[0]?.title?.match(/.*: (.*)/)?.pop()
    let currentPage = parseInt(interaction.message.embeds[0]?.footer?.text.replace(/^(\d+)(.+)$/i, '$1') ?? '1');
    const trick = trickName ? await game.getTrick(trickName) : undefined;
    if (trick) {
        const trickPages = await game.getTrickPlayersPages(trick)
        if (trickPages) {
            if (await game.getTrickPlayersPages(trick) === null || currentPage <= 0 || currentPage > await game.getTrickPlayersPages(trick)!) {
                await interaction.reply({
                    content: 'Error: Unable to change page',
                    ephemeral: true
                }).catch(console.error);
            } else if (interaction.customId === "stats_prev") {
                await interaction.update({
                    embeds: [await createTrickEmbed(trick.name, currentPage - 1, trickPages, game)],
                    components: [await createButtons(currentPage - 1, trickPages, game, trick.name)]
                }).catch(console.error);
            } else if (interaction.customId === "stats_next") {
                await interaction.update({
                    embeds: [await createTrickEmbed(trick.name, currentPage + 1, trickPages, game)],
                    components: [await createButtons(currentPage + 1, trickPages, game, trick.name)]
                }).catch(console.error);
            } else {
                await interaction.reply({
                    content: 'Error: Unknown interaction',
                    ephemeral: true
                }).catch(console.error);
            }
        }
    }
}

async function executePlayerButton(interaction: ButtonInteraction, game: Game) {
    let user =  interaction.message.embeds[0]?.description?.match(/.*<@(.*)>/)?.pop()
    let currentPage = parseInt(interaction.message.embeds[0]?.footer?.text.replace(/^(\d+)(.+)$/i, '$1') ?? '1');
    const player = user ? await game.getPlayer(BigInt(user)) : undefined;
    if (player) {
        const trickPages = await game.getPlayerTricksPages(player.tricks)
        if (trickPages) {
            if (await game.getPlayerTricksPages(player.tricks) === null || currentPage <= 0 || currentPage > await game.getPlayerTricksPages(player.tricks)!) {
                await interaction.reply({
                    content: 'Error: Unable to change page',
                    ephemeral: true
                }).catch(console.error);
            } else if (interaction.customId === "stats_prev") {
                await interaction.update({
                    embeds: [await createPlayerEmbed(player.id.toString(), currentPage - 1, trickPages, game)],
                    components: [await createButtons(currentPage - 1, trickPages, game)]
                }).catch(console.error);
            } else if (interaction.customId === "stats_next") {
                await interaction.update({
                    embeds: [await createPlayerEmbed(player.id.toString(), currentPage + 1, trickPages, game)],
                    components: [await createButtons(currentPage + 1, trickPages, game)]
                }).catch(console.error);
            } else {
                await interaction.reply({
                    content: 'Error: Unknown interaction',
                    ephemeral: true
                }).catch(console.error);
            }
        }
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
        .setName('stats')
        .setDescription('Displays stats for a trick or user')
        .addSubcommand(subcommand =>
            subcommand
                .setName('trick')
                .setDescription('Displays stats about a trick')
                .addStringOption(option => option.setName('trick_name').setDescription('The trick').setRequired(true).setAutocomplete(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('player')
                .setDescription('Displays stats about a player')
                .addUserOption(option => option.setName('player').setDescription('The player').setRequired(true))),

    /**
     * 
     * @param interaction 
     */
    async execute(interaction: Interaction, game: Game) {
        if (interaction.isChatInputCommand()) {
            switch (interaction.options.getSubcommand(true)) {
                case 'trick': 
                    await executeTrickCommand(interaction, game)
                    break;
                case 'player': 
                    await executePlayerCommand(interaction, game)
                    break;
                default:
                    await interaction.reply({
                        content: 'Error: Unimplemented interaction',
				        ephemeral: true
                    }).catch(console.error);
            }
        } else if (interaction.isAutocomplete()) {
            await executeAutocomplete(interaction, game);
        } else if (interaction.isButton()) {
            if (interaction.message.embeds[0]?.title?.startsWith('Trick')) {
                await executeTrickButton(interaction, game)
            } else if (interaction.message.embeds[0]?.description?.startsWith('**Player')) {
                await executePlayerButton(interaction, game)
            } else {
                await interaction.reply({
                    content: 'Error: Unknown interaction',
                    ephemeral: true
                }).catch(console.error);
            }
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
    buttonIds: ["stats_prev", "stats_next"],

};

module.exports = command;