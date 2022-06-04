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
function formatPlayerTricks(user, page, game) {
    return __awaiter(this, void 0, void 0, function* () {
        var output = "";
        var tricks = yield game.getPaginatedPlayerTricks(user, page);
        for (const trick of tricks) {
            var trickScore = yield game.getTrickScore(trick);
            if (trickScore >= 0) {
                output += `\`${getStringWithSpaces(trickScore + ' points', 9)} | \`${trick}\n`;
            }
        }
        return output;
    });
}
function createButtons(page, lastPage) {
    return new discord_js_1.ActionRowBuilder()
        .addComponents([
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
}
function createPlayerEmbed(user, page, totalPages, game) {
    return __awaiter(this, void 0, void 0, function* () {
        return new discord_js_1.EmbedBuilder()
            .setDescription(`**Player stats for: <@${user}>**\n__Total points: ${yield game.getPlayerScore(BigInt(user))}__\n${yield formatPlayerTricks(user, page, game)}`)
            .setFooter({ "text": `${page}/${totalPages}` });
    });
}
function executeCommand(interaction, game) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const user = (_a = interaction.options.getUser('player')) === null || _a === void 0 ? void 0 : _a.id;
        const player = user ? yield game.getPlayer(BigInt(user)) : undefined;
        if (player) {
            const trickPages = yield game.getPlayerTricksPages(player.tricks);
            if (trickPages) {
                yield interaction.reply({
                    embeds: [yield createPlayerEmbed(player.id.toString(), 1, trickPages, game)],
                    components: [yield createButtons(1, trickPages)],
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
                content: "Error: trick name not provided",
                ephemeral: true
            }).catch(console.error);
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
    data: new discord_js_1.ContextMenuCommandBuilder()
        .setName('Game Stats')
        .setType(discord_js_1.ApplicationCommandType.User),
    /**
     *
     * @param interaction
     */
    execute(interaction, game) {
        return __awaiter(this, void 0, void 0, function* () {
            if (interaction.isContextMenuCommand()) {
                yield executeCommand(interaction, game);
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
    buttonIds: [],
};
module.exports = command;
