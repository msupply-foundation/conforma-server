import path from 'path'

// Determines the folder of the main entry file, as opposed to the
// project root. Needed for components that traverse the local directory
// structure (e.g. fileHandler, registerPlugins), as the project
// root changes its relative path once built.
export function getAppRootDir() {
  const serverRoot = String(require.main?.filename)
  return path.dirname(serverRoot)
}

// Value equality comparison for arrays and objects, which can
// be arbitrarily deep. Will also work with primitives.
export const deepEquality = (
  obj1: any,
  obj2: any,
  nullEqualsUndefined: boolean = false
): boolean => {
  if (obj1 === obj2) return true // primitive value check
  if (
    nullEqualsUndefined &&
    (obj1 === null || obj1 === undefined) &&
    (obj2 === null || obj2 === undefined)
  )
    return true
  const isArray1 = Array.isArray(obj1)
  const isArray2 = Array.isArray(obj2)
  switch (isArray1 && isArray2) {
    case true:
      // Both arrays
      if (obj1.length !== obj2.length) return false
      for (let i = 0; i < obj1.length; i++) {
        if (obj1[i] instanceof Object && obj2[i] instanceof Object) {
          if (!deepEquality(obj1[i], obj2[i])) return false
        } else if (!(obj1[i] === obj2[i])) return false
      }
      return true
    case false:
      if (!(obj1 instanceof Object && obj2 instanceof Object)) return false
      if (isArray1 || isArray2) return false // one array slipped through
      // Both objects
      if (!deepEquality(Object.keys(obj1), Object.keys(obj2))) return false
      return deepEquality(Object.values(obj1), Object.values(obj2))
  }
}
