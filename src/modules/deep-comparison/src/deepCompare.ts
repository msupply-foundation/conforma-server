// Value equality comparison for arrays and objects, which can
// be arbitrarily deep. Will also work with primitives.
const deepCompare = (obj1: any, obj2: any, nullEqualsUndefined: boolean = false): boolean => {
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
          if (!deepCompare(obj1[i], obj2[i])) return false
        } else if (!(obj1[i] === obj2[i])) return false
      }
      return true
    case false:
      if (!(obj1 instanceof Object && obj2 instanceof Object)) return false
      if (isArray1 || isArray2) return false // one array slipped through
      // Both objects
      if (!deepCompare(Object.keys(obj1), Object.keys(obj2))) return false
      return deepCompare(Object.values(obj1), Object.values(obj2))
  }
}

export default deepCompare
