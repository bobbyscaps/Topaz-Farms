'use client'

import { useQuery } from '@tanstack/react-query'
import { topazService } from '@/lib/services/topazService'

export function useProtocol() {
  return useQuery({
    queryKey: ['topaz', 'protocol'],
    queryFn: () => topazService.getProtocol(),
    refetchInterval: 60_000,
  })
}

export function useFields() {
  return useQuery({
    queryKey: ['topaz', 'fields'],
    queryFn: () => topazService.getFields(),
    refetchInterval: 60_000,
  })
}

export function useTokenPrices() {
  return useQuery({
    queryKey: ['topaz', 'tokens'],
    queryFn: () => topazService.getTokenPrices(),
    refetchInterval: 60_000,
  })
}
