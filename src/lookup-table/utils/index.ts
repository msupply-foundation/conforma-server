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

export { toSnakeCase, toCamelCase }
