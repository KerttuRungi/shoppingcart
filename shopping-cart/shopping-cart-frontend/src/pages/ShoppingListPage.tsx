import { useState, useEffect } from 'react'
import ItemCard from '../components/ItemCard'
import type { Item } from '../types'
import { getItems, scrapeItem, saveItem, deleteItem } from '../routes/items'
import CartSummary from '../components/CartSummary'

export default function ShoppingListPage() {
  const [url, setUrl] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getItems().then(setItems)
  }, [])

  const addItem = async () => {
    if (!url) return
    setLoading(true)
    setError('')

    try {
      const scraped = await scrapeItem(url)

      if (scraped.error) throw new Error(scraped.error)

      const saved = await saveItem(scraped)

      setItems(prev => [saved, ...prev])
      setUrl('')
    } catch {
      setError('Could not fetch product. Try another URL.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteItem(id)
    setItems(prev => prev.filter(item => item.id !== id))
  }

  return (
    <main className="max-w-2xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-10"> Shopping list</h1>

      <div className="flex gap-2 mb-4 border border-gray-300 rounded-xl p-2">
        <input
          className="flex-1 px-3 text-sm outline-none"
          placeholder="Paste a product URL..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addItem()}
        />
        <button
          onClick={addItem}
          disabled={loading}
          className="bg-black text-white px-4 py-1 rounded-xl text-sm disabled:opacity-50 hover:cursor-pointer"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="flex flex-col gap-4">
        {items.map(item => (
          <ItemCard key={item.id} item={item} onDelete={handleDelete} />
        ))}
        {items.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-10">
            No items yet — paste a product URL above
          </p>
        )}
      </div>
      <div className="mt-6">
        <CartSummary items={items} />
      </div>
    </main>
  )
}
