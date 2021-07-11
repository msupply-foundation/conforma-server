import RandExp from 'randexp'
import { replaceCount, replaceCustom } from './helpers'
import { CustomReplacers, GenerateArgs, PatternGeneratorOptions } from './types'

const defaultIncrement = (current: number | string) => Number(current) + 1

function* simpleCounter(init: number) {
  let count = init
  while (true) {
    yield count++
  }
}

// Wrap counter generator in function so getCounter just returns the value, not the whole iterator object
const generatorWrapper = (counter: Generator) => () => counter.next().value

// A "short-hand" function if only one generated string is required
export const patternGen = (pattern: string | RegExp, options: PatternGeneratorOptions = {}) => {
  const pg = new PatternGenerator(pattern, options)
  return pg.gen()
}
class PatternGenerator {
  simpleCounter: Generator
  pattern: string | RegExp
  getCounter: Function
  setCounter: Function | null
  counterIncrement: (input: string | number) => string | number
  internalCounter: number
  numberFormat?: Intl.NumberFormat
  customReplacers: CustomReplacers

  constructor(
    pattern: string | RegExp,
    {
      getCounter,
      setCounter,
      counterIncrement = defaultIncrement,
      counterInit = 1,
      customReplacers = {},
      numberFormat,
    }: PatternGeneratorOptions = {}
  ) {
    this.simpleCounter = simpleCounter(counterInit)
    this.getCounter = getCounter ?? generatorWrapper(this.simpleCounter)
    this.setCounter = setCounter ?? null
    this.pattern = pattern
    this.counterIncrement = counterIncrement
    this.internalCounter = counterInit
    this.numberFormat = numberFormat
    this.customReplacers = customReplacers
  }
  // Generate new string
  async gen(args: GenerateArgs = {}) {
    const { shouldIncrement = true, customArgs = {} } = args
    // Increment counter
    const newCount = shouldIncrement ? await this.getCounter() : this.internalCounter
    this.internalCounter = newCount
    if (this.setCounter) await this.setCounter(this.counterIncrement(newCount))

    // Handle pattern
    const patternRegex: RegExp =
      typeof this.pattern === 'string' ? new RegExp(this.pattern) : this.pattern
    const { source, flags } = patternRegex
    let newSource = source
    const matches = Array.from(source.matchAll(new RegExp('<(.+?)>', 'g')))
    for (const match of matches) {
      const fullMatchString = match[0]
      const captureGroup = match[1]
      const operator = captureGroup[0]
      // Replace counters
      if (operator === '+') {
        const replacementCounter = replaceCount(captureGroup, newCount, this.numberFormat)
        newSource = newSource.replace(fullMatchString, replacementCounter)
      }
      // Custom Replacers
      else if (operator === '?') {
        const replacementString = await replaceCustom(
          captureGroup,
          this.customReplacers,
          customArgs
        )
        newSource = newSource.replace(fullMatchString, replacementString)
      }
    }
    const randexpPattern = new RegExp(newSource, flags)
    return new RandExp(randexpPattern).gen()
  }
}

export default PatternGenerator
