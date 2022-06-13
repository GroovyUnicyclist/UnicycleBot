import { Prisma, PrismaClient, trick } from '@prisma/client';
import express from 'express';
import { Game } from '../game';
const PORT = process.env.PORT || 3001;
const app = express();
(BigInt.prototype as any).toJSON = function () {
    return Number(this)
};


app.get("/api", (req: express.Request, res: express.Response) => {
    res.json({ message: "Hello from Express!" });
});

app.get("/api/tricks", async (req: express.Request, res: express.Response) => {
    const prisma = new PrismaClient();
    const game = new Game(prisma);
    const tricks = await game.getAllTricksAlphabetical();
    prisma.$disconnect()
    res.json(tricks);
});

app.get("/api/trick/:name", async (req: express.Request, res: express.Response) => {
    const prisma = new PrismaClient();
    const game = new Game(prisma);
    const trick: trick | null = req.params.name ? await game.getTrick(req.params.name) : null;
    prisma.$disconnect()
    res.json(trick);
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});