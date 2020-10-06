export const deepEquality = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true // primitive value check
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
      if (obj1 === obj2) return true // null check
      if (isArray1 || isArray2) return false // one array slipped through
      // Both objects
      const keys1 = Object.keys(obj1)
      const keys2 = Object.keys(obj2)
      if (!deepEquality(keys1, keys2)) return false
      const values1 = Object.values(obj1)
      const values2 = Object.values(obj2)
      return deepEquality(values1, values2)
  }
}
