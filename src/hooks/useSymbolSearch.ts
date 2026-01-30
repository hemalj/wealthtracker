import { useState, useEffect, useMemo } from 'react'
import type { SymbolEntry, SymbolOption } from '@/types/symbol.types'

// Module-level cache: loaded once, shared across all component instances
let symbolCache: SymbolEntry[] | null = null
let loadPromise: Promise<SymbolEntry[]> | null = null

async function loadSymbols(): Promise<SymbolEntry[]> {
  if (symbolCache) return symbolCache
  if (loadPromise) return loadPromise

  loadPromise = import('@/data/symbols.json').then((module) => {
    symbolCache = module.default as SymbolEntry[]
    return symbolCache
  })

  return loadPromise
}

function mapToOption(entry: SymbolEntry): SymbolOption {
  return {
    code: entry.c,
    name: entry.n,
    exchange: entry.e,
    type: entry.t,
    currency: entry.cu,
    label: `${entry.c} - ${entry.n} (${entry.e})`,
  }
}

export function useSymbolSearch(inputValue: string, maxResults = 20) {
  const [symbols, setSymbols] = useState<SymbolEntry[]>(symbolCache ?? [])
  const [isLoading, setIsLoading] = useState(!symbolCache)

  useEffect(() => {
    if (symbolCache) {
      setSymbols(symbolCache)
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    loadSymbols().then((data) => {
      if (!cancelled) {
        setSymbols(data)
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const options = useMemo((): SymbolOption[] => {
    const query = inputValue.trim().toUpperCase()
    if (!query || symbols.length === 0) {
      return []
    }

    const exactMatches: SymbolEntry[] = []
    const prefixMatches: SymbolEntry[] = []
    const nameMatches: SymbolEntry[] = []

    for (const entry of symbols) {
      const code = entry.c.toUpperCase()
      const name = entry.n.toUpperCase()

      if (code === query) {
        exactMatches.push(entry)
      } else if (code.startsWith(query)) {
        prefixMatches.push(entry)
      } else if (name.includes(query)) {
        nameMatches.push(entry)
      }

      // Early exit once we have enough candidates
      if (exactMatches.length + prefixMatches.length + nameMatches.length >= maxResults * 2) {
        break
      }
    }

    const combined = [...exactMatches, ...prefixMatches, ...nameMatches]
    return combined.slice(0, maxResults).map(mapToOption)
  }, [inputValue, symbols, maxResults])

  return { options, isLoading }
}
