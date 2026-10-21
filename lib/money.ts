export function formatInr(amount: number) {
  const negative = amount < 0
  const [whole, fraction] = Math.abs(amount).toFixed(2).split('.')
  const grouped = whole.replace(/(\d)(?=(\d{2})+\d$)/g, '$1,')
  return `${negative ? '−' : ''}₹${grouped}.${fraction}`
}
