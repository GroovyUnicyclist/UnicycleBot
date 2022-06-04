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
exports.Game = void 0;
const client_1 = require("@prisma/client");
const PAGE_SIZE = 10;
class Game {
    constructor(prisma = new client_1.PrismaClient()) {
        this.prisma = prisma;
    }
    // Leaderboard (All Players)
    getLeaderboard() {
        return __awaiter(this, void 0, void 0, function* () {
            const allPlayers = yield this.prisma.player.findMany();
            return allPlayers.sort((a, b) => (a.score < b.score ? 1 : -1));
        });
    }
    getLeaderboardPages() {
        return __awaiter(this, void 0, void 0, function* () {
            const playerCount = yield this.prisma.player.count();
            return playerCount > 0 ? Math.ceil(playerCount / PAGE_SIZE) : 1;
        });
    }
    updateAllPlayers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var operations = [];
                const players = yield this.prisma.player.findMany();
                for (const player of players) {
                    operations.push(...yield this.getPlayerUpdateQueries(player.id));
                }
                yield this.prisma.$transaction(operations);
                return true;
            }
            catch (error) {
                console.error(error);
                return false;
            }
        });
    }
    // Singular Player
    getPlayer(playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.player.findUnique({
                where: { id: playerId }
            });
        });
    }
    getPlayerScore(playerId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield this.prisma.player.findUnique({
                where: { id: playerId }
            });
            return (_a = player === null || player === void 0 ? void 0 : player.score) !== null && _a !== void 0 ? _a : BigInt(-1);
        });
    }
    getPlayerTricks(playerId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield this.getPlayer(playerId);
            return (_a = player === null || player === void 0 ? void 0 : player.tricks) !== null && _a !== void 0 ? _a : [];
        });
    }
    getPlayerTricksPages(playerTricks) {
        return __awaiter(this, void 0, void 0, function* () {
            const playerTricksCount = playerTricks.length;
            return playerTricksCount > 0 ? Math.ceil(playerTricksCount / PAGE_SIZE) : 1;
        });
    }
    getPlayerUpdateQueries(playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const player = yield this.prisma.player.findUnique({
                    where: { id: playerId }
                });
                if (player) {
                    var score = BigInt(0);
                    var playerTrickStrings = [];
                    var newPlayerTricks = { data: [] };
                    const playerTricks = yield this.prisma.player_trick.findMany({
                        where: { player_id: playerId }
                    });
                    const tricks = yield this.getAllTricks();
                    for (const trick of tricks) {
                        if (trick.players.includes(player.id)) {
                            playerTrickStrings.push(trick.name);
                            score += trick.score;
                            const playerTrick = playerTricks.find(e => e.trick_name === trick.name);
                            if (!playerTrick) {
                                newPlayerTricks.data.push({
                                    player_id: player.id,
                                    trick_name: trick.name
                                });
                            }
                        }
                    }
                    ;
                    return [
                        this.prisma.player.update({
                            where: { id: player.id },
                            data: { score: score, tricks: playerTrickStrings }
                        }),
                        this.prisma.player_trick.createMany(newPlayerTricks)
                    ];
                }
                return [];
            }
            catch (error) {
                console.error(error);
                return [];
            }
        });
    }
    // All Tricks
    getAllTricks() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.trick.findMany();
        });
    }
    getAllTricksAlphabetical() {
        return __awaiter(this, void 0, void 0, function* () {
            const allTricks = yield this.prisma.trick.findMany();
            return allTricks.sort((a, b) => (a.name > b.name ? 1 : -1));
        });
    }
    getTricksPages() {
        return __awaiter(this, void 0, void 0, function* () {
            const trickCount = yield this.prisma.trick.count();
            return trickCount > 0 ? Math.ceil(trickCount / PAGE_SIZE) : 1;
        });
    }
    updateAllTrickScores() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var operations = [];
                const tricks = yield this.prisma.trick.findMany();
                for (const trick of tricks) {
                    operations.push(...yield this.getTrickScoreUpdateQueries(trick.name));
                }
                yield this.prisma.$transaction(operations);
                return true;
            }
            catch (error) {
                console.error(error);
                return false;
            }
        });
    }
    // Singular Tricks
    getTrick(trickName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.trick.findUnique({
                where: { name: trickName }
            });
        });
    }
    getTrickExampleVideo(trickName) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const trick = yield this.prisma.trick.findUnique({
                where: { name: trickName }
            });
            return (_a = trick === null || trick === void 0 ? void 0 : trick.example_video) !== null && _a !== void 0 ? _a : '';
        });
    }
    getTrickExampleLink(trickName) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const trick = yield this.prisma.trick.findUnique({
                where: { name: trickName }
            });
            return (_a = trick === null || trick === void 0 ? void 0 : trick.example_link) !== null && _a !== void 0 ? _a : '';
        });
    }
    getTrickExamplePlayer(trickName) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const trick = yield this.prisma.trick.findUnique({
                where: { name: trickName }
            });
            return (_a = trick === null || trick === void 0 ? void 0 : trick.example_player) !== null && _a !== void 0 ? _a : null;
        });
    }
    getTrickTutorial(trickName) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const trick = yield this.prisma.trick.findUnique({
                where: { name: trickName }
            });
            return (_a = trick === null || trick === void 0 ? void 0 : trick.tutorial) !== null && _a !== void 0 ? _a : '';
        });
    }
    getTrickScore(trickName) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const trick = yield this.prisma.trick.findUnique({
                where: { name: trickName }
            });
            return (_a = trick === null || trick === void 0 ? void 0 : trick.score) !== null && _a !== void 0 ? _a : BigInt(-1);
        });
    }
    getTrickPlayersPages(trick) {
        return __awaiter(this, void 0, void 0, function* () {
            const playerCount = trick.players.length;
            return playerCount ? Math.ceil(playerCount / PAGE_SIZE) : 1;
        });
    }
    getTrickScoreUpdateQueries(trickName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const trick = yield this.prisma.trick.findUnique({
                    where: { name: trickName }
                });
                if (trick) {
                    const score = this.calculateScore(trick.players);
                    return trick.score != score ? [this.prisma.trick.update({
                            where: { name: trick.name },
                            data: { score: score }
                        })] : [];
                }
                return [];
            }
            catch (error) {
                console.error(error);
                return [];
            }
        });
    }
    // Player_Trick
    getAllPlayerTrickRelationships() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.player_trick.findMany();
        });
    }
    // Utilities
    calculateScore(players) {
        var score = BigInt(11) - BigInt(players.length);
        if (score < 1)
            score = BigInt(1);
        return score;
    }
    getTrickAutocompleteOptions(query, includeQuery = false) {
        return __awaiter(this, void 0, void 0, function* () {
            var options = [];
            const tricks = yield this.getAllTricksAlphabetical();
            tricks.forEach(trick => {
                if (trick.name.indexOf(query.toLowerCase()) >= 0 && !(trick.name === query && includeQuery)) {
                    options.push({
                        name: trick.name,
                        value: trick.name,
                    });
                }
            });
            return includeQuery ? [...options, { name: query, value: query.toLowerCase() }] : options;
        });
    }
    hasTrick(trickName) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getTrick(trickName)) != null;
        });
    }
    syncData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.updateAllTrickScores();
                yield this.updateAllPlayers();
                return true;
            }
            catch (error) {
                console.error(error);
                return false;
            }
        });
    }
    // Pagination
    getPaginatedData(page = 1, type, option = null) {
        return __awaiter(this, void 0, void 0, function* () {
            var pageLimit = -1;
            var dataset = [];
            switch (type) {
                case 'leaderboard':
                    pageLimit = yield this.getLeaderboardPages();
                    dataset = yield this.getLeaderboard();
                    break;
                case 'tricks':
                    pageLimit = yield this.getTricksPages();
                    dataset = yield this.getAllTricksAlphabetical();
                    break;
                case 'trick':
                    if (typeof (option) === 'string') {
                        const trick = yield this.getTrick(option);
                        pageLimit = trick ? yield this.getTrickPlayersPages(trick) : 0;
                        dataset = trick && pageLimit > 0 ? trick.players : [];
                    }
                    break;
                case 'playerTricks':
                    if (typeof (option) === 'string') {
                        const playerTricks = yield this.getPlayerTricks(BigInt(option));
                        pageLimit = yield this.getPlayerTricksPages(playerTricks);
                        pageLimit > 0 ? dataset = playerTricks : [];
                    }
            }
            if (page > 0 && page <= pageLimit) {
                var start = (page - 1) * PAGE_SIZE;
                var end = page * PAGE_SIZE;
                if (page === pageLimit) {
                    end = dataset.length;
                }
                return dataset.slice(start, end);
            }
            return [];
        });
    }
    getPaginatedLeaderboard(page = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getPaginatedData(page, 'leaderboard');
        });
    }
    getPaginatedTricks(page = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getPaginatedData(page, 'tricks');
        });
    }
    getPaginatedPlayerTricks(playerId, page = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getPaginatedData(page, 'playerTricks', playerId);
        });
    }
    getPaginatedTrickLanders(trickName, page = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getPaginatedData(page, 'trick', trickName);
        });
    }
    // Core Queries
    addTrickRecipient(trickName, playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const trick = yield this.getTrick(trickName);
                const players = trick ? [...trick.players, BigInt(playerId)] : [BigInt(playerId)];
                const score = trick ? this.calculateScore(players) : BigInt(10);
                const updatedTrick = yield this.prisma.trick.upsert({
                    where: { name: trickName },
                    update: {
                        score: score,
                        players: players
                    },
                    create: {
                        name: trickName,
                        players: players
                    }
                });
                var operations = [];
                for (const playerToUpdate of updatedTrick.players) {
                    const player = yield this.getPlayer(playerToUpdate);
                    const tricks = player ? [...player.tricks, updatedTrick.name] : [updatedTrick.name];
                    operations.push(this.prisma.player.upsert({
                        where: { id: playerToUpdate },
                        update: {
                            score: score,
                            tricks: tricks
                        },
                        create: {
                            id: playerToUpdate,
                            score: score,
                            tricks: tricks
                        }
                    }));
                }
                operations.push(this.prisma.player_trick.create({
                    data: {
                        player_id: BigInt(playerId),
                        trick_name: updatedTrick.name
                    }
                }));
                yield this.prisma.$transaction(operations);
                return true;
            }
            catch (error) {
                console.error(error);
                return false;
            }
        });
    }
    removeTrickRecipient(trickName, playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const player = yield this.prisma.player.findUnique({
                    where: { id: BigInt(playerId) }
                });
                const trick = yield this.prisma.trick.findUnique({
                    where: { name: trickName }
                });
                if (player && trick) {
                    const beforeScore = trick.score;
                    const afterScore = this.calculateScore(trick.players.splice(trick.players.indexOf(BigInt(playerId)), 1));
                    var operations = [];
                    operations.push(this.prisma.player.update({
                        where: { id: BigInt(playerId) },
                        data: {
                            score: player.score - beforeScore,
                            tricks: player.tricks.splice(player.tricks.indexOf(trickName), 1)
                        }
                    }));
                    operations.push(this.prisma.trick.update({
                        where: { name: trickName },
                        data: {
                            score: afterScore,
                            players: trick.players.splice(trick.players.indexOf(BigInt(playerId)), 1)
                        }
                    }));
                    for (const player of trick.players) {
                        const otherPlayer = yield this.getPlayer(player);
                        if (otherPlayer) {
                            operations.push(this.prisma.player.update({
                                where: { id: player },
                                data: { score: otherPlayer.score - beforeScore + afterScore }
                            }));
                        }
                    }
                    operations.push(this.prisma.player_trick.deleteMany({
                        where: {
                            player_id: BigInt(playerId),
                            trick_name: trickName
                        }
                    }));
                    yield this.prisma.$transaction(operations);
                    return true;
                }
                return false;
            }
            catch (error) {
                console.error(error);
                return false;
            }
        });
    }
    removeTrick(trickName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var operations = [];
                const trick = yield this.prisma.trick.findUnique({
                    where: { name: trickName }
                });
                if (trick) {
                    for (const player of trick.players) {
                        const otherPlayer = yield this.getPlayer(player);
                        if (otherPlayer) {
                            operations.push(this.prisma.player.update({
                                where: { id: player },
                                data: {
                                    score: otherPlayer.score - trick.score,
                                    tricks: otherPlayer.tricks.splice(otherPlayer.tricks.indexOf(trick.name), 1)
                                }
                            }));
                        }
                    }
                    operations.push(this.prisma.player_trick.deleteMany({
                        where: { trick_name: trick.name }
                    }));
                    operations.push(this.prisma.trick.delete({
                        where: { name: trick.name }
                    }));
                    this.prisma.$transaction(operations);
                    return true;
                }
                return false;
            }
            catch (error) {
                console.error(error);
                return false;
            }
        });
    }
    mergeTricks(trickName, trickToBeMergedName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const trick = yield this.prisma.trick.findUnique({
                    where: { name: trickName }
                });
                const trickToBeMerged = yield this.prisma.trick.findUnique({
                    where: { name: trickToBeMergedName }
                });
                if (trick && trickToBeMerged) {
                    const score = this.calculateScore([...trick.players, ...trickToBeMerged.players]);
                    var operations = [];
                    for (const player of trick.players) {
                        const otherPlayer = yield this.getPlayer(player);
                        if (otherPlayer) {
                            operations.push(this.prisma.player.update({
                                where: { id: player },
                                data: { score: otherPlayer.score - trick.score + score }
                            }));
                        }
                    }
                    for (const player of trickToBeMerged.players) {
                        const otherPlayer = yield this.getPlayer(player);
                        if (otherPlayer) {
                            operations.push(this.prisma.player.update({
                                where: { id: player },
                                data: {
                                    score: otherPlayer.score - trickToBeMerged.score + score,
                                    tricks: otherPlayer.tricks.splice(otherPlayer.tricks.indexOf(trickToBeMerged.name), 1)
                                }
                            }));
                        }
                    }
                    operations.push(this.prisma.player_trick.deleteMany({
                        where: { trick_name: trickToBeMerged.name }
                    }));
                    operations.push(this.prisma.trick.delete({
                        where: { name: trickToBeMerged.name }
                    }));
                    yield this.prisma.$transaction(operations);
                    return true;
                }
                return false;
            }
            catch (error) {
                console.error(error);
                return false;
            }
        });
    }
}
exports.Game = Game;
