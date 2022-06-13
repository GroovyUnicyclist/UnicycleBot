
import { player, player_trick, Prisma, PrismaClient, trick } from '@prisma/client'
import * as untypedData from './data.json';
import { Game } from './game';

interface GameData {
    players: {[key: string]: {score: number, tricks: string[]}},
    tricks: {[key: string]: {example: string, exampleId: string, tutorial: string, score: number, recipients: string[]}}
}

const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } }
})
const game = new Game(prisma)

async function resetData() {
    await prisma.$transaction([
        prisma.player_trick.deleteMany({}),
        prisma.trick.deleteMany({}),
        prisma.player.deleteMany({})
    ])

    let data: GameData = untypedData ?? {"players": {}, "tricks": {}};
    let tricks = Object.keys(data.tricks)
    let players = Object.keys(data.players)
    let trickQuery: {data: trick[]} = {data: []}
    let playerQuery: {data: player[]} = {data: []}
    let playerTrickQuery: {data: player_trick[]} = {data: []}
    players.forEach(player => {
        playerQuery.data.push({
            id: BigInt(player),
            score: BigInt(data.players[player]!.score),
            tricks: data.players[player]!.tricks
        })
    })
    tricks.forEach(trick => {
        trickQuery.data.push({
            name: trick,
            example_video: null,
            example_link: null,
            example_player: null,
            tutorial: null,
            score: BigInt(data.tricks[trick]!.score),
            players: data.tricks[trick]!.recipients.map(recipient => {
                playerTrickQuery.data.push({
                    player_id: BigInt(recipient),
                    trick_name: trick
                })
                return BigInt(recipient)
            })
        })
    })
    await prisma.$transaction([
        prisma.trick.createMany(trickQuery),
        prisma.player.createMany(playerQuery),
        prisma.player_trick.createMany(playerTrickQuery)
    ])

    // const allPlayers = await prisma.player.findMany()
    // console.log(allPlayers)
    // const allTricks = await prisma.trick.findMany()
    // console.log(allTricks)
    // const allPlayerTricks = await prisma.player_trick.findMany()
    // console.log(allPlayerTricks)
}

async function main() {
    // const allPlayers = await prisma.player.findMany()
    // let leaderboard = allPlayers.sort((a, b) => (a.score < b.score ? 1 : -1));
    // const allTricks = await prisma.trick.findMany()
    // let tricks = allTricks.sort((a, b) => (a.name > b.name ? 1 : -1))
    // console.log(leaderboard)
    // console.log(tricks)
    // game.addTrickRecipient('180 unispin', '12345')
    resetData()
}

main()
    .catch((e) => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })