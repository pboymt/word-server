import { Router } from "express";
import axios from "axios";
import { Word, WordModel } from "./interfaces";
import { db } from "./db";

const ciba = axios.create({
    baseURL: 'http://dict-co.iciba.com/api'
});

const api = Router();

api.use((req, res, next) => {
    if (req.query['key'] === process.env.WORD_KEY) {
        next();
    } else {
        res.status(401);
        res.send({ code: 401, message: 'unauthorized' });
    }
});

api.get('/', (req, res) => {
    res.send({ code: 0, message: 'ok.' });
});

api.get('/export', async (req, res) => {
    const result = await db.instance.collection<WordModel>('words').find().toArray();
    res.send({ code: 0, message: 'success', data: result });
});

api.post('/import', (req, res) => {

});

api.get('/w/:word', async (req, res) => {
    const word = req.params['word'] || 'apple';
    const queryResult = await db.instance.collection<WordModel>('words').findOne({ name: word });
    if (queryResult) {
        res.send({ code: 0, message: 'success', data: queryResult.word });
    } else {
        res.send({ code: 404, message: 'word not found' });
    }
});

/**
 * 添加词汇
 */
api.post('/word', async (req, res) => {
    const body: { word: string } = req.body;
    if (!body.word || typeof body.word !== 'string' || !body.word.length) {
        res.send({ code: 10000, message: 'invalid word' });
    } else {
        const queryResult = await db.instance.collection<WordModel>('words').findOne({ name: body.word });
        if (queryResult) {
            res.send({ code: 1, message: 'duplicated', data: queryResult.word });
        } else {
            const word = (await ciba.get<Word>('/dictionary.php', {
                params: {
                    key: '937990F69DA81DC64C78AED7B84A05A3',
                    type: 'json',
                    w: body.word
                }
            })).data;
            // console.log(word);
            if (word.word_name) {
                // if (word.is_CRI == 1) {
                const insertResult = await db.instance.collection<WordModel>('words').insertOne({
                    name: body.word,
                    word,
                    lastQuery: new Date,
                    insertDate: new Date,
                    queryCount: 0,
                    level: 1
                });
                if (insertResult.result.ok) {
                    res.send({ code: 0, message: 'success', data: word });
                } else {
                    res.send({ code: 10002, message: 'database error' });
                }
                // } else {
                //     res.send({ code: 3, message: 'not a standard word', data: word });
                // }
            } else {
                res.send({ code: 10001, message: 'incorrect word' });
            }
        }
    }
});

/**
 * 获取词汇
 */
api.get('/word', async (req, res) => {
    const level = Number(req.query['level']);
    const queryResult = await db.instance.collection<WordModel>('words')
        .find(level ? { level: { $eq: level } } : undefined)
        .sort({ queryCount: 1, lastQuery: 1, level: 1 })
        .limit(1)
        .toArray();
    if (queryResult.length) {
        const word = queryResult[0];
        await db.instance.collection<WordModel>('words').updateOne({ name: word.name }, { $set: { queryCount: word.queryCount + 1, lastQuery: new Date() } });
        res.send({ code: 0, message: 'success', data: queryResult[0].word });
    } else {
        res.send({ code: 2, message: 'empty database' });
    }
});

/**
 * 添加等级
 */
api.put('/word', async (req, res) => {
    const body: { word: string, uplevel: number } = req.body;
    const word = await db.instance.collection<WordModel>('words').findOne({ name: body.word });
    if (word) {
        await db.instance.collection<WordModel>('words').updateOne({ name: word.name }, { $set: { level: word.level + body.uplevel } })
    } else {
        res.send({ code: 404, message: 'word not found' });
    }
});

export default api;