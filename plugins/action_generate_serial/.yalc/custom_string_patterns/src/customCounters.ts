/*
Sequential Generator to return NZ-style registration plates
*/

export function* generatePlates(init: string = 'AAA100') {
  if (!init.match(/[A-Z]{3}[1-9][0-9]{2}/)) throw new Error('Incorrect registration plate format')
  let plate = init
  while (plate !== 'ZZZ999') {
    const letters = plate.slice(0, 3)
    const number = Number(plate.slice(3, 6))
    const shouldIncrementLetters = number === 999
    const newNumber = shouldIncrementLetters ? 100 : number + 1
    let [char1, char2, char3] = Array.from(letters).map((letter) => letter.charCodeAt(0))
    if (shouldIncrementLetters) {
      if (char3 === 90) {
        char3 = 65
        char2++
        if (char2 === 91) {
          char2 = 65
          char1++
        }
      } else char3++
    }
    plate = [char1, char2, char3].map((code) => String.fromCharCode(code)).join('') + newNumber
    yield plate
  }
}
