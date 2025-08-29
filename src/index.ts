import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import startDiscordBot from './config/discord';

const app = express();
dotenv.config();
const router = express.Router();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

startDiscordBot();

router.get('/', (req, res) => {
    res.json('aws discord bot');
});

app.listen(port, () => {
    console.log(`Server is Running on port ${port}`);
});