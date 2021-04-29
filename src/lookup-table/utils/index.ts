import { FieldMapType } from '../types'

const toSnakeCase = (str: any) => {
  return (
    str &&
    str!
      .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)!
      .map((x: any) => x.toLowerCase())
      .join('_')
  )
}

const toCamelCase = (text: string) => {
  text = text.replace(/[-_\s.]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
  return text.substr(0, 1).toLowerCase() + text.substr(1)
}

const mergeFieldMapsByProperty = (
  fieldMapOne: FieldMapType[],
  fieldMapTwo: FieldMapType[],
  propertyToMergeBy: string
): FieldMapType[] => {
  const mergedFieldMaps: FieldMapType[] = [...fieldMapOne, ...fieldMapTwo]
  const finalFieldMap = mergedFieldMaps.reduce(
    (accumulator: FieldMapType[], currentFieldMap: FieldMapType) =>
      accumulator.some(
        (tempFieldMap: FieldMapType) =>
          tempFieldMap[propertyToMergeBy as keyof FieldMapType] ===
          currentFieldMap[propertyToMergeBy as keyof FieldMapType]
      )
        ? accumulator
        : [...accumulator, currentFieldMap],
    []
  )
  return finalFieldMap
}

function comparerFieldMaps(otherArray: FieldMapType[], propertyToCompareBy: string) {
  return function (current: FieldMapType) {
    return (
      otherArray.filter(function (other) {
        return (
          other[propertyToCompareBy as keyof FieldMapType] ===
          current[propertyToCompareBy as keyof FieldMapType]
        )
      }).length == 0
    )
  }
}

export { toSnakeCase, toCamelCase, mergeFieldMapsByProperty, comparerFieldMaps }
