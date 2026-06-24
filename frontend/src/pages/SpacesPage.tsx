import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Lock, Globe, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStore } from '@/store'
import { useTranslation } from '@/i18n'
import { pb } from '@/lib/pocketbase'

export default function SpacesPage() {
  const { spaces, fetchSpaces, addSpace, deleteSpace, setActiveSpace } = useStore()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<'private' | 'public'>('private')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchSpaces()
  }, [fetchSpaces])

  function validate(): boolean {
    var errs: Record<string, string> = {}
    if (!name) errs.name = t.validation.required
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleCreate() {
    if (!validate()) return
    await addSpace(name, type)
    setName('')
    setType('private')
    setErrors({})
    setOpen(false)
  }

  function enterSpace(spaceId: string) {
    setActiveSpace(spaceId)
    navigate('/dashboard')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.common.selectSpace}</h1>
          <p className="text-muted-foreground">{t.common.selectSpace}</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          {t.common.createSpace}
        </Button>
      </div>

      {spaces.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{t.common.noSpace}</p>
            <Button variant="outline" className="mt-4" onClick={() => setOpen(true)}>
              {t.common.createSpace}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {spaces.map((s) => {
            const isOwner = s.created_by === pb.authStore.record?.id
            const memberCount = s.members?.length ?? 1
            return (
              <Card key={s.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => enterSpace(s.id)}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {s.type === 'public' ? <Globe className="size-4 text-muted-foreground" /> : <Lock className="size-4 text-muted-foreground" />}
                    {s.name}
                  </CardTitle>
                  {isOwner && (
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={function(e) { e.stopPropagation(); deleteSpace(s.id) }}>
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="size-4" />
                    <span>{memberCount} {memberCount === 1 ? 'membro' : 'membri'}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.common.createSpace}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t.common.spaceName}</Label>
              <Input value={name} onChange={(e) => { setName(e.target.value); setErrors({}) }} placeholder={t.common.spaceName} />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label>{t.common.selectSpace}</Label>
              <Select value={type} onValueChange={(v) => setType(v as 'private' | 'public')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Privato</SelectItem>
                  <SelectItem value="public">Pubblico</SelectItem>
                </SelectContent>
              </Select>
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
