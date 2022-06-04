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
/**
 *
 * @param page
 * @returns
 */
function formatTricks(page, game) {
    return __awaiter(this, void 0, void 0, function* () {
        var tricks = yield game.getPaginatedTricks(page);
        var output = "```";
        for (var i = 0; i < tricks.length; i++) {
            var trickScore = yield game.getTrickScore(tricks[i].name);
            output += `${trickScore} points ${trickScore >= 10 ? "" : " "}| ${tricks[i].name}\n`;
        }
        return tricks.length > 0 ? output + "```" : '';
    });
}
/**
 *
 * @param page
 * @returns
 */
function createButtons(page, game) {
    return __awaiter(this, void 0, void 0, function* () {
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
                        "disabled": page === (yield game.getTricksPages())
                    }
                ]
            }
        ];
    });
}
function executeCommand(interaction, game) {
    return __awaiter(this, void 0, void 0, function* () {
        yield interaction.reply({
            embeds: [
                {
                    "title": "Tricks",
                    "description": yield formatTricks(1, game),
                    "footer": {
                        "text": `1/${yield game.getTricksPages()}`
                    }
                }
            ],
            components: yield createButtons(1, game),
            ephemeral: true
        }).catch(console.error);
    });
}
function executeButton(interaction, game) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        var currentPage = parseInt((_c = (_b = (_a = interaction.message.embeds[0]) === null || _a === void 0 ? void 0 : _a.footer) === null || _b === void 0 ? void 0 : _b.text.replace(/^(\d+)(.+)$/i, '$1')) !== null && _c !== void 0 ? _c : '1');
        if (currentPage <= 0 || currentPage > (yield game.getTricksPages())) {
            yield interaction.reply({
                content: 'Error: Unable to change page',
                ephemeral: true
            }).catch(console.error);
        }
        else if (interaction.customId === "tricks_prev") {
            yield interaction.update({
                embeds: [
                    {
                        "title": "Tricks",
                        "description": yield formatTricks(currentPage - 1, game),
                        "footer": {
                            "text": `${currentPage - 1}/${yield game.getTricksPages()}`
                        }
                    }
                ],
                components: yield createButtons(currentPage - 1, game)
            }).catch(console.error);
        }
        else if (interaction.customId === "tricks_next") {
            yield interaction.update({
                embeds: [
                    {
                        "title": "Tricks",
                        "description": yield formatTricks(currentPage + 1, game),
                        "footer": {
                            "text": `${currentPage + 1}/${yield game.getTricksPages()}`
                        }
                    }
                ],
                components: yield createButtons(currentPage + 1, game)
            }).catch(console.error);
        }
        else {
            yield interaction.reply({
                content: 'Error: Unknown interaction',
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
    data: new discord_js_1.SlashCommandBuilder()
        .setName('tricks')
        .setDescription('Displays a list of tricks that have been done'),
    /**
     *
     * @param interaction
     */
    execute(interaction, game) {
        return __awaiter(this, void 0, void 0, function* () {
            if (interaction.isChatInputCommand()) {
                yield executeCommand(interaction, game);
            }
            else if (interaction.isButton()) {
                yield executeButton(interaction, game);
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
    buttonIds: ["tricks_prev", "tricks_next"],
};
module.exports = command;
