"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Building2, 
  Camera, 
  Upload,
  X,
  Save,
  Mail,
  Phone,
  MapPin,
  CheckCircle2
} from "lucide-react"

export default function PerfilPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const barbeariaInputRef = useRef<HTMLInputElement>(null)
  const barbeiroInputRef = useRef<HTMLInputElement>(null)

  const [perfilBarbeiro, setPerfilBarbeiro] = useState({
    nome: "Carlos Silva",
    email: "carlos@barberpro.com",
    telefone: "(11) 99999-9999",
    cargo: "Barbeiro Sênior",
    especialidades: "Corte degradê, barba, pigmentação, corte navalhado",
    foto: null as string | null
  })

  const [perfilBarbearia, setPerfilBarbearia] = useState({
    nome: "Barbearia Premium",
    descricao: "A melhor experiência em corte masculino da região. Ambiente sofisticado e profissionais qualificados.",
    telefone: "(11) 3333-3333",
    email: "contato@barbeariapremium.com",
    endereco: "Rua das Flores, 123",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01234-567",
    foto: null as string | null
  })

  const handleImageUpload = (
    type: "barbeiro" | "barbearia", 
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (type === "barbeiro") {
          setPerfilBarbeiro(prev => ({ ...prev, foto: reader.result as string }))
        } else {
          setPerfilBarbearia(prev => ({ ...prev, foto: reader.result as string }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e da barbearia</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="barbeiro" className="space-y-6">
        <TabsList className="bg-secondary/50 p-1">
          <TabsTrigger value="barbeiro" className="gap-2 data-[state=active]:bg-background">
            <User className="size-4" />
            Meu Perfil
          </TabsTrigger>
          <TabsTrigger value="barbearia" className="gap-2 data-[state=active]:bg-background">
            <Building2 className="size-4" />
            Barbearia
          </TabsTrigger>
        </TabsList>

        {/* Perfil do Barbeiro */}
        <TabsContent value="barbeiro" className="space-y-6">
          <div className="p-6 rounded-xl bg-card border border-border">
            <h2 className="text-lg font-semibold mb-6">Informações Pessoais</h2>

            {/* Foto */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pb-6 border-b border-border">
              <div 
                onClick={() => barbeiroInputRef.current?.click()}
                className="relative size-28 rounded-full border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer overflow-hidden group bg-secondary/30 shrink-0"
              >
                {perfilBarbeiro.foto ? (
                  <>
                    <img 
                      src={perfilBarbeiro.foto} 
                      alt="Foto do barbeiro" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="size-6 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                    <User className="size-8 mb-1" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">Foto de Perfil</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Esta foto será exibida para seus clientes
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => barbeiroInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="size-4" />
                    Enviar foto
                  </Button>
                  {perfilBarbeiro.foto && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPerfilBarbeiro(prev => ({ ...prev, foto: null }))}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
              <input
                ref={barbeiroInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload("barbeiro", e)}
              />
            </div>

            {/* Campos */}
            <div className="grid gap-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input
                    id="nome"
                    value={perfilBarbeiro.nome}
                    onChange={(e) => setPerfilBarbeiro(prev => ({ ...prev, nome: e.target.value }))}
                    className="h-11 bg-secondary/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo / Função</Label>
                  <Input
                    id="cargo"
                    value={perfilBarbeiro.cargo}
                    onChange={(e) => setPerfilBarbeiro(prev => ({ ...prev, cargo: e.target.value }))}
                    className="h-11 bg-secondary/50 border-border"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailBarbeiro">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="emailBarbeiro"
                      type="email"
                      value={perfilBarbeiro.email}
                      onChange={(e) => setPerfilBarbeiro(prev => ({ ...prev, email: e.target.value }))}
                      className="h-11 bg-secondary/50 border-border pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefoneBarbeiro">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="telefoneBarbeiro"
                      value={perfilBarbeiro.telefone}
                      onChange={(e) => setPerfilBarbeiro(prev => ({ ...prev, telefone: e.target.value }))}
                      className="h-11 bg-secondary/50 border-border pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="especialidades">Especialidades</Label>
                <Textarea
                  id="especialidades"
                  value={perfilBarbeiro.especialidades}
                  onChange={(e) => setPerfilBarbeiro(prev => ({ ...prev, especialidades: e.target.value }))}
                  className="min-h-24 bg-secondary/50 border-border resize-none"
                  placeholder="Descreva suas especialidades..."
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Perfil da Barbearia */}
        <TabsContent value="barbearia" className="space-y-6">
          <div className="p-6 rounded-xl bg-card border border-border">
            <h2 className="text-lg font-semibold mb-6">Informações da Barbearia</h2>

            {/* Foto da Barbearia */}
            <div className="mb-8 pb-6 border-b border-border">
              <Label className="mb-3 block">Foto da Barbearia</Label>
              <div 
                onClick={() => barbeariaInputRef.current?.click()}
                className="relative w-full h-48 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer overflow-hidden group bg-secondary/30"
              >
                {perfilBarbearia.foto ? (
                  <>
                    <img 
                      src={perfilBarbearia.foto} 
                      alt="Barbearia" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="size-8 text-white" />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPerfilBarbearia(prev => ({ ...prev, foto: null }))
                      }}
                      className="absolute top-3 right-3 size-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                    <Upload className="size-8 mb-2" />
                    <span className="text-sm font-medium">Clique para enviar</span>
                    <span className="text-xs">PNG, JPG até 5MB</span>
                  </div>
                )}
              </div>
              <input
                ref={barbeariaInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload("barbearia", e)}
              />
            </div>

            {/* Campos da Barbearia */}
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="nomeBarbearia">Nome da Barbearia</Label>
                <Input
                  id="nomeBarbearia"
                  value={perfilBarbearia.nome}
                  onChange={(e) => setPerfilBarbearia(prev => ({ ...prev, nome: e.target.value }))}
                  className="h-11 bg-secondary/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={perfilBarbearia.descricao}
                  onChange={(e) => setPerfilBarbearia(prev => ({ ...prev, descricao: e.target.value }))}
                  className="min-h-24 bg-secondary/50 border-border resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailBarbearia">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="emailBarbearia"
                      type="email"
                      value={perfilBarbearia.email}
                      onChange={(e) => setPerfilBarbearia(prev => ({ ...prev, email: e.target.value }))}
                      className="h-11 bg-secondary/50 border-border pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefoneBarbearia">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="telefoneBarbearia"
                      value={perfilBarbearia.telefone}
                      onChange={(e) => setPerfilBarbearia(prev => ({ ...prev, telefone: e.target.value }))}
                      className="h-11 bg-secondary/50 border-border pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="endereco"
                    value={perfilBarbearia.endereco}
                    onChange={(e) => setPerfilBarbearia(prev => ({ ...prev, endereco: e.target.value }))}
                    className="h-11 bg-secondary/50 border-border pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={perfilBarbearia.cidade}
                    onChange={(e) => setPerfilBarbearia(prev => ({ ...prev, cidade: e.target.value }))}
                    className="h-11 bg-secondary/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={perfilBarbearia.estado}
                    onChange={(e) => setPerfilBarbearia(prev => ({ ...prev, estado: e.target.value }))}
                    className="h-11 bg-secondary/50 border-border"
                  />
                </div>
                <div className="space-y-2 col-span-3 sm:col-span-1">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={perfilBarbearia.cep}
                    onChange={(e) => setPerfilBarbearia(prev => ({ ...prev, cep: e.target.value }))}
                    className="h-11 bg-secondary/50 border-border"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4 mt-6 pt-6 border-t border-border">
        {saved && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <CheckCircle2 className="size-4" />
            Alterações salvas
          </div>
        )}
        <Button onClick={handleSave} disabled={isLoading} className="gap-2">
          {isLoading ? (
            <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              <Save className="size-4" />
              Salvar alterações
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
