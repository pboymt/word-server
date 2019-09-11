import Express from "express";
import { json } from "body-parser";
import api from "./api";
import { db } from "./db";

(async () => {

    await db.connect('word', 'word');

    console.log(db.instance.databaseName);

    const app = Express();

    app.use(json());

    app.use(Express.static('static'));

    app.use('/api', api);

    app.listen(3000, () => { console.log('listening...') });

})().catch((err) => {
    console.log(err);
    process.exit();
});

process.once('beforeExit', () => {
    db.client.close();
});