import { DateTime } from 'luxon'
import DBConnect from '../database/databaseConnect'
import { errorMessage } from '../utilityFunctions'

const isManualCleanup: boolean = process.argv[2] === '--staleApplications'

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
    }, {} as { [code: string]: { id: number; days: number | null }[] })

    for (const code of Object.keys(groupedTemplates)) {
      console.log('Processing template code:', code)
      const staleApplications = []
      const templates = groupedTemplates[code]
      for (const template of templates) {
        if (template.days === null) {
          console.log(` - Skipping template id ${template.id} (no retention time set)`)
          continue
        }

        const stale = await DBConnect.getStaleApplications(template.id, template.days)
        staleApplications.push(...stale)
      }
      if (staleApplications.length === 0) {
        console.log(' - No stale applications found')
        continue
      }

      console.log(` - Deleting ${staleApplications.length} stale applications...`)
      const staleIds = staleApplications.map((app) => app.id)
      const deletedIds = await DBConnect.deleteApplications(staleIds)
      console.log(`   Deleted ${deletedIds.length} applications`)
    }
    console.log('Stale application cleanup -- Done!\n')
  } catch (err) {
    console.log('ERROR', errorMessage(err))
  }
}

// Manually launch cleanup with command `yarn staleApplications`
if (isManualCleanup) {
  cleanupStaleApplications().then(() => {
    process.exit(0)
  })
}

export default cleanupStaleApplications
