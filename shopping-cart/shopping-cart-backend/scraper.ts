import * as cheerio from 'cheerio'

export interface ScrapedProduct {
  title: string
  image: string
  price: string
  store: string
  url: string
}

/// find html text
function readText($: cheerio.CheerioAPI, selectors: string[]): string | undefined {
  for (const selector of selectors) {
    const value = $(selector).first().text().trim()

    if (value) {
      return value
    }
  }

  return undefined
}

/// find html attributes
function readAttr(
  $: cheerio.CheerioAPI,
  selectors: string[],
  attr: string
): string | undefined {
  for (const selector of selectors) {
    const value = $(selector).first().attr(attr)?.trim()

    if (value) {
      return value
    }
  }

  return undefined
}
/// find meta tags
function readMeta($: cheerio.CheerioAPI, names: string[]): string | undefined {
  for (const name of names) {
    const value = $(`meta[property="${name}"], meta[name="${name}"]`)
      .first()
      .attr('content')
      ?.trim()

    if (value) {
      return value
    }
  }

  return undefined
}
// helper to normalize whitespace in strings
function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

// helper to resolve relative URLs 
function absolutizeUrl(value: string, baseUrl: string): string {
  try {
    return new URL(value, baseUrl).toString()
  } catch {
    return value
  }
}
// find json page dta
function findJsonLdProduct($: cheerio.CheerioAPI): Record<string, unknown> | undefined {
  const scripts = $('script[type="application/ld+json"]').toArray()

  for (const script of scripts) {
    const raw = $(script).contents().text()

    if (!raw) {
      continue
    }

    try {
      const parsed = JSON.parse(raw) as unknown
      const candidates = Array.isArray(parsed) ? parsed : [parsed]

      for (const candidate of candidates) {
        if (!candidate || typeof candidate !== 'object') {
          continue
        }

        const item = candidate as Record<string, unknown>
        const graph = item['@graph']
        const graphItems = Array.isArray(graph) ? graph : []
        const product = [item, ...graphItems].find((entry) => {
          if (!entry || typeof entry !== 'object') {
            return false
          }

          const type = (entry as Record<string, unknown>)['@type']
          return Array.isArray(type) ? type.includes('Product') : type === 'Product'
        })

        if (product && typeof product === 'object') {
          return product as Record<string, unknown>
        }
      }
    } catch {
      // Some sites include invalid JSON-LD; fall through to DOM selectors.
    }
  }

  return undefined
}

function jsonLdString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }

  if (Array.isArray(value)) {
    return jsonLdString(value[0])
  }

  if (value && typeof value === 'object') {
    const objectValue = value as Record<string, unknown>
    return jsonLdString(objectValue.url) ?? jsonLdString(objectValue.contentUrl)
  }

  return undefined
}

function jsonLdPrice(product: Record<string, unknown> | undefined): string | undefined {
  if (!product) {
    return undefined
  }

  const offers = product.offers
  const readOffer = Array.isArray(offers) ? offers[0] : offers

  if (!readOffer || typeof readOffer !== 'object') {
    return undefined
  }

  const offer = readOffer as Record<string, unknown>
  return jsonLdString(offer.price) ?? jsonLdString(offer.lowPrice)
}

export async function scrapeProduct(url: string): Promise<ScrapedProduct> {
  let productUrl: URL

  try {
    productUrl = new URL(url)
  } catch {
    throw new Error('Invalid URL. Include the full URL, for example https://example.com/product')
  }

  // Use a realistic User-Agent to avoid being blocked by some websites
  const response = await fetch(productUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
  }
// Look for product data in JSON-LD format first, then fall back to DOM parsing if necessary
  const html = await response.text()
  const $ = cheerio.load(html)
  const jsonLdProduct = findJsonLdProduct($)

  const title =
    jsonLdString(jsonLdProduct?.name) ??
    readMeta($, ['og:title', 'twitter:title']) ??
    readText($, [
      '.product-name',
      '[class*="product-name"]',
      '[data-testid*="product-name"]',
      '[itemprop="name"]',
      'h1'
    ]) ??
    'Unknown Product'

  const rawImage =
    jsonLdString(jsonLdProduct?.image) ??
    readMeta($, ['og:image', 'twitter:image', 'twitter:image:src']) ??
    readAttr(
      $,
      [
        '[itemprop="image"]',
        '.product-detail-main-image img',
        '.product-image img',
        '[class*="product-image"] img',
        'img[alt*="product" i]'
      ],
      'src'
    ) ??
    ''

  const price =
    jsonLdPrice(jsonLdProduct) ??
    readMeta($, [
      'product:price:amount',
      'og:price:amount',
      'twitter:data1'
    ]) ??
    readAttr($, ['[itemprop="price"]', 'meta[itemprop="price"]'], 'content') ??
    readText($, [
      '.white-price',
      '[class*="white-price"]',
      '.price',
      '[class*="price"]',
      '[data-testid*="price"]',
      '[itemprop="price"]'
    ]) ??
    'N/A'

  const store = productUrl.hostname.replace('www.', '')

  return {
    title: normalizeWhitespace(title),
    image: rawImage ? absolutizeUrl(rawImage, productUrl.toString()) : '',
    price: normalizeWhitespace(price),
    store,
    url: productUrl.toString()
  }
}
