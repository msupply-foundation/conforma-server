import React, { useState, useEffect } from 'react'
import './App.css'
import {
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  Button,
  Grid,
  TextField,
  Typography,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import evaluateExpression from '@openmsupply/expression-evaluator'
import * as config from './config.json'
import { PostgresInterface } from './postgresInterface'

const looseJSON = require('loose-json')
const graphQLendpoint = config.graphQLendpoint

const pgInterface = new PostgresInterface()

async function fetchNative(url, obj) {
  const result = await fetch(url, obj)
  return result
}

const useStyles = makeStyles((theme) => ({
  margin: {
    margin: theme.spacing(1),
  },
  textField: {
    fontFamily: ['monospace'],
  },
}))

function App() {
  const classes = useStyles()

  const [input, setInput] = useState(
    localStorage.getItem('inputText') || '{ value: "Enter expression here"}'
  )
  const [result, setResult] = useState()
  const [objectsInput, setObjectsInput] = useState(
    localStorage.getItem('objectText') || `{firstName: "Carl", lastName: "Smith"}`
  )
  const [objectArray, setObjectArray] = useState()
  const [isObjectsValid, setIsObjectsValid] = useState(true)
  const [strictJSONInput, setStrictJSONInput] = useState(false)
  const [strictJSONObjInput, setStrictJSONObjInput] = useState(false)

  // Evaluate output whenever input or input objects change
  useEffect(() => {
    let cleanInput
    try {
      cleanInput = looseJSON(input)
    } catch {
      cleanInput = { value: '< Invalid input >' }
    }
    evaluateExpression(cleanInput, {
      objects: objectArray,
      pgConnection: pgInterface,
      graphQLConnection: { fetch: fetchNative, endpoint: graphQLendpoint },
    }).then((result) => {
      const output = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)
      setResult(output)
    })
    localStorage.setItem('inputText', input)
  }, [input, objectsInput])

  // Try and turn object(s) input string into object array
  useEffect(() => {
    let cleanObjectInput
    try {
      cleanObjectInput = looseJSON(objectsInput)
      if (!Array.isArray(cleanObjectInput)) {
        cleanObjectInput = looseJSON(`[${objectsInput}]`)
      }
      setObjectArray(cleanObjectInput)
      setIsObjectsValid(true)
    } catch {
      setObjectArray([])
      setIsObjectsValid(false)
    } finally {
      localStorage.setItem('objectText', objectsInput)
    }
  }, [objectsInput])

  const handleInputChange = (event) => {
    setInput(event.target.value)
  }

  const handleObjectsChange = (event) => {
    setObjectsInput(event.target.value)
  }

  const JSONstringify = (input, compact = false, strict = false) => {
    const indent = compact ? 0 : 2
    try {
      const backtickRe = /`[\s\S]*?`/g
      const backtickSubstitutions = input.match(backtickRe)
      console.log('Backtick sub', backtickSubstitutions)
      const backtickReplacement = !compact ? input.replaceAll(backtickRe, `"@1234@"`) : input
      const inputObject = looseJSON(backtickReplacement)
      const stringified = strict
        ? JSON.stringify(inputObject, null, indent)
        : JSONstringifyLoose(inputObject, compact)
      let output = stringified
      if (backtickSubstitutions) {
        backtickSubstitutions.forEach((sub) => {
          output = output.replace(`"@1234@"`, sub)
        })
      }
      return output
    } catch {
      return false
    }
  }

  const JSONstringifyLoose = (inputObject, compact = false) => {
    const objectString = compact
      ? JSON.stringify(inputObject)
      : JSON.stringify(inputObject, null, 2)
    const regex = /(")([^"]*?)("):/gm
    const replacementString = objectString.replaceAll(regex, '$2:')
    return replacementString
  }

  const prettifyInput = () => {
    const pretty = JSONstringify(input, false, strictJSONInput)
    if (pretty) setInput(pretty)
    else alert('Invalid input')
  }

  const compactInput = () => {
    const compact = JSONstringify(input, true, strictJSONInput)
    if (compact) setInput(compact)
    else alert('Invalid input')
  }

  const prettifyObjects = () => {
    const pretty = JSONstringify(objectsInput, false, strictJSONObjInput)
    if (pretty) setObjectsInput(pretty)
    else alert('Invalid input')
  }

  const compactObjects = () => {
    const compact = JSONstringify(objectsInput, true, strictJSONObjInput)
    if (compact) setObjectsInput(compact)
    else alert('Invalid input')
  }

  return (
    <Grid container>
      <Grid item xs className={classes.margin}>
        <h1>Local state objects</h1>
        <Button
          className={classes.margin}
          variant="contained"
          size="small"
          color="primary"
          onClick={prettifyObjects}
        >
          Prettify
        </Button>
        <Button
          className={classes.margin}
          variant="contained"
          size="small"
          color="primary"
          onClick={compactObjects}
        >
          Compact
        </Button>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              checked={strictJSONObjInput}
              onChange={() => {
                setStrictJSONObjInput(!strictJSONObjInput)
              }}
            />
          }
          label="Quoted field names"
        />
        <TextField
          className={classes.margin}
          id="object-input"
          label="Objects"
          InputProps={{
            classes: { input: classes.textField },
          }}
          multiline
          fullWidth
          spellCheck="false"
          rows={30}
          value={objectsInput}
          variant="outlined"
          onChange={handleObjectsChange}
        />
        {!isObjectsValid && (
          <Typography className="invalid-warning" style={{ color: 'red' }}>
            Invalid object input
          </Typography>
        )}
      </Grid>
      <Grid item xs className={classes.margin}>
        <h1>Input</h1>
        <Button
          className={classes.margin}
          variant="contained"
          size="small"
          color="primary"
          onClick={prettifyInput}
        >
          Prettify
        </Button>
        <Button
          className={classes.margin}
          variant="contained"
          size="small"
          color="primary"
          onClick={compactInput}
        >
          Compact
        </Button>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              checked={strictJSONInput}
              onChange={() => {
                setStrictJSONInput(!strictJSONInput)
              }}
            />
          }
          label="Quoted field names"
        />
        <TextField
          className={classes.margin}
          id="query-input"
          label="Expression"
          spellCheck="false"
          InputProps={{
            classes: { input: classes.textField },
          }}
          multiline
          fullWidth
          rows={30}
          value={input}
          variant="outlined"
          onChange={handleInputChange}
        />
      </Grid>
      <Grid item xs className={classes.margin}>
        <h1>Output</h1>
        <Card className={classes.root} style={{ marginTop: 76 }} variant="outlined">
          <CardContent>
            <Typography variant="body2" component="p">
              <pre>{result}</pre>
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default App
