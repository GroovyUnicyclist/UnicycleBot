import { ApplicationCommandOptionChoiceData } from 'discord.js';
import { player, player_trick, PrismaClient, trick } from '@prisma/client'

const PAGE_SIZE = 10

export class Game {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient = new PrismaClient()) {
        this.prisma = prisma;
    }

    // Leaderboard (All Players)
    private async getLeaderboard(): Promise<player[]> {
        const allPlayers = await this.prisma.player.findMany();
        return allPlayers.sort((a, b) => (a.score < b.score ? 1 : -1));
    }
    
    public async getLeaderboardPages(): Promise<number> {
        const playerCount = await this.prisma.player.count()
        return playerCount > 0 ? Math.ceil(playerCount/PAGE_SIZE) : 1;
    }

    private async updateAllPlayers(): Promise<boolean> {
        try {
            let operations: any[] = [];
            const players = await this.prisma.player.findMany();
            for (const player of players) {
                operations.push(...await this.getPlayerUpdateQueries(player.id));
            }
            await this.prisma.$transaction(operations);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // Singular Player
    public async getPlayer(playerId: bigint): Promise<player | null> {
        return await this.prisma.player.findUnique({
            where: { id: playerId }
        });
    }

    public async getPlayerScore(playerId: bigint): Promise<bigint> {
        const player = await this.prisma.player.findUnique({
            where: { id: playerId }
        });
        return player?.score ?? BigInt(-1);
    }

    public async getPlayerTricks(playerId: bigint): Promise<string[]> {
        const player = await this.getPlayer(playerId);
        return player?.tricks ?? [];
    }

    public async getPlayerTricksPages(playerTricks: string[]): Promise<number> {
        const playerTricksCount = playerTricks.length;
        return playerTricksCount > 0 ? Math.ceil(playerTricksCount/PAGE_SIZE): 1;
    }

    private async getPlayerUpdateQueries(playerId: bigint): Promise<any[]> {
        try {
            const player = await this.prisma.player.findUnique({
                where: { id: playerId }
            });
            if (player) {
                let score: bigint = BigInt(0);
                let playerTrickStrings: string[] = [];
                let newPlayerTricks: {data: player_trick[]} = {data: []};
                const playerTricks = await this.prisma.player_trick.findMany({
                    where: { player_id: playerId }
                });
                const tricks = await this.getAllTricks();
                
                for (const trick of tricks) {
                    if (trick.players.includes(player.id)) {
                        playerTrickStrings.push(trick.name);
                        score += trick.score;
                        const playerTrick = playerTricks.find(e => e.trick_name === trick.name)
                        if (!playerTrick) {
                            newPlayerTricks.data.push({
                                player_id: player.id,
                                trick_name: trick.name
                            });
                        }
                    }
                };
                return [
                    this.prisma.player.update({
                        where: { id: player.id },
                        data: { score: score, tricks: playerTrickStrings }
                    }),
                    this.prisma.player_trick.createMany(newPlayerTricks)
                ];
            }
            return [];
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    // All Tricks
    private async getAllTricks(): Promise<trick[]> {
        return await this.prisma.trick.findMany();
    }

    private async getAllTricksAlphabetical(): Promise<trick[]> {
        const allTricks = await this.prisma.trick.findMany();
        return allTricks.sort((a, b) => (a.name > b.name ? 1 : -1));
    }

    public async getTricksPages(): Promise<number> {
        const trickCount = await this.prisma.trick.count()
        return trickCount > 0 ? Math.ceil(trickCount/PAGE_SIZE) : 1;
    }

    private async updateAllTrickScores(): Promise<boolean> {
        try {
            let operations:any[] = [];
            const tricks = await this.prisma.trick.findMany();
            for (const trick of tricks) {
                operations.push(...await this.getTrickScoreUpdateQueries(trick.name));
            }
            await this.prisma.$transaction(operations);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // Singular Tricks
    public async getTrick(trickName: string): Promise<trick | null> {
        return await this.prisma.trick.findUnique({
            where: { name: trickName }
        });
    }

    public async getTrickExampleVideo(trickName: string): Promise<string> {
        const trick = await this.prisma.trick.findUnique({
            where: { name: trickName }
        });
        return trick?.example_video ?? '';
    }

    public async getTrickExampleLink(trickName: string): Promise<string> {
        const trick = await this.prisma.trick.findUnique({
            where: { name: trickName }
        });
        return trick?.example_link ?? '';
    }

    public async getTrickExamplePlayer(trickName: string): Promise<bigint | null> {
        const trick = await this.prisma.trick.findUnique({
            where: { name: trickName }
        });
        return trick?.example_player ?? null;
    }

    public async getTrickTutorial(trickName: string): Promise<string> {
        const trick = await this.prisma.trick.findUnique({
            where: { name: trickName }
        });
        return trick?.tutorial ?? '';
    }

    public async getTrickScore(trickName: string): Promise<bigint> {
        const trick = await this.prisma.trick.findUnique({
            where: { name: trickName }
        });
        return trick?.score ?? BigInt(-1);
    }

    public async getTrickPlayersPages(trick: trick): Promise<number> {
        const playerCount = trick.players.length;
        return playerCount ? Math.ceil(playerCount/PAGE_SIZE) : 1;
    }

    private async getTrickScoreUpdateQueries(trickName: string): Promise<any[]> {
        try {
            const trick = await this.prisma.trick.findUnique({
                where: { name: trickName }
            })
            if (trick) {
                const score = this.calculateScore(trick.players);
                return trick.score != score ? [this.prisma.trick.update({
                    where: { name: trick.name },
                    data: { score: score }
                })] : [];
            }
            return [];
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    // Player_Trick
    private async getAllPlayerTrickRelationships(): Promise<player_trick[]> {
        return await this.prisma.player_trick.findMany();
    }

    // Utilities
    private calculateScore(players: bigint[]): bigint {
        let score = BigInt(11) - BigInt(players.length);
        if (score < 1) score = BigInt(1);
        return score;
    }

    public async getTrickAutocompleteOptions(query: string, includeQuery = false): Promise<ApplicationCommandOptionChoiceData[]> {
        let options: ApplicationCommandOptionChoiceData[] = [];
        const tricks = await this.getAllTricksAlphabetical();
        tricks.forEach(trick => {
            if (trick.name.indexOf(query.toLowerCase()) >= 0 && !(trick.name === query && includeQuery)) {
                options.push({
                    name: trick.name,
                    value: trick.name,
                })
            }
        });
        return includeQuery ? [...options, {name: query, value: query.toLowerCase()}] : options;
    }

    public async hasTrick(trickName: string): Promise<boolean> {
        return await this.getTrick(trickName) != null
    }

    public async syncData(): Promise<boolean> {
        try {
            await this.updateAllTrickScores();
            await this.updateAllPlayers();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // Pagination
    private async getPaginatedData(page: number = 1, type: 'leaderboard' | 'tricks' | 'playerTricks' | 'trick', option: string | null = null): Promise<any[]> {
        let pageLimit = -1
        let dataset: string[] | bigint[] | player[] | trick[] = []
        switch (type) {
            case 'leaderboard':
                pageLimit = await this.getLeaderboardPages();
                dataset = await this.getLeaderboard();
                break;
            case 'tricks':
                pageLimit = await this.getTricksPages()
                dataset = await this.getAllTricksAlphabetical()
                break;
            case 'trick':
                if (typeof(option) === 'string') {
                    const trick = await this.getTrick(option)
                    pageLimit = trick ? await this.getTrickPlayersPages(trick) : 0
                    dataset = trick && pageLimit > 0 ? trick.players : []
                }
                break;
            case 'playerTricks':
                if (typeof(option) === 'string') {
                    const playerTricks = await this.getPlayerTricks(BigInt(option))
                    pageLimit = await this.getPlayerTricksPages(playerTricks)
                    pageLimit > 0 ? dataset = playerTricks : []
                }
        }
        if (page > 0 && page <= pageLimit) {
            let start = (page - 1)*PAGE_SIZE;
            let end = page*PAGE_SIZE;
            if (page === pageLimit) {
                end = dataset.length;
            }
            return dataset.slice(start, end);
        }
        return []
    }

    public async getPaginatedLeaderboard(page: number = 1): Promise<player[]> {
        return await this.getPaginatedData(page, 'leaderboard');
    }
    
    public async getPaginatedTricks(page: number = 1): Promise<trick[]> {
        return await this.getPaginatedData(page, 'tricks');
    }
    
    public async getPaginatedPlayerTricks(playerId: string, page: number = 1): Promise<string[]> {
        return this.getPaginatedData(page, 'playerTricks', playerId);
    }

    public async getPaginatedTrickLanders(trickName: string, page: number = 1): Promise<bigint[]> {
        return this.getPaginatedData(page, 'trick', trickName);
    }

    // Core Queries
    public async addTrickRecipient(trickName: string, playerId: string): Promise<boolean> {
        try {
            const playerTrick = await this.prisma.player_trick.findUnique({
                where: { player_id_trick_name: { player_id: BigInt(playerId), trick_name: trickName }}
            });
            if (!playerTrick) {
                const trick = await this.getTrick(trickName);
                const oldScore = trick ? trick.score : BigInt(10);
                const players = trick ? [...trick.players, BigInt(playerId)] : [BigInt(playerId)];
                const newScore = trick ? this.calculateScore(players) : BigInt(10);
                const updatedTrick = await this.prisma.trick.upsert({
                    where: { name: trickName },
                    update: {
                        score: newScore,
                        players: players
                    },
                    create: {
                        name: trickName,
                        players: players
                    }
                });
                let operations: any[] = [];
                for (const playerToUpdate of updatedTrick.players) {
                    const player = await this.getPlayer(playerToUpdate);
                    const tricks = player ? [...player.tricks, updatedTrick.name] : [updatedTrick.name];
                    const playerScore = player ? player.score : BigInt(0);
                    const score = player && player.tricks.includes(updatedTrick.name) ? playerScore - oldScore + newScore : playerScore + newScore;
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
                await this.prisma.$transaction(operations);
                return true;
            }
            return false;
        } catch(error) {
            console.error(error);
            return false;
        }
    }

    public async removeTrickRecipient(trickName: string, playerId: string): Promise<boolean> {
        try {
            const player = await this.prisma.player.findUnique({
                where: { id: BigInt(playerId) }
            });
            const trick = await this.prisma.trick.findUnique({
                where: { name: trickName }
            });
            if (player && trick) {
                const beforeScore = trick.score
                const afterScore = this.calculateScore(trick.players.splice(trick.players.indexOf(BigInt(playerId)), 1))
                let operations: any[] = [];
                operations.push(this.prisma.player_trick.deleteMany({
                    where: {
                        player_id: BigInt(playerId),
                        trick_name: trickName
                    }
                }));
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
                    const otherPlayer = await this.getPlayer(player);
                    if (otherPlayer) {
                        operations.push(this.prisma.player.update({
                            where: { id: player },
                            data: { score: otherPlayer.score - beforeScore + afterScore }
                        }));
                    }
                }
                await this.prisma.$transaction(operations)
                return true;
            }
            return false;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
    
    public async removeTrick(trickName: string): Promise<boolean> {
        try {
            let operations: any[] = [];
            const trick = await this.prisma.trick.findUnique({
                where: { name: trickName }
            });
            if (trick) {
                for (const player of trick.players) {
                    const otherPlayer = await this.getPlayer(player);
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
        } catch (error) {
            console.error(error);
            return false;
        }
    }
    
    public async mergeTricks(trickName: string, trickToBeMergedName: string): Promise<boolean> {
        try {
            const trick = await this.prisma.trick.findUnique({
                where: { name: trickName }
            });
            const trickToBeMerged = await this.prisma.trick.findUnique({
                where: { name: trickToBeMergedName }
            });
            if (trick && trickToBeMerged) {
                const score = this.calculateScore([...trick.players, ...trickToBeMerged.players])
                let operations: any[] = [];
                for (const player of trick.players) {
                    const otherPlayer = await this.getPlayer(player);
                    if (otherPlayer) {
                        operations.push(this.prisma.player.update({
                            where: { id: player },
                            data: { score: otherPlayer.score - trick.score + score }
                        }));
                    }
                }
                for (const player of trickToBeMerged.players) {
                    const otherPlayer = await this.getPlayer(player);
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
                await this.prisma.$transaction(operations);
                return true;
            }
            return false;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    public async renameTrick(trickName: string, newTrickName: string): Promise<boolean> {
        try {
            const trick = await this.getTrick(trickName);
            if (trick) {
                const playerTricks = await this.prisma.player_trick.findMany({
                    where: { trick_name: trickName }
                });
                let players: bigint[] = [];
                let operations: any[] = [
                    this.prisma.trick.create({
                        data: {
                            name: newTrickName,
                            example_video: trick.example_video,
                            example_link: trick.example_link,
                            example_player: trick.example_player,
                            tutorial: trick.tutorial,
                            score: trick.score,
                            players: trick.players,
                        }
                    }),
                    this.prisma.trick.delete({ where: { name: trickName }})
                ];
                for (const playerTrick of playerTricks) {
                    if (!players.includes(playerTrick.player_id)) {
                        const player = await this.getPlayer(playerTrick.player_id);
                        if (player) {
                            const trickIndex = player.tricks.indexOf(trickName);
                            if (trickIndex >= 0) {
                                operations.push(this.prisma.player.update({
                                    where: { id: playerTrick.player_id },
                                    data: { tricks: player.tricks.splice(trickIndex, 1, newTrickName) }
                                }));
                            }
                        }
                    }
                }
                operations.push(this.prisma.player_trick.updateMany({
                    where: { trick_name: trickName },
                    data: { trick_name: newTrickName }
                }));
                this.prisma.$transaction(operations);
                return true;
            }
            return false;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}
