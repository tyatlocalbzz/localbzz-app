import { useState, useMemo } from 'react'
import { format, subMonths, startOfMonth, endOfMonth, subDays } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useClientDocuments } from '@/hooks/useClientDocuments'
import { ClientDocumentsTable } from './ClientDocumentsTable'

interface ClientDocumentsViewProps {
  clientId: string
}

type DatePreset = 'all' | 'last30' | 'last90' | 'thisMonth' | 'lastMonth' | 'custom'

const PRESET_LABELS: Record<DatePreset, string> = {
  all: 'All Time',
  last30: 'Last 30 Days',
  last90: 'Last 90 Days',
  thisMonth: 'This Month',
  lastMonth: 'Last Month',
  custom: 'Custom Range',
}

export function ClientDocumentsView({ clientId }: ClientDocumentsViewProps) {
  const [preset, setPreset] = useState<DatePreset>('all')
  const [customStart, setCustomStart] = useState<Date | undefined>()
  const [customEnd, setCustomEnd] = useState<Date | undefined>()

  // Calculate date range based on preset
  const { startDate, endDate } = useMemo(() => {
    const now = new Date()

    switch (preset) {
      case 'last30':
        return { startDate: subDays(now, 30), endDate: now }
      case 'last90':
        return { startDate: subDays(now, 90), endDate: now }
      case 'thisMonth':
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) }
      case 'lastMonth': {
        const lastMonth = subMonths(now, 1)
        return { startDate: startOfMonth(lastMonth), endDate: endOfMonth(lastMonth) }
      }
      case 'custom':
        return { startDate: customStart || null, endDate: customEnd || null }
      case 'all':
      default:
        return { startDate: null, endDate: null }
    }
  }, [preset, customStart, customEnd])

  const { data: documents = [], isLoading } = useClientDocuments({
    clientId,
    startDate,
    endDate,
  })

  const handlePresetChange = (newPreset: DatePreset) => {
    setPreset(newPreset)
    if (newPreset !== 'custom') {
      setCustomStart(undefined)
      setCustomEnd(undefined)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Preset Buttons */}
        {(Object.keys(PRESET_LABELS) as DatePreset[])
          .filter((p) => p !== 'custom')
          .map((p) => (
            <Button
              key={p}
              variant={preset === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePresetChange(p)}
            >
              {PRESET_LABELS[p]}
            </Button>
          ))}

        {/* Custom Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={preset === 'custom' ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'justify-start text-left font-normal',
                preset === 'custom' && customStart && customEnd && 'min-w-[200px]'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {preset === 'custom' && customStart && customEnd ? (
                <>
                  {format(customStart, 'MMM d')} - {format(customEnd, 'MMM d, yyyy')}
                </>
              ) : (
                'Custom Range'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex">
              <div className="p-3 border-r">
                <p className="text-xs text-muted-foreground mb-2">Start Date</p>
                <Calendar
                  mode="single"
                  selected={customStart}
                  onSelect={(date) => {
                    setCustomStart(date)
                    setPreset('custom')
                  }}
                  initialFocus
                />
              </div>
              <div className="p-3">
                <p className="text-xs text-muted-foreground mb-2">End Date</p>
                <Calendar
                  mode="single"
                  selected={customEnd}
                  onSelect={(date) => {
                    setCustomEnd(date)
                    setPreset('custom')
                  }}
                  disabled={(date) => customStart ? date < customStart : false}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground">
        {isLoading ? (
          'Loading...'
        ) : (
          <>
            {documents.length} document{documents.length !== 1 ? 's' : ''} found
            {startDate && endDate && preset !== 'all' && (
              <span className="ml-1">
                ({format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')})
              </span>
            )}
          </>
        )}
      </div>

      {/* Documents Table */}
      <div className="border rounded-lg overflow-hidden">
        <ClientDocumentsTable documents={documents} isLoading={isLoading} />
      </div>
    </div>
  )
}
