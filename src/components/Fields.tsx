import { useMemo, useState } from 'react'
import { useGauges } from '../hooks/useStats'
import { FieldCard } from './FieldCard'
import type { Gauge } from '../lib/statsApi'

type Filter = 'all' | 'v2-volatile' | 'v2-stable' | 'v3-cl'
type Sort = 'apr' | 'tvl'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All fields' },
  { id: 'v3-cl', label: 'v3 concentrated' },
  { id: 'v2-volatile', label: 'v2 volatile' },
  { id: 'v2-stable', label: 'v2 stable' },
]

export function Fields() {
  const { data, isLoading, isError } = useGauges()
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<Sort>('apr')
  const [search, setSearch] = useState('')

  const fields = useMemo(() => {
    if (!data) return []
    const q = search.trim().toLowerCase()
    return data
      .filter((g: Gauge) => g.alive && Number(g.stakedTvlUsd) > 1)
      .filter((g) => (filter === 'all' ? true : g.poolType === filter))
      .filter((g) =>
        q
          ? `${g.token0Symbol}/${g.token1Symbol}`.toLowerCase().includes(q)
          : true,
      )
      .sort((a, b) =>
        sort === 'apr'
          ? Number(b.totalApr) - Number(a.totalApr)
          : Number(b.stakedTvlUsd) - Number(a.stakedTvlUsd),
      )
  }, [data, filter, sort, search])

  return (
    <section className="fields">
      <div className="section-head">
        <h2>🧑‍🌾 The Fields</h2>
        <p>
          Every Topaz gauge is a field you can farm. Higher leaves = juicier
          yield. Live data refreshes every minute.
        </p>
      </div>

      <div className="fields-toolbar">
        <div className="filter-pills">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`pill${filter === f.id ? ' is-active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="toolbar-right">
          <input
            className="search"
            placeholder="Search pair e.g. WBNB"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
          >
            <option value="apr">Sort: yield</option>
            <option value="tvl">Sort: soil staked</option>
          </select>
        </div>
      </div>

      {isError && (
        <div className="empty">Could not load fields. Try again shortly.</div>
      )}

      {isLoading ? (
        <div className="field-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="field-card skeleton-card" key={i} />
          ))}
        </div>
      ) : (
        <div className="field-grid">
          {fields.map((g) => (
            <FieldCard key={g.gaugeAddress} gauge={g} />
          ))}
        </div>
      )}

      {!isLoading && !isError && fields.length === 0 && (
        <div className="empty">No fields match your filters.</div>
      )}
    </section>
  )
}
