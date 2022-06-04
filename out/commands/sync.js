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
function executeCommand(interaction, game) {
    return __awaiter(this, void 0, void 0, function* () {
        game.syncData();
        yield interaction.reply({
            content: 'Game data synced!',
            ephemeral: true
        }).catch(console.error);
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
        .setName('sync')
        .setDescription('Recalculates player scores'),
    /**
     *
     * @param interaction
     */
    execute(interaction, game) {
        return __awaiter(this, void 0, void 0, function* () {
            if (interaction.isChatInputCommand()) {
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
