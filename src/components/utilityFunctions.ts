import path from 'path'

// Determines the folder of the main entry file, as opposed to the
// project root. Needed for components that traverse the local directory
// structure (e.g. fileHandler, registerPlugins), as the project
// root changes its relative path once built.
export function getAppRootDir() {
  const serverRoot = String(require.main?.filename)
  return path.dirname(serverRoot)
}
