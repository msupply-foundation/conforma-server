export const parseEnv = (input: string) => {
  const output: Record<string, string> = {}
  const lines = input.split('\n')
  lines.forEach((line) => {
    const match = /^([A-Z_0-9]+)=(?:'|")?(.+?)(?:'|")?$/g.exec(line)
    if (match) {
      output[match[1]] = match[2]
    }
  })
  return output
}
