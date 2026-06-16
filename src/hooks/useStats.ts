import { useQuery } from '@tanstack/react-query'
import {
  fetchProtocolStats,
  fetchGauges,
  fetchTokenPrices,
} from '../lib/statsApi'

export function useProtocolStats() {
  return useQuery({
    queryKey: ['topaz', 'protocol'],
    queryFn: fetchProtocolStats,
    refetchInterval: 60_000,
  })
}

export function useGauges() {
  return useQuery({
    queryKey: ['topaz', 'gauges'],
    queryFn: fetchGauges,
    refetchInterval: 60_000,
  })
}

export function useTokenPrices() {
  return useQuery({
    queryKey: ['topaz', 'tokens'],
    queryFn: fetchTokenPrices,
    refetchInterval: 60_000,
  })
}
