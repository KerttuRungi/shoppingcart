import type { Item } from '../types'

interface Props {
  item: Item
  onDelete: (id: string) => void
}

export default function ItemCard({ item, onDelete }: Props) {
  return (
    <div className="flex gap-4 border rounded p-3 items-center">
      {item.image && (
        <img
          src={item.image}
          alt={item.title}
          className="w-20 h-20 object-cover rounded"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.title}</p>
        <p className="text-xs text-gray-500">{item.store}</p>
        <p className="text-sm font-bold mt-1">
          {item.price !== 'N/A' ? `€${item.price}` : 'Price unavailable'}
        </p>
      </div>
      <div className="flex flex-col gap-2 items-end">
        <button
          onClick={() => onDelete(item.id)}
          className="text-red-500 text-xs hover:underline"
        >
          Remove
        </button>
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 text-xs hover:underline"
        >
          View
        </a>
      </div>
    </div>
  )
}