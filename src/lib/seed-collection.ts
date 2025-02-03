/* eslint-disable @typescript-eslint/no-unused-vars */
import { config } from 'dotenv';
config();

import * as fs from "fs";
import csv from "csv-parser";
import { Db } from '@datastax/astra-db-ts';
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
 * This method is to seed the AstraDB with stock data.
 * 
 * Data seeding flow) will perform the following steps:
 * 1. Establishe a connection to the AstraDB using the Data API typescript client.
 * 2. Delete any existing data in the AstraDB.
 * 3. Read stock data from csv and inserts it into a collection in the AstraDB.
 * 
 */
async function populateDB() {

    const client = await getAstraClient();
    await deleteExistingDataInAstra(client)
    
    // Read stock data from csv and inserts it into a collection in the AstraDB.
    const stocks = await readFromStockAndInsertCollection(client);
}



/**
 * This method is to read stock data from a csv file and inserts into a collection in the AstraDB.
 * 
 * collection: stock_collection
 * cvs file: nasdaq_stocks.csv
 * csv file path: ./src/lib/datasets/nasdaq_stocks.csv
 */
async function readFromStockAndInsertCollection(client: Db): Promise<Stock[]> {
    console.log("Start to parsing nasdaq_stocks CSV. Inserting into database...");

    // Created the collection "stock_collection"
    await client.createCollection("stock_collection");

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
        .on("end", async () => {
          console.log("Finished parsing nasdaq_stocks CSV. Inserting into database...");
          try {
            await client.collection("stock_collection").insertMany(stocks);
            console.log("collection stock_collection populated successfully!");
            resolve(stocks);
          } catch (error) {
            console.error("Error inserting data into database:", error);
            reject(error);
          }
        })
        .on("error", (error) => {
          console.error("Error reading CSV file:", error);
          reject(error);
        });
    });
  }



/**
 * Deletes existing data in Astra by truncating the collection.
 * 
 * This function attempts to delete all rows from "stock_collection"
 * 
 */
async function deleteExistingDataInAstra(client: Db): Promise<void> {
    // Belowing deleteManycommands will truncate the Data API collection.
    // It does not matter if the collection or table does not exist, we will ignore the error
    // since table creation will take care of it.
    try {
        await client.collection("stock_collection").deleteMany({});
    } catch (error) {
    }
  }


