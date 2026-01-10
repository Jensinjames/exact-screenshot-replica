import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { SimulatedPrice } from '@/hooks/pricing/usePricingSimulator';
import type { CakeSize, CakeVariety } from '@/types/database';
import { cn } from '@/lib/utils';

interface ProductPriceEditorProps {
  price: SimulatedPrice;
  onUpdate: (
    size: CakeSize,
    variety: CakeVariety,
    field: 'retailPrice' | 'wholesalePrice',
    value: number
  ) => void;
}

const formatProductName = (size: CakeSize, variety: CakeVariety) => {
  const sizeLabel = size.charAt(0).toUpperCase() + size.slice(1);
  const varietyLabel = variety
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return `${sizeLabel} ${varietyLabel}`;
};

export function ProductPriceEditor({ price, onUpdate }: ProductPriceEditorProps) {
  const handleIncrement = (field: 'retailPrice' | 'wholesalePrice', step: number) => {
    const currentValue = price[field];
    const newValue = Number((currentValue + step).toFixed(2));
    onUpdate(price.size, price.variety, field, newValue);
  };

  const handleInputChange = (field: 'retailPrice' | 'wholesalePrice', value: string) => {
    const numValue = parseFloat(value) || 0;
    onUpdate(price.size, price.variety, field, numValue);
  };

  const retailChanged = price.retailPrice !== price.originalRetailPrice;
  const wholesaleChanged = price.wholesalePrice !== price.originalWholesalePrice;

  return (
    <div className="grid grid-cols-[1fr,auto,auto] gap-4 items-center py-3 border-b last:border-b-0">
      <div className="font-medium text-sm">
        {formatProductName(price.size, price.variety)}
      </div>

      {/* Retail Price */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground w-14">Retail:</span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => handleIncrement('retailPrice', -0.25)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={price.retailPrice.toFixed(2)}
            onChange={(e) => handleInputChange('retailPrice', e.target.value)}
            className={cn(
              "w-20 h-7 text-sm pl-5 text-right",
              retailChanged && "border-primary bg-primary/5"
            )}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => handleIncrement('retailPrice', 0.25)}
        >
          <Plus className="h-3 w-3" />
        </Button>
        {retailChanged && (
          <span className="text-xs text-muted-foreground ml-1">
            was ${price.originalRetailPrice.toFixed(2)}
          </span>
        )}
      </div>

      {/* Wholesale Price */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground w-14">Wholesale:</span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => handleIncrement('wholesalePrice', -0.25)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={price.wholesalePrice.toFixed(2)}
            onChange={(e) => handleInputChange('wholesalePrice', e.target.value)}
            className={cn(
              "w-20 h-7 text-sm pl-5 text-right",
              wholesaleChanged && "border-primary bg-primary/5"
            )}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => handleIncrement('wholesalePrice', 0.25)}
        >
          <Plus className="h-3 w-3" />
        </Button>
        {wholesaleChanged && (
          <span className="text-xs text-muted-foreground ml-1">
            was ${price.originalWholesalePrice.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}
