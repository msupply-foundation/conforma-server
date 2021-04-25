const config = {
  snapshotName: 'current',
  snapshotsRootDir: 'database/snapshots/',
  includeTimestamps: true,
  includeFiles: false,
  filesLocation: 'files',
  snapshotFilesFolder: 'files',
  profileName: 'default',
  profileLocation: 'database/snapshotProfiles',
  profile: require('../snapshotProfiles/default.json'),
  seperator: '########### MUTATION END ###########',
}

exports.config = config
