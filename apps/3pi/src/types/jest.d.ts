import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveClass(...classNames: string[]): R
      toHaveAttribute(attr: string, value?: string): R
      toBeDisabled(): R
      toBeRequired(): R
      toHaveValue(value: string | number | string[]): R
      toBeChecked(): R
      toHaveTextContent(text: string | RegExp): R
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R
      toBeEmpty(): R
      toHaveFocus(): R
      toHaveFormValues(expectedValues: Record<string, any>): R
      toHaveStyle(css: string | Record<string, any>): R
      toBeVisible(): R
      toBePartiallyChecked(): R
      toHaveDescription(text?: string | RegExp): R
    }
  }
}

export {}
