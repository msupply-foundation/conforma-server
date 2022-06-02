import { DATA_TABLE_PREFIX } from './modifyRecord'

const databaseMethods = (DBConnect: any) => {
  const createRecord = async (tableName: string, record: { [key: string]: any }) => {
    const text = `
      INSERT INTO "${tableName}" ${getKeys(record)} 
      VALUES (${DBConnect.getValuesPlaceholders(record)})
      RETURNING *
      `
    try {
      const result = await DBConnect.query({ text, values: Object.values(record) })
      const firstRow = result.rows[0]
      return { success: true, [tableName]: firstRow, recordId: firstRow.id }
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  return {
    getRecordId: async (tableName: string, matchField: string, value: any) => {
      const text = `
      SELECT id FROM "${tableName}"
      WHERE "${matchField}" = $1
    `
      try {
        const result = await DBConnect.query({ text, values: [value] })
        return result?.rows[0]?.id || 0
      } catch (err) {
        console.log(err.message)
        throw err
      }
    },
    updateRecord: async (tableName: string, id: string, record: { [key: string]: any }) => {
      const placeholders = DBConnect.getValuesPlaceholders(record)
      const matchValuePlaceholder = `$${placeholders.length + 1}`

      const text = `
      UPDATE "${tableName}" SET ${getKeys(record, true)}
      = (${placeholders})
      WHERE id = ${matchValuePlaceholder}
      RETURNING *
      `
      try {
        const result = await DBConnect.query({
          text,
          values: [...Object.values(record), id],
        })
        return { success: true, [tableName]: result.rows[0] }
      } catch (err) {
        console.log(err.message)
        throw err
      }
    },
    createRecord,
    createTable: async (tableName: string, tableNameOriginal: string) => {
      const text = `CREATE TABLE "${tableName}" ( id serial PRIMARY KEY)`
      console.log('creating table with statement: ', text)
      try {
        await DBConnect.query({
          text,
          value: [tableName],
        })
        // Also register new table in "data" table
        await DBConnect.query({
          text: `INSERT INTO data_table (table_name, display_name) VALUES($1, $2)`,
          values: [tableName.replace(DATA_TABLE_PREFIX, ''), tableNameOriginal],
        })
      } catch (err) {
        console.log(err.message)
        throw new Error(`Failed to create table: ${tableName}`)
      }
    },
    createJoinTableAndRecord: async (
      tableName: string,
      applicationId: number,
      recordId: number
    ) => {
      // Create join table if one doesn't exist
      const joinTableName = `${tableName}_application_join`
      const text = `CREATE TABLE IF NOT EXISTS ${joinTableName}( 
                  id serial PRIMARY KEY, 
                  application_id integer references application(id) ON DELETE CASCADE NOT NULL,
                  ${tableName}_id integer references "${tableName}"(id) ON DELETE CASCADE NOT NULL);`

      console.log('creating join table with statement: ', text)
      try {
        await DBConnect.query({ text })
      } catch (err) {
        console.log(err.message)
        throw new Error(`Failed to create join table: ${joinTableName}`)
      }
      // Create entry in the joiin table
      const joinTableRecord = { application_id: applicationId, [`${tableName}_id`]: recordId }
      await createRecord(joinTableName, joinTableRecord)
    },
    createFields: async (
      tableName: string,
      fieldsToCreate: { fieldName: string; fieldType: string }[]
    ) => {
      const newColumns = fieldsToCreate.map(
        ({ fieldName, fieldType }) => `ADD COLUMN "${fieldName}" ${fieldType}`
      )
      const text = `ALTER TABLE "${tableName}" ${newColumns.join(',')};`
      console.log('creating new columns with statement: ', text)
      try {
        await DBConnect.query({
          text,
          value: [tableName],
        })
      } catch (err) {
        console.log(err.message)
        throw new Error(
          `Failed to create fields in table table: ${tableName} ${JSON.stringify(
            fieldsToCreate,
            null,
            ' '
          )}`
        )
      }
    },
  }
}

const getKeys = (record: { [key: string]: { value: any } }, update = false) => {
  const keys = Object.keys(record)
  const keyString = keys.map((key) => `"${key}"`).join(',')
  // UPDATE with only one field can't have brackets around key
  if (update && keys.length === 1) return keyString
  else return `(${keyString})`
}

export type DatabaseMethodsType = ReturnType<typeof databaseMethods>

export default databaseMethods
