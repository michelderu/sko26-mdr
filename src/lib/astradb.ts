"use server";
/* eslint-disable @typescript-eslint/no-unused-vars */

import { config } from 'dotenv';
config();

import { DataAPIClient } from '@datastax/astra-db-ts';

if (!process.env.ASTRA_DB_API_ENDPOINT) {
  throw new Error('Invalid/Missing environment variable: "ASTRA_DB_API_ENDPOINT"');
}
if (!process.env.ASTRA_DB_APPLICATION_TOKEN) {
    throw new Error('Invalid/Missing environment variable: "ASTRA_DB_APPLICATION_TOKEN"');
}

const astra_uri = process.env.ASTRA_DB_API_ENDPOINT;
const astra_token = process.env.ASTRA_DB_APPLICATION_TOKEN;

const client = new DataAPIClient(astra_token);
const db = client.db(astra_uri);

/**
 * This method is to get a Data API typescript AstraDB client.
 * Since "typescript client does not validate the existence of the database, it simply creates a reference",
 * we need to call listCollections() to check if the database exists.
 */
export async function getAstraClient() {
  try {
    await db.listCollections();
    return db;
  } catch (e) {
    throw e;
  }
}
