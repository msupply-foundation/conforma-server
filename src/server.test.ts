// Test suite for Fastify server endpoints
const fetch = require('node-fetch')
const config = require('./config.json')

// Config
const baseURL = `http://localhost:${config.RESTport}/`

const getRequest = async (url: string) => {
  const response = await fetch(url)
  const data = response.json()
  return data
}

// check-unique endpoint
test('Check unique: username is not unique', () => {
  return getRequest(`${baseURL}check-unique?&type=username&value=nmadruga`).then((result: any) => {
    expect(result).toEqual({ unique: false, message: '' })
  })
})

test('Check unique: username is unique', () => {
  return getRequest(`${baseURL}check-unique?&type=username&value=nicole_m`).then((result: any) => {
    expect(result).toEqual({ unique: true, message: '' })
  })
})

test('Check unique: email is not unique', () => {
  return getRequest(`${baseURL}check-unique?&type=email&value=andrei@sussol.net`).then(
    (result: any) => {
      expect(result).toEqual({ unique: false, message: '' })
    }
  )
})

test('Check unique: email is unique', () => {
  return getRequest(`${baseURL}check-unique?&type=email&value=tony@sussol.net`).then(
    (result: any) => {
      expect(result).toEqual({ unique: true, message: '' })
    }
  )
})

test('Check unique: organisation is not unique', () => {
  return getRequest(`${baseURL}check-unique?&type=organisation&value=Drugs-R-Us`).then(
    (result: any) => {
      expect(result).toEqual({ unique: false, message: '' })
    }
  )
})

test('Check unique: organisation is unique', () => {
  return getRequest(`${baseURL}check-unique?&type=organisation&value=A New Drug Company`).then(
    (result: any) => {
      expect(result).toEqual({ unique: true, message: '' })
    }
  )
})

test('Check unique: Case-insensitivity - not unique, even though case differs from DB', () => {
  return getRequest(`${baseURL}check-unique?&type=email&value=Nicole@SuSSol.net`).then(
    (result: any) => {
      expect(result).toEqual({ unique: false, message: '' })
    }
  )
})

test('Check unique: Returns false when query is invalid (misnamed type field)', () => {
  return getRequest(`${baseURL}check-unique?&typO=email&value=carl@sussol.net`).then(
    (result: any) => {
      expect(result).toEqual({
        unique: false,
        message: 'Type missing or invalid',
      })
    }
  )
})

test('Check unique: Returns false when query is invalid (type is invalid)', () => {
  return getRequest(`${baseURL}check-unique?&type=firstName&value=carl@sussol.net`).then(
    (result: any) => {
      expect(result).toEqual({
        unique: false,
        message: 'Type missing or invalid',
      })
    }
  )
})

test('Check unique: Returns false when value is blank', () => {
  return getRequest(`${baseURL}check-unique?&type=username&value=`).then((result: any) => {
    expect(result).toEqual({
      unique: false,
      message: 'Value not provided',
    })
  })
})

test('Check unique: Returns false when value field not provided', () => {
  return getRequest(`${baseURL}check-unique?&type=username`).then((result: any) => {
    expect(result).toEqual({
      unique: false,
      message: 'Value not provided',
    })
  })
})

// To-do: write tests for database errors
