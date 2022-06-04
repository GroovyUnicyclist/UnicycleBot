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
function executeAddCommand(interaction, game) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const trick = interaction.options.getString('trick_name');
        const player = (_a = interaction.options.getUser('player')) === null || _a === void 0 ? void 0 : _a.id;
        if (trick && player) {
            yield game.addTrickRecipient(trick, player);
            const score = yield game.getTrickScore(trick);
            yield interaction.reply({
                content: `Awarded \`${score}\` points to <@${player}> for the following trick: \`${trick}\``
            }).catch(console.error);
        }
    });
}
function executeRemoveCommand(interaction, game) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const trick = interaction.options.getString('trick_name');
        const player = (_a = interaction.options.getUser('player')) === null || _a === void 0 ? void 0 : _a.id;
        if (trick && player) {
            const score = yield game.getTrickScore(trick);
            yield game.removeTrickRecipient(trick, player);
            yield interaction.reply({
                content: `Revoked \`${score}\` points from <@${player}> for the following trick: \`${trick}\``
            }).catch(console.error);
        }
    });
}
function executeMergeCommand(interaction, game) {
    return __awaiter(this, void 0, void 0, function* () {
        const trick = interaction.options.getString('trick');
        const trickToBeMerged = interaction.options.getString('trick_to_be_merged');
        if (trick && trickToBeMerged) {
            yield game.mergeTricks(trick, trickToBeMerged);
            yield interaction.reply({
                content: `Merged \`${trickToBeMerged}\` data into \`${trick}\``
            }).catch(console.error);
        }
    });
}
function executeAutocomplete(interaction, game) {
    return __awaiter(this, void 0, void 0, function* () {
        const trick = interaction.options.getString('trick_name');
        if (trick) {
            yield interaction.respond(yield game.getTrickAutocompleteOptions(trick, interaction.options.getSubcommand(true) === 'add')).catch(console.error);
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
        .setName('edit')
        .setDescription('Edit trick records')
        .addSubcommand(subcommand => subcommand
        .setName('add')
        .setDescription('Add a trick from a player\'s records')
        .addUserOption(option => option.setName('player').setDescription('The player').setRequired(true))
        .addStringOption(option => option.setName('trick_name').setDescription('The trick').setRequired(true).setAutocomplete(true)))
        .addSubcommand(subcommand => subcommand
        .setName('remove')
        .setDescription('Remove a trick from a player\'s records')
        .addUserOption(option => option.setName('player').setDescription('The player').setRequired(true))
        .addStringOption(option => option.setName('trick_name').setDescription('The trick').setRequired(true).setAutocomplete(true)))
        .addSubcommand(subcommand => subcommand
        .setName('merge')
        .setDescription('Merge two existing tricks')
        .addStringOption(option => option.setName('trick').setDescription('The trick whose name will be used').setRequired(true).setAutocomplete(true))
        .addStringOption(option => option.setName('trick_to_be_merged').setDescription('The trick to be merged').setRequired(true).setAutocomplete(true))),
    /**
     *
     * @param interaction
     */
    execute(interaction, game) {
        return __awaiter(this, void 0, void 0, function* () {
            if (interaction.isChatInputCommand()) {
                switch (interaction.options.getSubcommand(true)) {
                    case 'add':
                        yield executeAddCommand(interaction, game);
                        break;
                    case 'remove':
                        yield executeRemoveCommand(interaction, game);
                        break;
                    case 'merge':
                        yield executeMergeCommand(interaction, game);
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
