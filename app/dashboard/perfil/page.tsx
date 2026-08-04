"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Save,
  Mail,
  Phone,
  MapPin,
  Loader2,
  Lock,
  Shield,
  Building2,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getProfileData,
  updateBarbershopProfile,
  updatePassword,
} from "@/lib/actions/profile"

export default function PerfilPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)

  // Dados
  const [email, setEmail] = useState("")
  const [shopName, setShopName] = useState("")
  const [shopPhone, setShopPhone] = useState("")
  const [shopAddress, setShopAddress] = useState("")

  // Dialog de senha
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    const result = await getProfileData()
    if (result.success) {
      setEmail(result.data.user.email)
      setShopName(result.data.barbershop.name)
      setShopPhone(result.data.barbershop.phone ?? "")
      setShopAddress(result.data.barbershop.address ?? "")
    } else {
      toast({ title: "Erro ao carregar perfil", description: result.error, variant: "destructive" })
    }
    setLoading(false)
  }, [toast])

  useEffect(() => { loadProfile() }, [loadProfile])

  const handleSaveProfile = async () => {
    if (!shopName.trim()) {
      toast({ title: "Nome obrigatório", description: "O nome da barbearia não pode estar vazio.", variant: "destructive" })
      return
    }
    setSavingProfile(true)
    const result = await updateBarbershopProfile({ name: shopName.trim(), phone: shopPhone.trim(), address: shopAddress.trim() })
    if (result.success) toast({ title: "Perfil salvo!", description: "Informações atualizadas com sucesso." })
    else toast({ title: "Erro ao salvar", description: result.error, variant: "destructive" })
    setSavingProfile(false)
  }

  const handleSavePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "Senha muito curta", description: "A senha precisa ter pelo menos 6 caracteres.", variant: "destructive" })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Senhas não conferem", description: "A confirmação está diferente da nova senha.", variant: "destructive" })
      return
    }
    setSavingPassword(true)
    const result = await updatePassword(newPassword)
    if (result.success) {
      toast({ title: "Senha atualizada!", description: "Sua senha foi alterada com sucesso." })
      setNewPassword("")
      setConfirmPassword("")
      setPasswordDialogOpen(false)
    } else {
      toast({ title: "Erro ao atualizar senha", description: result.error, variant: "destructive" })
    }
    setSavingPassword(false)
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) { setNewPassword(""); setConfirmPassword(""); setShowNewPwd(false); setShowConfirmPwd(false) }
    setPasswordDialogOpen(open)
  }

  const passwordStrength = (() => {
    if (!newPassword) return null
    if (newPassword.length < 6) return { level: "weak", label: "Muito curta", color: "bg-red-500" }
    if (newPassword.length < 10) return { level: "medium", label: "Razoável", color: "bg-yellow-500" }
    return { level: "strong", label: "Forte", color: "bg-green-500" }
  })()

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Carregando perfil...
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground">Informações da sua conta e barbearia</p>
      </div>

      {/* Card: Barbearia */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            <CardTitle className="text-base font-medium">Informações da Barbearia</CardTitle>
          </div>
          <CardDescription>Dados exibidos para seus clientes na página de agendamento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shopName">Nome da Barbearia</Label>
            <Input
              id="shopName"
              value={shopName}
              onChange={e => setShopName(e.target.value)}
              className="bg-secondary/50 border-border"
              placeholder="Nome da sua barbearia"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shopPhone">Telefone / WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="shopPhone"
                  value={shopPhone}
                  onChange={e => setShopPhone(e.target.value)}
                  className="pl-9 bg-secondary/50 border-border"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>E-mail da conta</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input value={email} readOnly className="pl-9 bg-secondary/30 border-border text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shopAddress">Endereço</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="shopAddress"
                value={shopAddress}
                onChange={e => setShopAddress(e.target.value)}
                className="pl-9 bg-secondary/50 border-border"
                placeholder="Rua, número, bairro, cidade"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button onClick={handleSaveProfile} disabled={savingProfile} className="gap-2">
              {savingProfile ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Salvar Informações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card: Segurança */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-primary" />
            <CardTitle className="text-base font-medium">Segurança</CardTitle>
          </div>
          <CardDescription>Gerencie o acesso à sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-secondary flex items-center justify-center">
                <KeyRound className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Senha</p>
                <p className="text-xs text-muted-foreground">Última atualização desconhecida</p>
              </div>
            </div>
            <Dialog open={passwordDialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Lock className="size-3.5" />
                  Alterar senha
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <KeyRound className="size-5 text-primary" />
                    Alterar Senha
                  </DialogTitle>
                  <DialogDescription>
                    Escolha uma senha segura com pelo menos 6 caracteres.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  {/* Nova senha */}
                  <div className="space-y-2">
                    <Label htmlFor="newPwd">Nova senha</Label>
                    <div className="relative">
                      <Input
                        id="newPwd"
                        type={showNewPwd ? "text" : "password"}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pr-10 bg-secondary/50 border-border"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPwd(!showNewPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNewPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {/* Indicador de força */}
                    {passwordStrength && (
                      <div className="space-y-1">
                        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${
                            passwordStrength.level === "weak" ? "w-1/3" :
                            passwordStrength.level === "medium" ? "w-2/3" : "w-full"
                          }`} />
                        </div>
                        <p className={`text-xs font-medium ${
                          passwordStrength.level === "weak" ? "text-red-500" :
                          passwordStrength.level === "medium" ? "text-yellow-500" : "text-green-500"
                        }`}>{passwordStrength.label}</p>
                      </div>
                    )}
                  </div>

                  {/* Confirmação */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPwd">Confirmar nova senha</Label>
                    <div className="relative">
                      <Input
                        id="confirmPwd"
                        type={showConfirmPwd ? "text" : "password"}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pr-10 bg-secondary/50 border-border"
                        autoComplete="new-password"
                        onKeyDown={e => e.key === "Enter" && handleSavePassword()}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-destructive">As senhas não conferem</p>
                    )}
                    {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                      <p className="text-xs text-green-500">✓ Senhas conferem</p>
                    )}
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => handleDialogClose(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSavePassword} disabled={savingPassword} className="gap-2">
                    {savingPassword ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
                    Confirmar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
