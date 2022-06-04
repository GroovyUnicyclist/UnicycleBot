import { ContextMenuCommandBuilder, Interaction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import { Game } from "./game";

declare interface Command {
    data: SlashCommandBuilder | ContextMenuCommandBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">,
    execute: (interaction: Interaction, game: Game)=>Promise<void>,
    buttonIds: string[]
}

export { Command }