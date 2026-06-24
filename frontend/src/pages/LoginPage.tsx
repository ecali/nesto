import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, register, isAuthenticated } = useAuth()
  const { t } = useTranslation()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true })
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password, name)
      }
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.auth.loginError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="size-4 rounded-full bg-primary" />
            <CardTitle className="text-2xl">Nesto</CardTitle>
          </div>
          <CardDescription>
            {mode === 'login' ? t.auth.loginTitle : t.auth.registerTitle}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name">{t.auth.name}</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mario Rossi" required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mario@esempio.it" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.auth.password}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.app.loading : mode === 'login' ? t.auth.login : t.auth.register}
            </Button>
            <p className="text-sm text-muted-foreground">
              {mode === 'login' ? (
                <>{t.auth.noAccount} <button type="button" onClick={() => setMode('register')} className="text-primary underline cursor-pointer">{t.auth.signUp}</button></>
              ) : (
                <>{t.auth.haveAccount} <button type="button" onClick={() => setMode('login')} className="text-primary underline cursor-pointer">{t.auth.login}</button></>
              )}
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
