import { ApiError } from '../../ApiError'
import databaseConnect from '../database/databaseConnect'
import { Claims, filterApplicantClaims } from './applicantClaims'

const EDITABLE_STATUSES = ['DRAFT', 'CHANGES_REQUIRED']

const getApplicantClaims = async (auth: Claims): Promise<Claims> => {
  const { rows } = await databaseConnect.query({
    text: `SELECT id FROM permission_policy WHERE type = 'APPLY'`,
  })
  return filterApplicantClaims(auth, rows.map(({ id }) => id))
}

/**
 * Checks the caller is the applicant for this application (by the same RLS
 * rules GraphQL applies) and that it's in a status they can edit. Admins
 * bypass RLS, as they do in GraphQL. Throws an ApiError otherwise; an
 * application the caller can't apply for is reported as not found, so the
 * endpoint doesn't reveal which serials exist. Returns the checked serial.
 */
export const checkApplicationAccess = async (
  auth: Claims,
  serial: string | undefined
): Promise<string> => {
  if (!serial) throw new ApiError('Missing "applicationSerial"', 400)

  const query = {
    text: `SELECT a.id, application_status(a) AS status FROM application a WHERE a.serial = $1`,
    values: [serial],
  }
  const { rows } = auth.isAdmin
    ? await databaseConnect.query(query)
    : await databaseConnect.queryAsUser(await getApplicantClaims(auth), query)

  if (rows.length === 0) throw new ApiError('Application not found', 404)
  if (!EDITABLE_STATUSES.includes(rows[0].status))
    throw new ApiError(`Application ${serial} can't be edited (status ${rows[0].status})`, 409)
  return serial
}
