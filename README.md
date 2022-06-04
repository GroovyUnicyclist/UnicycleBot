# UnicycleBot
## First Time Setup
1. Create a postgres database
   - Set up the schema to be right (might add instructions on this later)
3. Copy .env-example and rename it to .env
4. Fill in the fields of .env
5. Ensure you have the latest version of node.js installed
6. Run `npm install`
7. Run `npx prisma generate`
8. Run `npx tsc`
9. Run `node out/commands.js` to update the slash commands

## Running The Bot
### Option 1:
Run `node out/bot.js`
### Option 2: pm2
1. Run `pm2 start out/bot.js --name UnicycleBot --watch --log ~/logs/UnicycleBot`
2. Save the process list with `pm2 save`

## Updating The Bot
1. Run `git pull`
2. Run `tnpx sc`
3. Run `node out/commands.js` to update the slash commands if necessary
4. Run the bot as desctibed above if using option 1
