import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { RevenueByProduct } from '@/hooks/pricing';
import { formatCurrency } from '@/utils/formatters';

interface RevenueByProductChartProps {
  data: RevenueByProduct[];
}

export function RevenueByProductChart({ data }: RevenueByProductChartProps) {
  // Group by size and aggregate
  const groupedData = data.reduce((acc, item) => {
    const existing = acc.find(a => a.size === item.size);
    if (existing) {
      existing.revenue += item.revenue;
      existing.quantity += item.quantity;
    } else {
      acc.push({ size: item.size, revenue: item.revenue, quantity: item.quantity });
    }
    return acc;
  }, [] as { size: string; revenue: number; quantity: number }[]);

  const chartData = groupedData.map(item => ({
    name: item.size.charAt(0).toUpperCase() + item.size.slice(1),
    revenue: item.revenue,
    quantity: item.quantity,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Product Size</CardTitle>
        <CardDescription>Revenue and quantity breakdown by cake size</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis 
                yAxisId="left" 
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => `$${value}`}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => [
                  name === 'revenue' ? formatCurrency(value) : value,
                  name === 'revenue' ? 'Revenue' : 'Quantity'
                ]}
              />
              <Legend />
              <Bar 
                yAxisId="left" 
                dataKey="revenue" 
                fill="hsl(var(--primary))" 
                name="Revenue"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                yAxisId="right" 
                dataKey="quantity" 
                fill="hsl(var(--secondary))" 
                name="Quantity"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
