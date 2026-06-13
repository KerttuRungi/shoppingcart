import type { Item } from '../types'

interface Props {
  items: Item[]
}

const parsePrice = (price: string): number => {
  const match = price.replace(',', '.').match(/[\d.]+/)
  return match ? parseFloat(match[0]) : NaN
}

export default function CartSummary({ items }: Props) {
  if (items.length === 0) return null

  const total = items.reduce((sum, item) => {
    const n = parsePrice(item.price)
    return isNaN(n) ? sum : sum + n
  }, 0)

  return (
    <div className="flex justify-between items-center text-sm pt-4 border-t border-gray-200 mt-2">
      <span className="text-gray-500">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
      <span className="font-bold text-gray-900">Total: €{total.toFixed(2)}</span>
    </div>
  )
}
