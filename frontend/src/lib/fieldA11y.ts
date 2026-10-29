/** Props that tie an input to its FormField label and message. */
export const fieldA11y = (id: string, error?: string) => ({
  id,
  'aria-invalid': error ? true : undefined,
  'aria-describedby': `${id}-msg`,
})
