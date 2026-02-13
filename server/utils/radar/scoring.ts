/**
 * Radar — Composite Scoring utilities.
 */
import type { ScoreInputs } from './types'

const WEIGHTS = { volume: 0.5, trend: 0.3, rising: 0.2 }

export function computeCompositeScore(inputs: ScoreInputs): number {
  const raw = inputs.monthlyVolume * WEIGHTS.volume
    + inputs.trendScore * WEIGHTS.trend
    + inputs.risingScore * WEIGHTS.rising
  return Math.round(Math.max(0, Math.min(100, raw)))
}

export function normalizeVolume(rawVolume: number): number {
  if (rawVolume <= 0) return 0
  const normalized = (Math.log10(rawVolume) / Math.log10(100000)) * 100
  return Math.round(Math.max(0, Math.min(100, normalized)))
}
