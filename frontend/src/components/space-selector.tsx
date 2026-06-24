import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { useStore } from '@/store'
import { useTranslation } from '@/i18n'

interface SpaceSelectorProps {
  value: string
  onValueChange: (value: string) => void
}

export function SpaceSelector({ value, onValueChange }: SpaceSelectorProps) {
  const { spaces, fetchSpaces, addSpace } = useStore()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    fetchSpaces()
  }, [fetchSpaces])

  async function handleCreate() {
    if (!name) return
    const space = await addSpace(name, 'private')
    onValueChange(space.id)
    setName('')
    setOpen(false)
  }

  return (
    <div className="grid gap-2">
      <Label>{t.common.selectSpace}</Label>
      <div className="flex gap-2">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={t.common.selectSpace} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">{t.common.noSpace}</SelectItem>
            {spaces.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.common.createSpace}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t.common.spaceName}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.common.spaceName} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t.app.cancel}</Button>
            <Button onClick={handleCreate}>{t.app.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
