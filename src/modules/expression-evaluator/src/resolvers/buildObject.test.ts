import evaluateExpression from '../evaluateExpression'

test('Testing basic buildObject', () => {
  const testIn = {
    operator: 'buildObject',
    properties: [
      {
        key: 'key',
        value: 'value',
      },
    ],
  }
  const testOut = {
    key: 'value',
  }
  return evaluateExpression(testIn).then((result: any) => {
    expect(result).toEqual(testOut)
  })
})

test('Testing buildObject for handling erronouse input', () => {
  const testIn = {
    operator: 'buildObject',
    properties: [
      {
        value: 'missing key',
      },
      {
        key: 'key',
        value: 'value',
      },
      {},
      {
        key: 'missing value',
      },
    ],
  }
  const testOut = {
    key: 'value',
  }
  return evaluateExpression(testIn).then((result: any) => {
    expect(result).toEqual(testOut)
  })
})

test('Testing buildObject with evaluated key and value', () => {
  const testIn = {
    operator: 'buildObject',
    properties: [
      {
        key: 'key',
        value: 'value',
      },
      {
        key: {
          operator: 'objectProperties',
          children: ['key'],
        },
        value: {
          operator: 'objectProperties',
          children: ['value'],
        },
      },
    ],
  }

  const testOut = {
    key: 'value',
    keyFromObjects: 'valueFromObjects',
  }

  const params = {
    objects: { key: 'keyFromObjects', value: 'valueFromObjects' },
  }

  return evaluateExpression(testIn, params).then((result: any) => {
    expect(result).toEqual(testOut)
  })
})

test('Testing buildObject with evaluations and nesting', () => {
  const testIn = {
    operator: 'buildObject',
    properties: [
      {
        key: 'key',
        value: 'value',
      },
      {
        key: {
          operator: 'objectProperties',
          children: ['key'],
        },
        value: {
          operator: 'buildObject',
          properties: [
            {
              key: 'concatArray',
              value: {
                operator: '+',
                children: [['one'], [2]],
              },
            },
          ],
        },
      },
    ],
  }

  const testOut = {
    key: 'value',
    keyFromObjects: { concatArray: ['one', 2] },
  }

  const params = {
    objects: { key: 'keyFromObjects', value: 'valueFromObjects' },
  }

  return evaluateExpression(testIn, params).then((result: any) => {
    console.log(result)
    expect(result).toEqual(testOut)
  })
})
