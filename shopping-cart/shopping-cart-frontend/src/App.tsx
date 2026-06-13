import { useState, useEffect } from 'react'
import ItemCard from './components/ItemCart'
import type { Item } from './types'

export default function App() {
  const [url, setUrl] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/items')
      .then(r => r.json())
      .then(setItems)
  }, [])

  const addItem = async () => {
    if (!url) return
    setLoading(true)
    setError('')

    try {
      const scraped = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      }).then(r => r.json())

      if (scraped.error) throw new Error(scraped.error)

      const saved = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scraped)
      }).then(r => r.json())

      setItems(prev => [saved, ...prev])
      setUrl('')
    } catch {
      setError('Could not fetch product. Try another URL.')
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (id: string) => {
    await fetch(`/api/items/${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(item => item.id !== id))
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6"> My Shopping List</h1>

      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 border rounded px-3 py-2 text-sm"
          placeholder="Paste a product URL..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addItem()}
        />
        <button
          onClick={addItem}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded text-sm disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="flex flex-col gap-4">
        {items.map(item => (
          <ItemCard key={item.id} item={item} onDelete={deleteItem} />
        ))}
        {items.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-10">
            No items yet — paste a product URL above
          </p>
        )}
      </div>
    </main>
  )
}