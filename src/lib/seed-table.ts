/* eslint-disable @typescript-eslint/no-unused-vars */
import { config } from 'dotenv';
config();

import * as fs from "fs";
import csv from "csv-parser";
import { CreateTableDefinition, Db } from '@datastax/astra-db-ts';
import { Stock, Trade} from './model';
import { getAstraClient} from "./astradb";


/**
 * Entry point for the seed script.
 */
populateDB().catch(error => {
    console.error(error);
    process.exit(-1);
});;
    


/**
 * This method is to seed the AstraDB with trade data.
 * 
 * Data seeding flow) will perform the following steps:
 * 1. Establishe a connection to the AstraDB using the Data API typescript client.
 * 2. Delete any existing data in the AstraDB.
 * 3. Read trade data from csv and inserts it into a table in the AstraDB.
 * 
 */
async function populateDB() {

    const client = await getAstraClient();
    await deleteExistingDataInAstra(client)
    const stocks = await getStocks();

    // Read trade data from csv and inserts it into the table in the AstraDB.
    await readFromTradeAndInsertTable(client, stocks);
}


/**
 * This method is to read trades data from csv files and inserts into a table in the Astra database.
 * 
 * table: trade_table
 * csv file path: ./src/lib/datasets/${stockSymbol}_1Y.csv
 * Note, each trade data csv represents a single stock, and it contains trades metadata for 1 year.
 */
async function readFromTradeAndInsertTable(client: Db, stocks: Stock[]): Promise<void> {
    console.log("Start to parsing stock trades CSVs. Inserting into database...");

    /**************** TODO 1 *******************/
    // Create the table "trade_table"
    // Hint: Use createTable method
    // Hint: Since you want to look up data by stock symbol, set the primary key to partition by the "symbol" column.
    // Hint: Since you want to sort the data by date, set the primary key to sort by the "date" column.
    /**************** TODO 1 *******************/

   // Create table schema using bespoke Data API table definition syntax
   // Create table schema using bespoke Data API table definition syntax
// Create table schema using bespoke Data API table definition syntax

// Date,Close/Last,Volume,Open,High,Low
const trade_table = await client.createTable('trade_table', {
  definition: {
    columns: {
      symbol: 'text',
      name: 'text',
      date: 'timestamp',
      high: 'float',
      low: 'float',
      open: 'float',
      close: 'float',
      volume: 'int',
    },
    primaryKey: {
      partitionBy: ['symbol'],
      partitionSort: { date : 1 },
    },
  },
  ifNotExists: true,
});

    for (const stock of stocks) {
        const filePath = `./src/lib/datasets/${stock.symbol}_1Y.csv`; // Path to your CSV file for each stock

        await new Promise<void>((resolve, reject) => {
            const trades : Trade[] = [];
            fs.createReadStream(filePath)
                .pipe(csv())
                .on("data", (row) => {
                    const trade = {
                        symbol: stock.symbol,
                        name: stock.name,
                        date: new Date(row["Date"]),
                        high: parseFloat(row["High"].replace('$', '')),
                        low: parseFloat(row["Low"].replace('$', '')),
                        open: parseFloat(row["Open"].replace('$', '')),
                        close: parseFloat(row["Close/Last"].replace('$', '')),
                        volume: parseInt(row["Volume"], 10),
                      };
                    trades.push(trade);
                })
                .on("end", async () => {
                    console.log(`Finished parsing ${stock.symbol}_1Y CSV. Inserting into database...`);
                    try {
                        /**************** TODO 2 *******************/
                        // Insert the trades array into the table "trade_table" by using insertMany command
                        // Hint: Use insertMany to insert rows to the table.
                        /**************** TODO 2 *******************/
                        await client.table("trade_table").insertMany(trades);

                        console.log(`table trade_table populated successfully for ${stock.symbol}!`);
                        resolve();
                    } catch (error) {
                        console.error(`Error inserting data into database for ${stock.symbol}:`, error);
                        reject(error);
                    }
                })
                .on("error", (error) => {
                    console.error(`Error reading CSV file for ${stock.symbol}:`, error);
                    reject(error);
                });
        });
    }
}




/**
 * Deletes existing data in Astra by truncating the table.
 * 
 * This function attempts to delete all rows from "trade_table"
 * 
 */
async function deleteExistingDataInAstra(client: Db): Promise<void> {
    // Belowing deleteManycommands will truncate the Data API table.
    // It does not matter if the collection or table does not exist, we will ignore the error
    // since table creation will take care of it.
    try {
        await client.table("stock_table").deleteMany({});
    } catch (error) {
    }
  }



/**
 * This method is to read stock data from a csv file.
 * cvs file: nasdaq_stocks.csv
 * csv file path: ./src/lib/datasets/nasdaq_stocks.csv
 */
async function getStocks(): Promise<Stock[]> {
  const stocks: Stock[] = [];
  const filePath = "./src/lib/datasets/nasdaq_stocks.csv"; 

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const stock: Stock = {
          symbol: row["Symbol"],
          name: row["Name"],
        };
        stocks.push(stock);
      })
      .on("end", () => {
        resolve(stocks);
      })
      .on("error", (error) => {
        console.error("Error reading CSV file:", error);
        reject(error);
      });
  });
}
