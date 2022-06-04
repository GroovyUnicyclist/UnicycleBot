"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const fs = __importStar(require("fs"));
const discord_js_1 = require("discord.js");
const game_1 = require("./game");
class CommandClient extends discord_js_1.Client {
}
const client = new CommandClient({ intents: [1 /* Guilds */] });
client.commands = new discord_js_1.Collection();
client.buttonIds = {};
client.game = new game_1.Game();
const commandFiles = fs.readdirSync('./out/commands').filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    client.commands.set(command.data.name, command);
    command.buttonIds.forEach((id) => client.buttonIds[id] = command.data.name);
}
if (client != null) {
    client.on('ready', () => {
        console.log(`Logged in as ${client.user ? client.user.tag : ''}!`);
    });
    client.on('interactionCreate', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            var command;
            if (interaction.isChatInputCommand() || interaction.isContextMenuCommand() || interaction.isAutocomplete()) {
                command = client.commands.get(interaction.commandName);
            }
            else if (interaction.isButton() || interaction.isModalSubmit()) {
                command = client.commands.get(client.buttonIds[interaction.customId]);
            }
            else {
                return;
            }
            if (!command)
                return;
            yield command.execute(interaction, client.game);
        }
        catch (error) {
            console.error(error);
            if (interaction.isRepliable()) {
                yield interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true }).catch(console.error);
            }
        }
    }));
    client.login(process.env.TOKEN);
}
