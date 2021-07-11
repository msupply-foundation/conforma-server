import { CustomReplacers, CustomArgs } from './types'

export const replaceCount = (
  pattern: string,
  count: number | string,
  numberFormat: Intl.NumberFormat | undefined
) => {
  const numDigits = pattern.match(/d/g)?.length || 0
  const numString = String(count)
  const paddedNumString = '0'.repeat(Math.max(0, numDigits - numString.length)) + numString
  return escapeLiterals(numberFormat ? numberFormat.format(Number(count)) : paddedNumString)
}

export const replaceCustom = async (
  pattern: string,
  customReplacers: CustomReplacers,
  customArgs: CustomArgs
) => {
  const funcName = pattern.slice(1)
  if (!customReplacers[funcName]) throw new Error('Missing custom replacer function: ' + funcName)
  const result = await customReplacers[funcName](customArgs?.[funcName])
  return escapeLiterals(String(result))
}

export const escapeLiterals = (value: string) =>
  value.replace(/(\.|\+|\*|\?|\^|\$|\(|\)|\[|\]|\{|\}|\||\\)/g, '\\$1')
