import * as dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import { Client, Collection } from 'discord.js';
import { GatewayIntentBits } from 'discord-api-types';
import { Game } from './game'

class CommandClient extends Client {
    commands!: Collection<string, any>;
    buttonIds!: { [key: string]: string };
    game!: Game;
}

const client = new CommandClient({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
client.buttonIds = {};
client.game = new Game()
const commandFiles = fs.readdirSync('./out/commands').filter((file: string) => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    client.commands.set(command.data.name, command);
    command.buttonIds.forEach((id: string) => client.buttonIds[id] = command.data.name)
}

if (client != null) {
    client.on('ready', () => {
        console.log(`Logged in as ${client.user ? client.user.tag : ''}!`);
    });

    client.on('interactionCreate', async (interaction) => {
        try {
            let command;
            if (interaction.isChatInputCommand() || interaction.isContextMenuCommand() || interaction.isAutocomplete()) {
                command = client.commands.get(interaction.commandName);
            } else if (interaction.isButton() || interaction.isModalSubmit()) {
                command = client.commands.get(client.buttonIds[interaction.customId]!);
            } else {
                return;
            }
            
            if (!command) return;
            await command.execute(interaction, client.game);

        } catch (error) {
            console.error(error);
            if (interaction.isRepliable()) {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true }).catch(console.error);
            }
        }

    });

    client.login(process.env.TOKEN);
}