import { DateTime } from 'luxon'
import DBConnect from '../database/databaseConnect'
import { errorMessage } from '../utilityFunctions'

const isManualCleanup: Boolean = process.argv[2] === '--staleApplications'

export const cleanupStaleApplications = async () => {
  try {
    console.log(
      DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
      'Cleaning up stale draft applications...'
    )
    const templates = await DBConnect.getAllTemplatesRetentionTimes()
    const groupedTemplates = templates.reduce((acc, template) => {
      const code = template.code
      if (!acc[code]) acc[code] = []
      acc[code].push({ id: template.id, days: template.stale_draft_retention_days })
      return acc
    }, {} as { [code: string]: { id: number; days: number }[] })

    for (const code of Object.keys(groupedTemplates)) {
      console.log('Processing template code:', code)
      const staleApplications = []
      const templates = groupedTemplates[code]
      for (const template of templates) {
        const stale = await DBConnect.getStaleApplications(template.id, template.days)
        staleApplications.push(...stale)
      }
      console.log(` - Found ${staleApplications.length} stale applications`)
    }
  } catch (err) {
    console.log('ERROR', errorMessage(err))
  }
}

// Manually launch cleanup with command `yarn staleApplications`
if (isManualCleanup) {
  cleanupStaleApplications().then(() => {
    console.log('Stale application cleanup -- Done!\n')
    process.exit(0)
  })
}

export default cleanupStaleApplications
