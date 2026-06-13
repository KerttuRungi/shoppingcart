import type { Item } from '../types'

export const getItems = (): Promise<Item[]> =>
  fetch('/api/items').then(r => r.json())

export const scrapeItem = (url: string): Promise<Item & { error?: string }> =>
  fetch('/api/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  }).then(r => r.json())

export const saveItem = (item: Item): Promise<Item> =>
  fetch('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  }).then(r => r.json())

export const deleteItem = (id: string): Promise<void> =>
  fetch(`/api/items/${id}`, { method: 'DELETE' }).then(r => r.json())
