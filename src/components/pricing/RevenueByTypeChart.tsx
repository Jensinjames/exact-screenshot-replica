import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { RevenueByType } from '@/hooks/pricing';
import { formatCurrency } from '@/utils/formatters';

interface RevenueByTypeChartProps {
  data: RevenueByType[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))'];

export function RevenueByTypeChart({ data }: RevenueByTypeChartProps) {
  const chartData = data.map(item => ({
    name: item.type === 'retail' ? 'Retail' : 'Wholesale',
    value: item.revenue,
    percentage: item.percentage,
    orders: item.orderCount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Customer Type</CardTitle>
        <CardDescription>Retail vs Wholesale revenue distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {data.map((item, index) => (
            <div key={item.type} className="text-center">
              <div
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: COLORS[index] }}
              />
              <span className="font-medium capitalize">{item.type}</span>
              <p className="text-2xl font-bold mt-1">{formatCurrency(item.revenue)}</p>
              <p className="text-sm text-muted-foreground">{item.orderCount} orders</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
