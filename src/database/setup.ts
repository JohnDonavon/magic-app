import * as SQLite from 'expo-sqlite'
import SQLiteClient from './SQLiteClient'
import { schema } from './schema'
import { MIGRATIONS } from './migrations'

export const DB_NAME = 'mtg_overseer.db'

const getMigrationFunc = (query: string) => {
  return async (db: SQLite.SQLiteDatabase): Promise<void> => {
    const statements = query
      .split(';')
      .filter(statement => statement.trim() !== '')

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await db.execAsync(statement)
          console.log('Statement executed successfully')
        } catch (error) {
          console.error('Failed to execute statement:', error)
          throw error
        }
      }
    }
  }
}

// Be careful, only ever append to the end of the array
// Migrations are run based on the order and length of this array
const DB_MIGRATIONS = [
  getMigrationFunc(schema),
  ...MIGRATIONS.map(getMigrationFunc),
]

export const sqLiteClient = new SQLiteClient(DB_NAME, DB_MIGRATIONS, {
  // Optional: Add any SQLite options here
  enableChangeListener: true, // Enable database change events
})

export const initializeDatabase = async (): Promise<void> => {
  await sqLiteClient.connect()
}

export const databaseExists = async (): Promise<boolean> => {
  return await sqLiteClient.exists()
}

export const deleteDatabase = async (): Promise<void> => {
  await sqLiteClient.delete()
}
