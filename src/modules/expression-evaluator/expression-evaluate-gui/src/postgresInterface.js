export class PostgresInterface {
  query = async (expression) => {
    const { text, values, rowMode } = expression
    const valuesQuery = values ? `&values=${values}` : ''
    const rowModeQuery = rowMode ? `&rowMode=${rowMode}` : ''
    const url = `http://localhost:3001/pg-query?text=${text}${valuesQuery}${rowModeQuery}`
    const result = await fetch(url)
    return result.json()
  }
}
