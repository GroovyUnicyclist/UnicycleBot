import * as fs from 'fs';
import { REST } from "@discordjs/rest";
import { Routes } from 'discord-api-types/v9';
import * as dotenv from 'dotenv';
dotenv.config();

const commands: any[] = [];
const commandFiles = fs.readdirSync('./out/commands/').filter(file => file.endsWith('.js'));
// console.log(commandFiles)

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}
console.log(commands)

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
