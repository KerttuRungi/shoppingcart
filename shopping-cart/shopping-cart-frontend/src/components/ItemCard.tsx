import { X, ExternalLink, ImageOff } from 'lucide-react'
import type { Item } from '../types'

interface Props {
  item: Item
  onDelete: (id: string) => void
}

export default function ItemCard({ item, onDelete }: Props) {
  return (
    <div className="flex gap-4 items-center border-b border-gray-400 py-3">
      {item.image ? (
        <img
          src={item.image}
          alt={item.title}
          className="w-20 h-20 object-cover shrink-0"
        />
      ) : (
        <div className="w-20 h-20 shrink-0 bg-gray-100 flex items-center justify-center text-gray-300">
          <ImageOff size={28} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate text-gray-900">{item.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{item.store}</p>
        {item.price !== 'N/A' ? (
          <p className="text-sm font-bold mt-1.5 text-gray-900">€{item.price}</p>
        ) : (
          <p className="text-xs mt-1.5 text-gray-400 italic">Price unavailable</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5 items-center shrink-0">
        <button
          onClick={() => onDelete(item.id)}
          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          title="Remove item"
        >
          <X size={16} />
        </button>
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="p-1.5 rounded-lg text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-colors"
          title="View product page"
        >
          <ExternalLink size={16} />
        </a>
      </div>
    </div>
  )
}