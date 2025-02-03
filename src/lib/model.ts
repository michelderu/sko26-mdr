/* eslint-disable @typescript-eslint/no-unused-vars */
import { getAstraClient } from "./astradb";

export type Stock = {
    symbol: string;
    name: string;
};

export type Trade = {
    symbol: string;
    name: string;
    date: Date;
    high: number;
    low: number;
    open: number;
    close: number;
    volume: number;
};

const stocks : Stock[] = [];

/**
 * This method is to read stocks data from a collection in AstraDB.
 */
export async function getStocksFromAstra(): Promise<Stock[]> {
    if(stocks.length > 0){
        return stocks;
    }
    const dbClient = await getAstraClient();

    const stock_client = dbClient.collection("stock_collection");

    try {

        /**************** TODO 1 *******************/
        // use find method to get documents from the collection and push them to the stocks array
        // HINT: Since we want all data in the collection, you will use an empty filter ({}).
        // HINT: You will need to iterate over the result.
        /**************** TODO 1 *******************/

        const result = await stock_client.find({});
        for await (const row of result) {
            const stock: Stock = {
                symbol: row.symbol, 
                name: row.name,
            };
            stocks.push(stock);
        }

        return stocks;
    }catch(error){
        if (error instanceof Error && error.message.includes(("Collection does not exist"))) {
            console.error("Collection does not exist:", error);
            return stocks;
        }
        console.error("Error getting data from database:", error);
        throw error;
    }
}


/**
 * This method is to read trades data from a table in AstraDB.
 */
export async function getTradesFromAstra( stockSymbol: string): Promise<Trade[]> {
    const dbClient = await getAstraClient();

    const trade_client = dbClient.table("trade_table");
    const trades: Trade[] = []; 

    try {

        /**************** TODO 2 *******************/
        // Find rows in the table where symbol is equal to stockSymbol and push them to the trades array
        // HINT: Since we want to find data that matches a specific symbol, you will use a filter like {symbol: stockSymbol}
        // HINT: You will need to iterate over the result.
        /**************** TODO 2 *******************/
        console.log("stockSymbol", stockSymbol);
        const result = await trade_client.find({symbol: stockSymbol});
        for await (const row of result) {
            const trade: Trade = {
                symbol: row.symbol,
                name: row.name,
                date: row.date,
                high: row.high,
                low: row.low,
                open: row.open,
                close: row.close,
                volume: row.volume,
            };
            trades.push(trade); 
        }

        return trades;
    }catch(error){
        if (error instanceof Error && error.message.includes(("Collection does not exist"))) {
            console.error("table does not exist:", error);
            return trades;
        }
        console.error("Error getting data from database:", error);
        throw error;
    }
}
