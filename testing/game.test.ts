import { player, player_trick, PrismaClient, trick } from '@prisma/client'
import * as untypedData from './testData.json';
import { Game } from '../game';

const prisma = new PrismaClient({
    datasources: { db: { url: process.env.TEST_DATABASE_URL } }
})
const game = new Game(prisma)

interface GameData {
    players: {[key: string]: {score: number, tricks: string[]}},
    tricks: {[key: string]: {example: string, exampleId: string, tutorial: string, score: number, recipients: string[]}}
}

async function eraseData() {
    await prisma.$transaction([
        prisma.player_trick.deleteMany({}),
        prisma.trick.deleteMany({}),
        prisma.player.deleteMany({})
    ])
}

async function resetData() {
    await eraseData()

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
}

// async function main() {
//     await resetData()
//     const allPlayers = await prisma.player.findMany()
//     let leaderboard = allPlayers.sort((a, b) => (a.score < b.score ? 1 : -1));
//     const allTricks = await prisma.trick.findMany()
//     let tricks = allTricks.sort((a, b) => (a.name > b.name ? 1 : -1))
//     console.log(leaderboard)
//     console.log(tricks)
// }



afterAll(async () => await prisma.$disconnect())

describe('empty database tests', () => {
    beforeAll(() =>eraseData().catch((e) => { throw e }));

    // Leaderboard (All Players)
    test('getLeaderboardPages for empty player table', async () => {
        const result = await game.getLeaderboardPages();
        expect(result).toBe(1);
    });
    
    // Singular Player
    test('getPlayer for invalid player for empty player table', async () => {
        const result = await game.getPlayer(BigInt(12345));
        expect(result).toBeNull();
    });

    test('getPlayerScore for invalid player for empty player table', async () => {
        const result = await game.getPlayerScore(BigInt(12345));
        expect(result).toBe(BigInt(-1));
    });

    test('getPlayerTricks for invalid player for empty player table', async () => {
        const result = await game.getPlayerTricks(BigInt(12345));
        expect(result).toEqual([]);
    });

    test('getPlayerTricksPages for empty array for empty player and trick tables', async () => {
        const result = await game.getPlayerTricksPages([]);
        expect(result).toBe(1);
    });
    
    // All Tricks
    test('getTricksPages for empty trick table', async () => {
        const result = await game.getTricksPages();
        expect(result).toBe(1);
    });

    // Singular Tricks
    test('getTrick for invalid trick for empty trick table', async () => {
        const result = await game.getTrick('180 unispin');
        expect(result).toBeNull();
    });

    test('getTrickExampleVideo for invalid trick for empty trick table', async () => {
        const result = await game.getTrickExampleVideo('180 unispin');
        expect(result).toBe('');
    });

    test('getTrickExampleLink for invalid trick for empty trick table', async () => {
        const result = await game.getTrickExampleLink('180 unispin');
        expect(result).toBe('');
    });

    test('getTrickExamplePlayer for invalid trick for empty trick table', async () => {
        const result = await game.getTrickExamplePlayer('180 unispin');
        expect(result).toBeNull();
    });

    test('getTrickTutorial for invalid trick for empty trick table', async () => {
        const result = await game.getTrickTutorial('180 unispin');
        expect(result).toBe('');
    });

    test('getTrickScore for invalid trick for empty trick table', async () => {
        const result = await game.getTrickScore('180 unispin');
        expect(result).toBe(BigInt(-1));
    });

    // Utilities
    test('getTrickAutocompleteOptions for empty trick table', async () => {
        const result = await game.getTrickAutocompleteOptions('180 unispin');
        expect(result).toEqual([]);
    });

    test('getTrickAutocompleteOptions including the query for empty trick table', async () => {
        const result = await game.getTrickAutocompleteOptions('180 unispin', true);
        expect(result).toEqual([{
            name: '180 unispin',
            value: '180 unispin'
        }]);
    });

    test('hasTrick for empty trick table', async () => {
        const result = await game.hasTrick('180 unispin');
        expect(result).toBeFalsy();
    });

    // Pagination
    test('getPaginatedLeaderboard for empty player table', async () => {
        const result = await game.getPaginatedLeaderboard();
        expect(result).toEqual([]);
    });

    test('getPaginatedLeaderboard with invalid page number for empty player table', async () => {
        const result = await game.getPaginatedLeaderboard(5);
        expect(result).toEqual([]);
    });

    test('getPaginatedTricks for empty trick table', async () => {
        const result = await game.getPaginatedTricks();
        expect(result).toEqual([]);
    });

    test('getPaginatedTricks with invalid page number for empty trick table', async () => {
        const result = await game.getPaginatedTricks(5);
        expect(result).toEqual([]);
    });

    test('getPaginatedPlayerTricks for empty player and trick tables', async () => {
        const result = await game.getPaginatedPlayerTricks('12345');
        expect(result).toEqual([]);
    });

    test('getPaginatedPlayerTricks with invalid page number for empty player and trick tables', async () => {
        const result = await game.getPaginatedPlayerTricks('12345', 5);
        expect(result).toEqual([]);
    });

    test('getPaginatedTrickLanders for empty trick and player tables', async () => {
        const result = await game.getPaginatedTrickLanders('180 unispin');
        expect(result).toEqual([]);
    });

    test('getPaginatedTrickLanders with invalid page number for empty trick and player tables', async () => {
        const result = await game.getPaginatedTrickLanders('180 unispin', 5);
        expect(result).toEqual([]);
    });
});

describe('one player and one trick database tests', () => {
    // Core Query #1 ----------------------------------------------------------------
    test('addTrickRecipient for sample trick recipient', async () => {
        const result = await game.addTrickRecipient('180 unispin', '12345');
        expect(result).toBeTruthy();
    });

    // Leaderboard (All Players)
    test('getLeaderboardPages for player table with one player', async () => {
        const result = await game.getLeaderboardPages();
        expect(result).toBe(1);
    });
    
    // Singular Player
    test('getPlayer for only player', async () => {
        const result = await game.getPlayer(BigInt(12345));
        expect(result).toEqual({
            id: BigInt(12345),
            score: BigInt(10),
            tricks: ['180 unispin']
          });
    });

    test('getPlayer for invalid player', async () => {
        const result = await game.getPlayer(BigInt(54321));
        expect(result).toBeNull();
    });

    test('getPlayerScore for only player', async () => {
        const result = await game.getPlayerScore(BigInt(12345));
        expect(result).toBe(BigInt(10));
    });

    test('getPlayerScore for invalid player', async () => {
        const result = await game.getPlayerScore(BigInt(54321));
        expect(result).toBe(BigInt(-1));
    });

    test('getPlayerTricks for only player', async () => {
        const result = await game.getPlayerTricks(BigInt(12345));
        expect(result).toEqual(['180 unispin']);
    });

    test('getPlayerTricks for invalid player', async () => {
        const result = await game.getPlayerTricks(BigInt(54321));
        expect(result).toEqual([]);
    });

    test('getPlayerTricksPages with array with one trick', async () => {
        const result = await game.getPlayerTricksPages(['180 unispin']);
        expect(result).toBe(1);
    });
    
    // All Tricks
    test('getTricksPages for trick table with one trick', async () => {
        const result = await game.getTricksPages();
        expect(result).toBe(1);
    });

    // Singular Tricks
    test('getTrick for only trick', async () => {
        const result = await game.getTrick('180 unispin');
        expect(result).toEqual({
            name: '180 unispin',
            example_video: null,
            example_link: null,
            example_player: null,
            tutorial: null,
            score: BigInt(10),
            players: [BigInt(12345)]
          });
    });

    test('getTrick for invalid trick', async () => {
        const result = await game.getTrick('crankflip');
        expect(result).toBeNull();
    });

    test('getTrickExampleVideo for only trick', async () => {
        const result = await game.getTrickExampleVideo('180 unispin');
        expect(result).toBe('');
    });

    test('getTrickExampleVideo for invalid trick', async () => {
        const result = await game.getTrickExampleVideo('crankflip');
        expect(result).toBe('');
    });

    test('getTrickExampleLink for only trick', async () => {
        const result = await game.getTrickExampleLink('180 unispin');
        expect(result).toBe('');
    });

    test('getTrickExampleLink for invalid trick', async () => {
        const result = await game.getTrickExampleLink('crankflip');
        expect(result).toBe('');
    });

    test('getTrickExamplePlayer for only trick', async () => {
        const result = await game.getTrickExamplePlayer('180 unispin');
        expect(result).toBeNull();
    });

    test('getTrickExamplePlayer for invalid trick', async () => {
        const result = await game.getTrickExamplePlayer('crankflip');
        expect(result).toBeNull();
    });

    test('getTrickTutorial for only trick', async () => {
        const result = await game.getTrickTutorial('180 unispin');
        expect(result).toBe('');
    });

    test('getTrickTutorial for invalid trick', async () => {
        const result = await game.getTrickTutorial('crankflip');
        expect(result).toBe('');
    });

    test('getTrickScore for only trick', async () => {
        const result = await game.getTrickScore('180 unispin');
        expect(result).toBe(BigInt(10));
    });

    test('getTrickScore for invalid trick', async () => {
        const result = await game.getTrickScore('crankflip');
        expect(result).toBe(BigInt(-1));
    });

    test('getTrickPlayersPages for trick valid trick', async () => {
        const result = await game.getTrickPlayersPages({
            name: '180 unispin',
            example_video: null,
            example_link: null,
            example_player: null,
            tutorial: null,
            score: BigInt(10),
            players: [BigInt(12345)]
        });
        expect(result).toBe(1);
    });

    // Utilities
    test('getTrickAutocompleteOptions for complete query and trick table with one trick', async () => {
        const result = await game.getTrickAutocompleteOptions('180 unispin');
        expect(result).toEqual([{
            name: '180 unispin',
            value: '180 unispin'
        }]);
    });

    test('getTrickAutocompleteOptions for incomplete query 1 and trick table with one trick', async () => {
        const result = await game.getTrickAutocompleteOptions('180');
        expect(result).toEqual([{
            name: '180 unispin',
            value: '180 unispin'
        }]);
    });

    test('getTrickAutocompleteOptions for incomplete query 2 and trick table with one trick', async () => {
        const result = await game.getTrickAutocompleteOptions('unis');
        expect(result).toEqual([{
            name: '180 unispin',
            value: '180 unispin'
        }]);
    });

    test('getTrickAutocompleteOptions for invalid query and trick table with one trick', async () => {
        const result = await game.getTrickAutocompleteOptions('crankflip');
        expect(result).toEqual([]);
    });

    test('getTrickAutocompleteOptions including the query for complete query and trick table with one trick', async () => {
        const result = await game.getTrickAutocompleteOptions('180 unispin', true);
        expect(result).toEqual([{
            name: '180 unispin',
            value: '180 unispin'
        }]);
    });

    test('getTrickAutocompleteOptions including the query for incomplete query 1 and trick table with one trick', async () => {
        const result = await game.getTrickAutocompleteOptions('180', true);
        expect(result).toEqual([
            {
                name: '180 unispin',
                value: '180 unispin'
            },
            {
                name: '180',
                value: '180'
            }
        ]);
    });

    test('getTrickAutocompleteOptions including the query for incomplete query 2 and trick table with one trick', async () => {
        const result = await game.getTrickAutocompleteOptions('unis', true);
        expect(result).toEqual([
            {
                name: '180 unispin',
                value: '180 unispin'
            },
            {
                name: 'unis',
                value: 'unis'
            }
        ]);
    });

    test('getTrickAutocompleteOptions including the query for invalid query and trick table with one trick', async () => {
        const result = await game.getTrickAutocompleteOptions('crankflip', true);
        expect(result).toEqual([{
            name: 'crankflip',
            value: 'crankflip'
        }]);
    });

    test('hasTrick for only trick in trick table with one trick', async () => {
        const result = await game.hasTrick('180 unispin');
        expect(result).toBeTruthy();
    });

    test('hasTrick for invalid trick in trick table with one trick', async () => {
        const result = await game.hasTrick('crankflip');
        expect(result).toBeFalsy();
    });

    // Pagination
    test('getPaginatedLeaderboard for player table with one player', async () => {
        const result = await game.getPaginatedLeaderboard();
        expect(result).toEqual([{
            id: BigInt(12345),
            score: BigInt(10),
            tricks: ['180 unispin']
        }]);
    });

    test('getPaginatedLeaderboard with invalid page number for player table with one player', async () => {
        const result = await game.getPaginatedLeaderboard(5);
        expect(result).toEqual([]);
    });

    test('getPaginatedTricks for trick table with one trick', async () => {
        const result = await game.getPaginatedTricks();
        expect(result).toEqual([{
            example_link: null,
            example_player: null,
            example_video: null,
            name: '180 unispin',
            players: [BigInt(12345)],
            score: BigInt(10),
            tutorial: null
        }]);
    });

    test('getPaginatedTricks with invalid page number for trick table with one trick', async () => {
        const result = await game.getPaginatedTricks(5);
        expect(result).toEqual([]);
    });

    test('getPaginatedPlayerTricks for player table with one player and trick table with one trick', async () => {
        const result = await game.getPaginatedPlayerTricks('12345');
        expect(result).toEqual(['180 unispin']);
    });

    test('getPaginatedPlayerTricks with invalid player for player table with one player and trick table with one trick', async () => {
        const result = await game.getPaginatedPlayerTricks('54321');
        expect(result).toEqual([]);
    });

    test('getPaginatedPlayerTricks with invalid page number for player table with one player and trick table with one trick', async () => {
        const result = await game.getPaginatedPlayerTricks('12345', 5);
        expect(result).toEqual([]);
    });

    test('getPaginatedPlayerTricks with invalid player and page number for player table with one player and trick table with one trick', async () => {
        const result = await game.getPaginatedPlayerTricks('54321', 5);
        expect(result).toEqual([]);
    });

    test('getPaginatedTrickLanders for trick table with one trick and player table with one player', async () => {
        const result = await game.getPaginatedTrickLanders('180 unispin');
        expect(result).toEqual([BigInt(12345)]);
    });

    test('getPaginatedTrickLanders with invalid trick for trick table with one trick and player table with one player', async () => {
        const result = await game.getPaginatedTrickLanders('crankflip');
        expect(result).toEqual([]);
    });

    test('getPaginatedTrickLanders with invalid page number for trick table with one trick and player table with one player', async () => {
        const result = await game.getPaginatedTrickLanders('180 unispin', 5);
        expect(result).toEqual([]);
    });

    test('getPaginatedTrickLanders with invalid trick and page number for trick table with one trick and player table with one player', async () => {
        const result = await game.getPaginatedTrickLanders('crankflip', 5);
        expect(result).toEqual([]);
    });


    //addTrickRecipient
    //removeTrickRecipient
    //removeTrick
    //mergeTricks

});

// describe('test database tests', () => {
//     beforeAll(() => resetData().catch((e) => { throw e }));

//     // Leaderboard (All Players)
//     test('getLeaderboardPages for player table with one player', async () => {
//         const result = await game.getLeaderboardPages();
//         expect(result).toBe(1);
//     });
    
//     // Singular Player
//     test('getPlayer for only player', async () => {
//         const result = await game.getPlayer(BigInt(12345));
//         expect(result).toEqual({
//             id: BigInt(12345),
//             score: BigInt(10),
//             tricks: ['180 unispin']
//           });
//     });

//     test('getPlayer for invalid player', async () => {
//         const result = await game.getPlayer(BigInt(54321));
//         expect(result).toBeNull();
//     });

//     test('getPlayerScore for only player', async () => {
//         const result = await game.getPlayerScore(BigInt(12345));
//         expect(result).toBe(BigInt(10));
//     });

//     test('getPlayerScore for invalid player', async () => {
//         const result = await game.getPlayerScore(BigInt(54321));
//         expect(result).toBe(BigInt(-1));
//     });

//     test('getPlayerTricks for only player', async () => {
//         const result = await game.getPlayerTricks(BigInt(12345));
//         expect(result).toEqual(['180 unispin']);
//     });

//     test('getPlayerTricks for invalid player', async () => {
//         const result = await game.getPlayerTricks(BigInt(54321));
//         expect(result).toEqual([]);
//     });

//     test('getPlayerTricksPages with array with one trick', async () => {
//         const result = await game.getPlayerTricksPages(['180 unispin']);
//         expect(result).toBe(1);
//     });
    
//     // All Tricks
//     test('getTricksPages for trick table with one trick', async () => {
//         const result = await game.getTricksPages();
//         expect(result).toBe(1);
//     });

//     // Singular Tricks
//     test('getTrick for only trick', async () => {
//         const result = await game.getTrick('180 unispin');
//         expect(result).toEqual({
//             name: '180 unispin',
//             example_video: null,
//             example_link: null,
//             example_player: null,
//             tutorial: null,
//             score: BigInt(10),
//             players: [BigInt(12345)]
//           });
//     });

//     test('getTrick for invalid trick', async () => {
//         const result = await game.getTrick('crankflip');
//         expect(result).toBeNull();
//     });

//     test('getTrickExampleVideo for only trick', async () => {
//         const result = await game.getTrickExampleVideo('180 unispin');
//         expect(result).toBe('');
//     });

//     test('getTrickExampleVideo for invalid trick', async () => {
//         const result = await game.getTrickExampleVideo('crankflip');
//         expect(result).toBe('');
//     });

//     test('getTrickExampleLink for only trick', async () => {
//         const result = await game.getTrickExampleLink('180 unispin');
//         expect(result).toBe('');
//     });

//     test('getTrickExampleLink for invalid trick', async () => {
//         const result = await game.getTrickExampleLink('crankflip');
//         expect(result).toBe('');
//     });

//     test('getTrickExamplePlayer for only trick', async () => {
//         const result = await game.getTrickExamplePlayer('180 unispin');
//         expect(result).toBeNull();
//     });

//     test('getTrickExamplePlayer for invalid trick', async () => {
//         const result = await game.getTrickExamplePlayer('crankflip');
//         expect(result).toBeNull();
//     });

//     test('getTrickTutorial for only trick', async () => {
//         const result = await game.getTrickTutorial('180 unispin');
//         expect(result).toBe('');
//     });

//     test('getTrickTutorial for invalid trick', async () => {
//         const result = await game.getTrickTutorial('crankflip');
//         expect(result).toBe('');
//     });

//     test('getTrickScore for only trick', async () => {
//         const result = await game.getTrickScore('180 unispin');
//         expect(result).toBe(BigInt(10));
//     });

//     test('getTrickScore for invalid trick', async () => {
//         const result = await game.getTrickScore('crankflip');
//         expect(result).toBe(BigInt(-1));
//     });

//     test('getTrickPlayersPages for trick valid trick', async () => {
//         const result = await game.getTrickPlayersPages({
//             name: '180 unispin',
//             example_video: null,
//             example_link: null,
//             example_player: null,
//             tutorial: null,
//             score: BigInt(10),
//             players: [BigInt(12345)]
//         });
//         expect(result).toBe(1);
//     });

//     // Utilities
//     test('getTrickAutocompleteOptions for complete query and trick table with one trick', async () => {
//         const result = await game.getTrickAutocompleteOptions('180 unispin');
//         expect(result).toEqual([{
//             name: '180 unispin',
//             value: '180 unispin'
//         }]);
//     });

//     test('getTrickAutocompleteOptions for incomplete query 1 and trick table with one trick', async () => {
//         const result = await game.getTrickAutocompleteOptions('180');
//         expect(result).toEqual([{
//             name: '180 unispin',
//             value: '180 unispin'
//         }]);
//     });

//     test('getTrickAutocompleteOptions for incomplete query 2 and trick table with one trick', async () => {
//         const result = await game.getTrickAutocompleteOptions('unis');
//         expect(result).toEqual([{
//             name: '180 unispin',
//             value: '180 unispin'
//         }]);
//     });

//     test('getTrickAutocompleteOptions for invalid query and trick table with one trick', async () => {
//         const result = await game.getTrickAutocompleteOptions('crankflip');
//         expect(result).toEqual([]);
//     });

//     test('getTrickAutocompleteOptions including the query for complete query and trick table with one trick', async () => {
//         const result = await game.getTrickAutocompleteOptions('180 unispin', true);
//         expect(result).toEqual([{
//             name: '180 unispin',
//             value: '180 unispin'
//         }]);
//     });

//     test('getTrickAutocompleteOptions including the query for incomplete query 1 and trick table with one trick', async () => {
//         const result = await game.getTrickAutocompleteOptions('180', true);
//         expect(result).toEqual([
//             {
//                 name: '180 unispin',
//                 value: '180 unispin'
//             },
//             {
//                 name: '180',
//                 value: '180'
//             }
//         ]);
//     });

//     test('getTrickAutocompleteOptions including the query for incomplete query 2 and trick table with one trick', async () => {
//         const result = await game.getTrickAutocompleteOptions('unis', true);
//         expect(result).toEqual([
//             {
//                 name: '180 unispin',
//                 value: '180 unispin'
//             },
//             {
//                 name: 'unis',
//                 value: 'unis'
//             }
//         ]);
//     });

//     test('getTrickAutocompleteOptions including the query for invalid query and trick table with one trick', async () => {
//         const result = await game.getTrickAutocompleteOptions('crankflip', true);
//         expect(result).toEqual([{
//             name: 'crankflip',
//             value: 'crankflip'
//         }]);
//     });

//     test('hasTrick for only trick in trick table with one trick', async () => {
//         const result = await game.hasTrick('180 unispin');
//         expect(result).toBeTruthy();
//     });

//     test('hasTrick for invalid trick in trick table with one trick', async () => {
//         const result = await game.hasTrick('crankflip');
//         expect(result).toBeFalsy();
//     });

//     // Pagination
//     test('getPaginatedLeaderboard for player table with one player', async () => {
//         const result = await game.getPaginatedLeaderboard();
//         expect(result).toEqual([{
//             id: BigInt(12345),
//             score: BigInt(10),
//             tricks: ['180 unispin']
//         }]);
//     });

//     test('getPaginatedLeaderboard with invalid page number for player table with one player', async () => {
//         const result = await game.getPaginatedLeaderboard(5);
//         expect(result).toEqual([]);
//     });

//     test('getPaginatedTricks for trick table with one trick', async () => {
//         const result = await game.getPaginatedTricks();
//         expect(result).toEqual([{
//             example_link: null,
//             example_player: null,
//             example_video: null,
//             name: '180 unispin',
//             players: [BigInt(12345)],
//             score: BigInt(10),
//             tutorial: null
//         }]);
//     });

//     test('getPaginatedTricks with invalid page number for trick table with one trick', async () => {
//         const result = await game.getPaginatedTricks(5);
//         expect(result).toEqual([]);
//     });

//     test('getPaginatedPlayerTricks for player table with one player and trick table with one trick', async () => {
//         const result = await game.getPaginatedPlayerTricks('12345');
//         expect(result).toEqual(['180 unispin']);
//     });

//     test('getPaginatedPlayerTricks with invalid player for player table with one player and trick table with one trick', async () => {
//         const result = await game.getPaginatedPlayerTricks('54321');
//         expect(result).toEqual([]);
//     });

//     test('getPaginatedPlayerTricks with invalid page number for player table with one player and trick table with one trick', async () => {
//         const result = await game.getPaginatedPlayerTricks('12345', 5);
//         expect(result).toEqual([]);
//     });

//     test('getPaginatedPlayerTricks with invalid player and page number for player table with one player and trick table with one trick', async () => {
//         const result = await game.getPaginatedPlayerTricks('54321', 5);
//         expect(result).toEqual([]);
//     });

//     test('getPaginatedTrickLanders for trick table with one trick and player table with one player', async () => {
//         const result = await game.getPaginatedTrickLanders('180 unispin');
//         expect(result).toEqual([BigInt(12345)]);
//     });

//     test('getPaginatedTrickLanders with invalid trick for trick table with one trick and player table with one player', async () => {
//         const result = await game.getPaginatedTrickLanders('crankflip');
//         expect(result).toEqual([]);
//     });

//     test('getPaginatedTrickLanders with invalid page number for trick table with one trick and player table with one player', async () => {
//         const result = await game.getPaginatedTrickLanders('180 unispin', 5);
//         expect(result).toEqual([]);
//     });

//     test('getPaginatedTrickLanders with invalid trick and page number for trick table with one trick and player table with one player', async () => {
//         const result = await game.getPaginatedTrickLanders('crankflip', 5);
//         expect(result).toEqual([]);
//     });

// });

