import { useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useStore } from '@/store'
import { useTranslation } from '@/i18n'

interface SpaceSelectorProps {
  value: string
  onValueChange: (value: string) => void
}

export function SpaceSelector({ value, onValueChange }: SpaceSelectorProps) {
  const { spaces, fetchSpaces } = useStore()
  const { t } = useTranslation()

  useEffect(() => {
    fetchSpaces()
  }, [fetchSpaces])

  return (
    <div className="grid gap-2">
      <Label>{t.common.selectSpace}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={t.common.selectSpace} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_none">{t.common.noSpace}</SelectItem>
          {spaces.map((s) => (
            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
