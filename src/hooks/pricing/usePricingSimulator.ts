import { useState, useMemo, useCallback } from 'react';
import type { BlendedPrice } from './usePricingAnalytics';
import type { CakeSize, CakeVariety } from '@/types/database';

export interface SimulatedPrice {
  size: CakeSize;
  variety: CakeVariety;
  retailPrice: number;
  wholesalePrice: number;
  originalRetailPrice: number;
  originalWholesalePrice: number;
}

export interface SimulatorProductResult {
  size: CakeSize;
  variety: CakeVariety;
  retailQty: number;
  wholesaleQty: number;
  currentRevenue: number;
  projectedRevenue: number;
  difference: number;
  percentChange: number;
}

export interface SimulatorResult {
  currentTotalRevenue: number;
  projectedTotalRevenue: number;
  totalDifference: number;
  totalPercentChange: number;
  productResults: SimulatorProductResult[];
}

export interface UsePricingSimulatorProps {
  blendedPrices: BlendedPrice[];
}

export function usePricingSimulator({ blendedPrices }: UsePricingSimulatorProps) {
  const [simulatedPrices, setSimulatedPrices] = useState<SimulatedPrice[]>([]);

  // Initialize simulated prices from blended prices
  const initializePrices = useCallback(() => {
    const prices: SimulatedPrice[] = blendedPrices.map(bp => ({
      size: bp.size,
      variety: bp.variety,
      retailPrice: bp.retailPrice,
      wholesalePrice: bp.wholesalePrice,
      originalRetailPrice: bp.retailPrice,
      originalWholesalePrice: bp.wholesalePrice,
    }));
    setSimulatedPrices(prices);
  }, [blendedPrices]);

  // Update a single product's prices
  const updatePrice = useCallback((
    size: CakeSize,
    variety: CakeVariety,
    field: 'retailPrice' | 'wholesalePrice',
    value: number
  ) => {
    setSimulatedPrices(prev => 
      prev.map(p => 
        p.size === size && p.variety === variety
          ? { ...p, [field]: Math.max(0, value) }
          : p
      )
    );
  }, []);

  // Apply percentage adjustment to all prices
  const applyPercentageAdjustment = useCallback((
    percentage: number,
    target: 'retail' | 'wholesale' | 'all'
  ) => {
    setSimulatedPrices(prev => 
      prev.map(p => {
        const multiplier = 1 + (percentage / 100);
        return {
          ...p,
          retailPrice: target === 'wholesale' ? p.retailPrice : Number((p.originalRetailPrice * multiplier).toFixed(2)),
          wholesalePrice: target === 'retail' ? p.wholesalePrice : Number((p.originalWholesalePrice * multiplier).toFixed(2)),
        };
      })
    );
  }, []);

  // Reset to original prices
  const resetPrices = useCallback(() => {
    setSimulatedPrices(prev => 
      prev.map(p => ({
        ...p,
        retailPrice: p.originalRetailPrice,
        wholesalePrice: p.originalWholesalePrice,
      }))
    );
  }, []);

  // Calculate results
  const results = useMemo((): SimulatorResult => {
    const productResults: SimulatorProductResult[] = simulatedPrices.map(sp => {
      const blended = blendedPrices.find(
        bp => bp.size === sp.size && bp.variety === sp.variety
      );

      if (!blended) {
        return {
          size: sp.size,
          variety: sp.variety,
          retailQty: 0,
          wholesaleQty: 0,
          currentRevenue: 0,
          projectedRevenue: 0,
          difference: 0,
          percentChange: 0,
        };
      }

      const currentRevenue = blended.totalRevenue;
      const projectedRevenue = 
        (blended.retailQty * sp.retailPrice) + 
        (blended.wholesaleQty * sp.wholesalePrice);
      const difference = projectedRevenue - currentRevenue;
      const percentChange = currentRevenue > 0 
        ? (difference / currentRevenue) * 100 
        : 0;

      return {
        size: sp.size,
        variety: sp.variety,
        retailQty: blended.retailQty,
        wholesaleQty: blended.wholesaleQty,
        currentRevenue,
        projectedRevenue,
        difference,
        percentChange,
      };
    });

    const currentTotalRevenue = productResults.reduce((sum, r) => sum + r.currentRevenue, 0);
    const projectedTotalRevenue = productResults.reduce((sum, r) => sum + r.projectedRevenue, 0);
    const totalDifference = projectedTotalRevenue - currentTotalRevenue;
    const totalPercentChange = currentTotalRevenue > 0 
      ? (totalDifference / currentTotalRevenue) * 100 
      : 0;

    return {
      currentTotalRevenue,
      projectedTotalRevenue,
      totalDifference,
      totalPercentChange,
      productResults,
    };
  }, [simulatedPrices, blendedPrices]);

  const hasChanges = useMemo(() => 
    simulatedPrices.some(p => 
      p.retailPrice !== p.originalRetailPrice || 
      p.wholesalePrice !== p.originalWholesalePrice
    ),
    [simulatedPrices]
  );

  return {
    simulatedPrices,
    results,
    hasChanges,
    initializePrices,
    updatePrice,
    applyPercentageAdjustment,
    resetPrices,
  };
}
