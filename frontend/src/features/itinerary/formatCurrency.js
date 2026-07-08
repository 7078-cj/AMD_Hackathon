export function formatCurrency(amount, currencyCode) {
  if (amount === undefined || amount === null || amount === '') {
    return ''
  }

  const numericAmount = Number(amount)
  const code = currencyCode || 'USD'

  if (Number.isNaN(numericAmount)) {
    return `${code} ${amount}`
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0,
    }).format(numericAmount)
  } catch {
    return `${code} ${numericAmount.toLocaleString()}`
  }
}
