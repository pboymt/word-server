import mongo, { MongoClient, Db } from "mongodb";

export namespace db {

    export let client: MongoClient;

    export let instance: Db;

    export async function connect(user: string, password: string) {
        client = await mongo.connect('mongodb://localhost:27017/word', { auth: { user, password }, useNewUrlParser: true, useUnifiedTopology: true });
        instance = client.db();
        console.log('db connected');
    }

}
