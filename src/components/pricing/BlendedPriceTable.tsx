import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { BlendedPrice } from '@/hooks/pricing';
import { formatCurrency } from '@/utils/formatters';

interface BlendedPriceTableProps {
  data: BlendedPrice[];
}

export function BlendedPriceTable({ data }: BlendedPriceTableProps) {
  const sortedData = [...data].sort((a, b) => b.totalRevenue - a.totalRevenue);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blended Price Analysis</CardTitle>
        <CardDescription>Volume-weighted average prices by product</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Retail Price</TableHead>
              <TableHead className="text-right">Retail Qty</TableHead>
              <TableHead className="text-right">Wholesale Price</TableHead>
              <TableHead className="text-right">Wholesale Qty</TableHead>
              <TableHead className="text-right">Blended Price</TableHead>
              <TableHead className="text-right">Total Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item) => {
              const productName = `${item.size.charAt(0).toUpperCase() + item.size.slice(1)} ${
                item.variety.charAt(0).toUpperCase() + item.variety.slice(1).replace('_', ' ')
              }`;
              
              return (
                <TableRow key={`${item.size}-${item.variety}`}>
                  <TableCell className="font-medium">{productName}</TableCell>
                  <TableCell className="text-right">
                    {item.retailPrice > 0 ? formatCurrency(item.retailPrice) : '-'}
                  </TableCell>
                  <TableCell className="text-right">{item.retailQty || '-'}</TableCell>
                  <TableCell className="text-right">
                    {item.wholesalePrice > 0 ? formatCurrency(item.wholesalePrice) : '-'}
                  </TableCell>
                  <TableCell className="text-right">{item.wholesaleQty || '-'}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(item.blendedPrice)}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(item.totalRevenue)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
