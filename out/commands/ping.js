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
 */
const command = {
    /**
     *
     */
    data: new discord_js_1.SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!!!'),
    /**
     *
     * @param interaction
     */
    execute(interaction, game) {
        return __awaiter(this, void 0, void 0, function* () {
            if (interaction.isChatInputCommand()) {
                yield interaction.reply('Pong!').catch(console.error);
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
