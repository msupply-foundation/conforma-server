class ValidationErrors extends Error {
  constructor(message: string[]) {
    super(JSON.stringify(message))
    this.name = 'ValidationErrors'
  }
}

export { ValidationErrors }
