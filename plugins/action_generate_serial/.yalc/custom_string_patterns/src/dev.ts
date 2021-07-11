import Pattern, { patternGen } from './patterns'
import { generatePlates } from './customCounters'

const y = new Pattern(/xxx xtreme dragon warrior <+number> xxx/i, { counterInit: 5 })

const runY = async () => {
  for (let i = 1; i < 10; i++) {
    console.log(await y.gen())
    console.log(await y.gen())
    console.log(await y.gen({ shouldIncrement: false }))
  }
}

// runY()

function* twoCounter(init: number) {
  let count = init - 2
  while (true) {
    yield (count += 2)
  }
}

const f = (counter: Generator) => () => counter.next().value

const getNum2Inc = f(twoCounter(1))

const f1 = () => '_JUST TEXT_'
const f2 = async (n: number) => n * 2

const p = new Pattern(/xxx <+dd> xtreme dragon<?f1> warrior <+ddd>_<?f2> xxx/i, {
  getCounter: getNum2Inc,
  //   numberFormat: new Intl.NumberFormat('en-US', { minimumSignificantDigits: 4 }),
  customReplacers: {
    f1,
    f2,
  },
})

const runP = async () => {
  for (let i = 1; i < 10; i++) {
    console.log(await p.gen({ customArgs: { f2: i } }))
  }
}

runP()

const getPlate = f(generatePlates('ZZQ100'))
const plates = new Pattern('<+plate>', { getCounter: getPlate })
const runPlates = async () => {
  for (let i = 1; i < 10000; i++) {
    const plate = await plates.gen()
    if (plate === 'undefined') break
    console.log(plate)
  }
}

// runPlates()

// Shorthand syntax when only used once
// patternGen(/[A-Z]{3}-<+dddd>/).then((result) => console.log('OUTPUT', result))
