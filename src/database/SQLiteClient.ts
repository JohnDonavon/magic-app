/**
 * Modern SQLite client implementation using expo-sqlite
 * Provides database management, migrations, and error handling
 */
import * as SQLite from 'expo-sqlite'
import * as FileSystem from 'expo-file-system'

type Migration = (db: SQLite.SQLiteDatabase) => Promise<void>

/** Database downgrade error */
export class DowngradeError extends Error {
  constructor() {
    super('Cannot downgrade database version')
    this.name = 'DowngradeError'
  }
}

/** Interface to SQLiteClient */
export default class SQLiteClient {
  private connected = false
  private db: SQLite.SQLiteDatabase | null = null
  private readonly databaseName: string
  private readonly migrations: Migration[]
  private readonly options?: SQLite.SQLiteOpenOptions

  constructor(
    databaseName: string, 
    migrations: Migration[] = [], 
    options?: SQLite.SQLiteOpenOptions
  ) {
    this.databaseName = databaseName
    this.migrations = migrations
    this.options = options
  }

  public isConnected(): boolean {
    return this.connected
  }

  public getDatabase(): SQLite.SQLiteDatabase | null {
    return this.db
  }

  public async delete(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync()
      await SQLite.deleteDatabaseAsync(this.databaseName)
      this.db = null
      this.connected = false
    }
  }

  public async exists(): Promise<boolean> {
    const dbPath = `${FileSystem.documentDirectory}SQLite/${this.databaseName}`
    return (await FileSystem.getInfoAsync(dbPath)).exists
  }

  public async connect(): Promise<void> {
    if (this.connected) return

    try {
      // Open database with provided options
      this.db = await SQLite.openDatabaseAsync(this.databaseName, this.options)
      console.log('Database opened successfully')

      // Enable foreign keys by default
      await this.db.execAsync('PRAGMA foreign_keys = ON;')
      console.log('Foreign keys enabled')

      // Get current database version
      const result = await this.db.getFirstAsync<{ user_version: number }>('PRAGMA user_version')
      const currentVersion = result?.user_version ?? 0
      console.log('Current database version:', currentVersion)
      // Check and run migrations
      const targetVersion = this.migrations.length
      console.log('Target database version:', targetVersion)
      
      if (currentVersion > targetVersion) {
        throw new DowngradeError()
      }

      // Run migrations in a transaction
      await this.db.withTransactionAsync(async () => {
        for (let i = currentVersion; i < targetVersion; i++) {
          const migration = this.migrations[i]
          console.log('Running migration:', i)
          await migration(this.db!)
          console.log('Migration completed:', i)
        }

        if (currentVersion !== targetVersion) {
          await this.db!.execAsync(`PRAGMA user_version = ${targetVersion}`)
          console.log('Database version updated to:', targetVersion)
        }
      })

      this.connected = true
    } catch (error) {
      if (error instanceof DowngradeError) {
        throw error
      }
      
      console.error('Failed to connect to database:', error)
      throw new Error(`SQLiteClient: failed to connect to database: ${this.databaseName}`)
    }
  }

  /**
   * Execute a query with parameters
   */
  public async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      throw new Error('Database not connected')
    }
    return await this.db.getAllAsync<T>(sql, params)
  }

  /**
   * Execute an update query and return number of affected rows
   */
  public async execute(sql: string, params: any[] = []): Promise<number> {
    if (!this.db) {
      throw new Error('Database not connected')
    }
    const result = await this.db.runAsync(sql, params)
    return result.changes
  }

  /**
   * Get a single row from a query
   */
  public async getFirst<T>(sql: string, params: any[] = []): Promise<T | null> {
    if (!this.db) {
      throw new Error('Database not connected')
    }
    return await this.db.getFirstAsync<T>(sql, params)
  }

  /**
   * Execute multiple statements in a transaction
   */
  public async transaction(callback: () => Promise<void>): Promise<void> {
    if (!this.db) {
      throw new Error('Database not connected')
    }
    return await this.db.withTransactionAsync(callback)
  }
}
