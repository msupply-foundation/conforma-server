export type ApplicationOutcome = 'Pending' | 'Approved' | 'Rejected'

const databaseMethods = (DBConnect: any) => ({
  setApplicationOutcome: async (appId: number, outcome: ApplicationOutcome): Promise<boolean> => {
    // Note: There is a trigger in Postgres DB that automatically updates the `is_active` field to False when outcome is set to "Approved" or "Rejected"
    const text = 'UPDATE application SET outcome = $1  WHERE id = $2'
    try {
      await DBConnect.query({ text, values: [outcome, appId] })
      return true
    } catch (err) {
      console.log(err.stack)
      return false
    }
  },
})

export default databaseMethods
