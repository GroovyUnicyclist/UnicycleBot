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
function getStringWithSpaces(str, spaces, prepend = false) {
    var output = str;
    var end = spaces - output.length;
    for (var i = 0; i < end; i++) {
        if (prepend) {
            output = ` ${output}`;
        }
        else {
            output = `${output} `;
        }
    }
    return output;
}
function formatTrickLanders(trick, page, game) {
    return __awaiter(this, void 0, void 0, function* () {
        var output = "";
        var trickLanders = yield game.getPaginatedTrickLanders(trick, page);
        trickLanders.forEach(trickLander => {
            output += `<@${trickLander}>\n`;
        });
        return output;
    });
}
function formatPlayerTricks(user, page, game) {
    return __awaiter(this, void 0, void 0, function* () {
        var output = "";
        var tricks = yield game.getPaginatedPlayerTricks(user, page);
        for (const trick of tricks) {
            var trickScore = yield game.getTrickScore(trick);
            if (trickScore >= 0) {
                output += `\`${getStringWithSpaces(trickScore + ' points', 9)} - \` ${trick}\n`;
            }
        }
        return output;
    });
}
/**
 *
 * @param page
 * @returns
 */
function createButtons(page, lastPage, game, trickName = "") {
    return __awaiter(this, void 0, void 0, function* () {
        const trick = yield game.getTrick(trickName);
        const example = trick ? trick.example_link : undefined;
        const tutorial = trick ? trick.tutorial : undefined;
        var actionRow = new discord_js_1.ActionRowBuilder()
            .setComponents([
            new discord_js_1.ButtonBuilder()
                .setCustomId('stats_prev')
                .setLabel('previous')
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setDisabled(page === 1),
            new discord_js_1.ButtonBuilder()
                .setCustomId('stats_next')
                .setLabel('next')
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setDisabled(page === lastPage)
        ]);
        if (example) {
            actionRow.addComponents([
                new discord_js_1.ButtonBuilder()
                    .setLabel('Example')
                    .setURL(example)
                    .setStyle(discord_js_1.ButtonStyle.Link)
            ]);
        }
        if (tutorial) {
            actionRow.addComponents([
                new discord_js_1.ButtonBuilder()
                    .setLabel('Tutorial')
                    .setURL(tutorial)
                    .setStyle(discord_js_1.ButtonStyle.Link)
            ]);
        }
        return actionRow;
    });
}
function createTrickEmbed(trick, page, totalPages, game) {
    return __awaiter(this, void 0, void 0, function* () {
        return new discord_js_1.EmbedBuilder()
            .setTitle(`Trick stats for: ${trick}`)
            .setDescription(`This trick is worth ${yield game.getTrickScore(trick)} points.`)
            .addFields([{ "name": "Landed by:", "value": `${yield formatTrickLanders(trick, page, game)}`, "inline": false }])
            .setFooter({ "text": `${page}/${totalPages}` });
    });
}
function createPlayerEmbed(user, page, totalPages, game) {
    return __awaiter(this, void 0, void 0, function* () {
        return new discord_js_1.EmbedBuilder()
            .setDescription(`**Player stats for: <@${user}>**\n__Total points: ${yield game.getPlayerScore(BigInt(user))}__\n${yield formatPlayerTricks(user, page, game)}`)
            .setFooter({ "text": `${page}/${totalPages}` });
    });
}
function executeTrickCommand(interaction, game) {
    return __awaiter(this, void 0, void 0, function* () {
        const trickName = interaction.options.getString('trick_name');
        const trick = trickName ? yield game.getTrick(trickName) : undefined;
        if (trick) {
            const trickPages = yield game.getTrickPlayersPages(trick);
            if (trickPages) {
                yield interaction.reply({
                    embeds: [yield createTrickEmbed(trick.name, 1, trickPages, game)],
                    components: [yield createButtons(1, trickPages, game, trick.name)],
                    ephemeral: true
                }).catch(console.error);
            }
            else {
                yield interaction.reply({
                    content: "Error: provided trick not found",
                    ephemeral: true
                }).catch(console.error);
            }
        }
        else {
            yield interaction.reply({
                content: "Error: user not provided",
                ephemeral: true
            }).catch(console.error);
        }
    });
}
function executePlayerCommand(interaction, game) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const user = (_a = interaction.options.getUser('player')) === null || _a === void 0 ? void 0 : _a.id;
        const player = user ? yield game.getPlayer(BigInt(user)) : undefined;
        if (player) {
            const trickPages = yield game.getPlayerTricksPages(player.tricks);
            if (trickPages) {
                yield interaction.reply({
                    embeds: [yield createPlayerEmbed(player.id.toString(), 1, trickPages, game)],
                    components: [yield createButtons(1, trickPages, game)],
                    ephemeral: true
                }).catch(console.error);
            }
            else {
                yield interaction.reply({
                    content: "Error: provided user has no data",
                    ephemeral: true
                }).catch(console.error);
            }
        }
        else {
            yield interaction.reply({
                content: "Error: trick name not provided",
                ephemeral: true
            }).catch(console.error);
        }
    });
}
function executeAutocomplete(interaction, game) {
    return __awaiter(this, void 0, void 0, function* () {
        const trickName = interaction.options.getString('trick_name');
        if (trickName) {
            yield interaction.respond(yield game.getTrickAutocompleteOptions(trickName)).catch(console.error);
        }
    });
}
function executeTrickButton(interaction, game) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        var trickName = (_c = (_b = (_a = interaction.message.embeds[0]) === null || _a === void 0 ? void 0 : _a.title) === null || _b === void 0 ? void 0 : _b.match(/.*: (.*)/)) === null || _c === void 0 ? void 0 : _c.pop();
        var currentPage = parseInt((_f = (_e = (_d = interaction.message.embeds[0]) === null || _d === void 0 ? void 0 : _d.footer) === null || _e === void 0 ? void 0 : _e.text.replace(/^(\d+)(.+)$/i, '$1')) !== null && _f !== void 0 ? _f : '1');
        const trick = trickName ? yield game.getTrick(trickName) : undefined;
        if (trick) {
            const trickPages = yield game.getTrickPlayersPages(trick);
            if (trickPages) {
                if ((yield game.getTrickPlayersPages(trick)) === null || currentPage <= 0 || currentPage > (yield game.getTrickPlayersPages(trick))) {
                    yield interaction.reply({
                        content: 'Error: Unable to change page',
                        ephemeral: true
                    }).catch(console.error);
                }
                else if (interaction.customId === "stats_prev") {
                    yield interaction.update({
                        embeds: [yield createTrickEmbed(trick.name, currentPage - 1, trickPages, game)],
                        components: [yield createButtons(currentPage - 1, trickPages, game, trick.name)]
                    }).catch(console.error);
                }
                else if (interaction.customId === "stats_next") {
                    yield interaction.update({
                        embeds: [yield createTrickEmbed(trick.name, currentPage + 1, trickPages, game)],
                        components: [yield createButtons(currentPage + 1, trickPages, game, trick.name)]
                    }).catch(console.error);
                }
                else {
                    yield interaction.reply({
                        content: 'Error: Unknown interaction',
                        ephemeral: true
                    }).catch(console.error);
                }
            }
        }
    });
}
function executePlayerButton(interaction, game) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        var user = (_c = (_b = (_a = interaction.message.embeds[0]) === null || _a === void 0 ? void 0 : _a.description) === null || _b === void 0 ? void 0 : _b.match(/.*<@(.*)>/)) === null || _c === void 0 ? void 0 : _c.pop();
        var currentPage = parseInt((_f = (_e = (_d = interaction.message.embeds[0]) === null || _d === void 0 ? void 0 : _d.footer) === null || _e === void 0 ? void 0 : _e.text.replace(/^(\d+)(.+)$/i, '$1')) !== null && _f !== void 0 ? _f : '1');
        const player = user ? yield game.getPlayer(BigInt(user)) : undefined;
        if (player) {
            const trickPages = yield game.getPlayerTricksPages(player.tricks);
            if (trickPages) {
                if ((yield game.getPlayerTricksPages(player.tricks)) === null || currentPage <= 0 || currentPage > (yield game.getPlayerTricksPages(player.tricks))) {
                    yield interaction.reply({
                        content: 'Error: Unable to change page',
                        ephemeral: true
                    }).catch(console.error);
                }
                else if (interaction.customId === "stats_prev") {
                    yield interaction.update({
                        embeds: [yield createPlayerEmbed(player.id.toString(), currentPage - 1, trickPages, game)],
                        components: [yield createButtons(currentPage - 1, trickPages, game)]
                    }).catch(console.error);
                }
                else if (interaction.customId === "stats_next") {
                    yield interaction.update({
                        embeds: [yield createPlayerEmbed(player.id.toString(), currentPage + 1, trickPages, game)],
                        components: [yield createButtons(currentPage + 1, trickPages, game)]
                    }).catch(console.error);
                }
                else {
                    yield interaction.reply({
                        content: 'Error: Unknown interaction',
                        ephemeral: true
                    }).catch(console.error);
                }
            }
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
        .setName('stats')
        .setDescription('Displays stats for a trick or user')
        .addSubcommand(subcommand => subcommand
        .setName('trick')
        .setDescription('Displays stats about a trick')
        .addStringOption(option => option.setName('trick_name').setDescription('The trick').setRequired(true).setAutocomplete(true)))
        .addSubcommand(subcommand => subcommand
        .setName('player')
        .setDescription('Displays stats about a player')
        .addUserOption(option => option.setName('player').setDescription('The player').setRequired(true))),
    /**
     *
     * @param interaction
     */
    execute(interaction, game) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            if (interaction.isChatInputCommand()) {
                switch (interaction.options.getSubcommand(true)) {
                    case 'trick':
                        yield executeTrickCommand(interaction, game);
                        break;
                    case 'player':
                        yield executePlayerCommand(interaction, game);
                        break;
                    default:
                        yield interaction.reply({
                            content: 'Error: Unimplemented interaction',
                            ephemeral: true
                        }).catch(console.error);
                }
            }
            else if (interaction.isAutocomplete()) {
                yield executeAutocomplete(interaction, game);
            }
            else if (interaction.isButton()) {
                if ((_b = (_a = interaction.message.embeds[0]) === null || _a === void 0 ? void 0 : _a.title) === null || _b === void 0 ? void 0 : _b.startsWith('Trick')) {
                    yield executeTrickButton(interaction, game);
                }
                else if ((_d = (_c = interaction.message.embeds[0]) === null || _c === void 0 ? void 0 : _c.description) === null || _d === void 0 ? void 0 : _d.startsWith('**Player')) {
                    yield executePlayerButton(interaction, game);
                }
                else {
                    yield interaction.reply({
                        content: 'Error: Unknown interaction',
                        ephemeral: true
                    }).catch(console.error);
                }
            }
            else if (interaction.isRepliable()) {
                yield interaction.reply({
                    content: 'Error: Unimplemented interaction',
                    ephemeral: true
                }).catch(console.error);
            }
        });
    },
    /**
     *
     */
    buttonIds: ["stats_prev", "stats_next"],
};
module.exports = command;
