import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cron from 'node-cron';
import startDiscordBot from './config/discord';
import crawl from './config/crawling';

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

cron.schedule('0 18 * * *', () => {
    console.log('크롤링 실행: KST 03:00');
    crawl();
}, {
    timezone: 'Asia/Seoul'
});

app.listen(port, () => {
    console.log(`Server is Running on port ${port}`);
});