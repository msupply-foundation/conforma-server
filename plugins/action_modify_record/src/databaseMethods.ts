import { DBConnectType } from '../../../src/components/databaseConnect'

const databaseMethods = (DBConnect: any) => ({
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
      UPDATE "${tableName}" SET (${Object.keys(record)})
      = (${DBConnect.getValuesPlaceholders(record)})
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
  createRecord: async (tableName: string, record: { [key: string]: any }) =>
    await createRecord(tableName, record, DBConnect),
  createTable: async (tableName: string) => {
    const text = `CREATE TABLE "${tableName}" ( id serial PRIMARY KEY)`
    console.log('creating table with statement: ', text)
    try {
      await DBConnect.query({
        text,
        value: [tableName],
      })
    } catch (err) {
      console.log(err.message)
      throw new Error(`Filed to create table: ${tableName}`)
    }
  },
  createJoinTableAndRecord: async (tableName: string, applicationId: number, recordId: number) => {
    // Create join table if one doesn't exist
    const joinTableName = `${tableName}_application_join`
    const text = `CREATE TABLE IF NOT EXISTS ${joinTableName}( 
                  id serial PRIMARY KEY, 
                  application_id integer references application(id),
                  ${tableName}_id integer references "${tableName}"(id));`

    console.log('creating join table with statement: ', text)
    try {
      await DBConnect.query({ text })
    } catch (err) {
      console.log(err.message)
      throw new Error(`Filed to create join table: ${joinTableName}`)
    }
    // Create entry in the joiin table
    const joinTableRecord = { application_id: applicationId, [`${tableName}_id`]: recordId }
    await createRecord(joinTableName, joinTableRecord, DBConnect)
  },
  createFields: async (
    tableName: string,
    fieldsToCreate: { fieldName: string; fieldType: string }[]
  ) => {
    const getType = (fieldType: string) => (fieldType === 'object' ? 'jsonb' : 'varchar')
    const newColumns = fieldsToCreate.map(
      ({ fieldName, fieldType }) => `ADD COLUMN "${fieldName}" ${getType(fieldType)}`
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
        `Filed to create fields in table table: ${tableName} ${JSON.stringify(
          fieldsToCreate,
          null,
          ' '
        )}`
      )
    }
  },
})

const createRecord = async (
  tableName: string,
  record: { [key: string]: any },
  DBConnect: DBConnectType
) => {
  const text = `
    INSERT INTO "${tableName}" (${Object.keys(record)}) 
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

export type DatabaseMethodsType = ReturnType<typeof databaseMethods>

export default databaseMethods
