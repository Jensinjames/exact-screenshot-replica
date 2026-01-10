import { useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfQuarter } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface DateRangeFilterProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onDateChange: (start: Date | undefined, end: Date | undefined) => void;
}

type PresetType = 'all' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'custom';

export function DateRangeFilter({ startDate, endDate, onDateChange }: DateRangeFilterProps) {
  const [preset, setPreset] = useState<PresetType>('all');
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const handlePresetChange = (value: PresetType) => {
    setPreset(value);
    const now = new Date();

    switch (value) {
      case 'all':
        onDateChange(undefined, undefined);
        break;
      case 'last7':
        onDateChange(subDays(now, 7), now);
        break;
      case 'last30':
        onDateChange(subDays(now, 30), now);
        break;
      case 'thisMonth':
        onDateChange(startOfMonth(now), now);
        break;
      case 'lastMonth': {
        const lastMonth = subMonths(now, 1);
        onDateChange(startOfMonth(lastMonth), endOfMonth(lastMonth));
        break;
      }
      case 'thisQuarter':
        onDateChange(startOfQuarter(now), now);
        break;
      case 'custom':
        setIsCustomOpen(true);
        break;
    }
  };

  const handleClear = () => {
    setPreset('all');
    onDateChange(undefined, undefined);
  };

  const formatDateRange = () => {
    if (!startDate && !endDate) return 'All Time';
    if (startDate && endDate) {
      return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
    }
    if (startDate) return `From ${format(startDate, 'MMM d, yyyy')}`;
    if (endDate) return `Until ${format(endDate, 'MMM d, yyyy')}`;
    return 'All Time';
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="last7">Last 7 Days</SelectItem>
          <SelectItem value="last30">Last 30 Days</SelectItem>
          <SelectItem value="thisMonth">This Month</SelectItem>
          <SelectItem value="lastMonth">Last Month</SelectItem>
          <SelectItem value="thisQuarter">This Quarter</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {preset === 'custom' && (
        <div className="flex items-center gap-2">
          <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'justify-start text-left font-normal',
                  !startDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'MMM d, yyyy') : 'Start date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  onDateChange(date, endDate);
                }}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <span className="text-muted-foreground">to</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'justify-start text-left font-normal',
                  !endDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'MMM d, yyyy') : 'End date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  onDateChange(startDate, date);
                }}
                disabled={(date) => startDate ? date < startDate : false}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {(startDate || endDate) && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {preset !== 'all' && preset !== 'custom' && (
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {formatDateRange()}
        </span>
      )}
    </div>
  );
}
