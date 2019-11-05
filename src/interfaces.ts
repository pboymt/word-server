export interface NCiba {
    errno: number;
    errmsg: string;
    baesInfo: Word;
}

export interface Word {
    word_name: string,
    is_CRI: 1,
    exchange: {
        word_pl: string[],
        word_past: string[],
        word_done: string[],
        word_ing: string[],
        word_third: string[],
        word_er: string,
        word_est: string
    },
    symbols: {
        ph_en: string,
        ph_am: string,
        ph_other: string,
        ph_en_mp3: string,
        ph_am_mp3: string,
        ph_tts_mp3: string,
        parts: {
            part: string,
            means: string[]
        }[]
    }[];
    items: string[];
}

export interface WordModel {
    word: Word;
    name: string;
    insertDate: Date;
    lastQuery: Date;
    queryCount: number;
    level: number;
}