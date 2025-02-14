import chalk from 'chalk'
import getSuggestions from './suggestions'

const color = {
  error: chalk.hex('#ff8383'),
  errorLight: chalk.hex('#ffd3d3'),
  success: chalk.greenBright,
  highlight: chalk.yellowBright,
  subdued: chalk.hex('#999'),
}

const spaced = string => `\n\n${string}\n`
const warning = string => color.error(`✕ ${string}`)

const inOut = (input, output) =>
  `${color.success('✓')} ${input} ${color.success(JSON.stringify(output))}`

const logNoVariant = (variant, validVariants) =>
  spaced(
    `${warning(`The variant “${variant}:” was not found`)}\n\n${Object.entries(
      validVariants
    )
      .map(
        ([k, v]) =>
          `${k}\n${v
            .map(
              (item, index) =>
                `${
                  v.length > 6 && index % 6 === 0 && index > 0 ? '\n' : ''
                }${color.highlight(item)}:`
            )
            .join(color.subdued(' / '))}`
      )
      .join('\n\n')}`
  )

const logNotAllowed = ({ className, error }) =>
  spaced(warning(`${color.errorLight(`${className}`)} ${error}`))

const logBadGood = (bad, good) =>
  `${color.error('✕ Bad:')} ${bad}\n${color.success('✓ Good:')} ${good}`

const logGeneralError = error => spaced(warning(error))

const debug = (className, log) => console.log(inOut(className, log))

const formatSuggestions = (suggestions, lineLength = 0, maxLineLength = 60) =>
  suggestions
    .map((s, index) => {
      lineLength = lineLength + `${s.target}${s.value}`.length
      const divider =
        lineLength > maxLineLength
          ? '\n'
          : index !== suggestions.length - 1
          ? color.subdued(' / ')
          : ''
      if (lineLength > maxLineLength) lineLength = 0
      return `${color.highlight(s.target)}${
        s.value ? color.subdued(` [${s.value}]`) : ''
      }${divider}`
    })
    .join('')

const logNoClass = properties => {
  const {
    pieces: { classNameRawNoVariants },
  } = properties

  const text = warning(
    `${
      classNameRawNoVariants
        ? color.errorLight(classNameRawNoVariants)
        : 'Class'
    } was not found`
  )

  return text
}

const errorSuggestions = properties => {
  const {
    state: { hasSuggestions },
  } = properties

  const textNotFound = logNoClass(properties)

  if (!hasSuggestions) return spaced(textNotFound)

  const suggestions = getSuggestions(properties)
  if (suggestions.length === 0) return spaced(textNotFound)

  if (typeof suggestions === 'string')
    return spaced(
      `${textNotFound}\n\nDid you mean ${color.highlight(suggestions)}?`
    )

  const suggestionText =
    suggestions.length === 1
      ? `Did you mean ${color.highlight(suggestions.shift().target)}?`
      : `Try one of these classes:\n${formatSuggestions(suggestions)}`

  return spaced(`${textNotFound}\n\n${suggestionText}`)
}

export {
  logNoVariant,
  logNoClass,
  logNotAllowed,
  logBadGood,
  logGeneralError,
  debug,
  errorSuggestions,
}
