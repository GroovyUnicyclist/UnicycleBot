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
const client_1 = require("@prisma/client");
const untypedData = __importStar(require("./data.json"));
const game_1 = require("./game");
const prisma = new client_1.PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } }
});
const game = new game_1.Game(prisma);
function resetData() {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma.$transaction([
            prisma.trick.deleteMany({}),
            prisma.player.deleteMany({}),
            prisma.player_trick.deleteMany({})
        ]);
        var data = untypedData !== null && untypedData !== void 0 ? untypedData : { "players": {}, "tricks": {} };
        var tricks = Object.keys(data.tricks);
        var players = Object.keys(data.players);
        var trickQuery = { data: [] };
        var playerQuery = { data: [] };
        var playerTrickQuery = { data: [] };
        players.forEach(player => {
            playerQuery.data.push({
                id: BigInt(player),
                score: BigInt(data.players[player].score),
                tricks: data.players[player].tricks
            });
        });
        tricks.forEach(trick => {
            trickQuery.data.push({
                name: trick,
                example_video: null,
                example_link: null,
                example_player: null,
                tutorial: null,
                score: BigInt(data.tricks[trick].score),
                players: data.tricks[trick].recipients.map(recipient => {
                    playerTrickQuery.data.push({
                        player_id: BigInt(recipient),
                        trick_name: trick
                    });
                    return BigInt(recipient);
                })
            });
        });
        yield prisma.$transaction([
            prisma.trick.createMany(trickQuery),
            prisma.player.createMany(playerQuery),
            prisma.player_trick.createMany(playerTrickQuery)
        ]);
        // const allPlayers = await prisma.player.findMany()
        // console.log(allPlayers)
        // const allTricks = await prisma.trick.findMany()
        // console.log(allTricks)
        // const allPlayerTricks = await prisma.player_trick.findMany()
        // console.log(allPlayerTricks)
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // const allPlayers = await prisma.player.findMany()
        // var leaderboard = allPlayers.sort((a, b) => (a.score < b.score ? 1 : -1));
        // const allTricks = await prisma.trick.findMany()
        // var tricks = allTricks.sort((a, b) => (a.name > b.name ? 1 : -1))
        // console.log(leaderboard)
        // console.log(tricks)
        // game.addTrickRecipient('180 unispin', '12345')
        resetData();
    });
}
main()
    .catch((e) => {
    throw e;
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
