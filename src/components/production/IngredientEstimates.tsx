import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface IngredientEstimatesProps {
  totalDoughs: number;
}

export function IngredientEstimates({ totalDoughs }: IngredientEstimatesProps) {
  if (totalDoughs <= 0) {
    return null;
  }

  const ingredients = [
    { name: 'Flour', amount: (totalDoughs * 3).toFixed(1), unit: 'lbs' },
    { name: 'Butter', amount: (totalDoughs * 0.75).toFixed(2), unit: 'lbs' },
    { name: 'Sugar', amount: (totalDoughs * 0.5).toFixed(2), unit: 'lbs' },
    { name: 'Eggs', amount: Math.ceil(totalDoughs * 4), unit: 'count' },
    { name: 'Milk', amount: (totalDoughs * 0.5).toFixed(2), unit: 'cups' },
    { name: 'Yeast', amount: (totalDoughs * 0.25).toFixed(2), unit: 'oz' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimated Ingredient Requirements</CardTitle>
        <CardDescription>
          Based on {totalDoughs.toFixed(1)} doughs (approximate)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {ingredients.map((ingredient) => (
            <div
              key={ingredient.name}
              className="p-3 rounded-lg bg-muted/50 text-center"
            >
              <p className="text-sm text-muted-foreground">{ingredient.name}</p>
              <p className="text-lg font-semibold">
                {ingredient.amount}{' '}
                <span className="text-sm font-normal text-muted-foreground">
                  {ingredient.unit}
                </span>
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
