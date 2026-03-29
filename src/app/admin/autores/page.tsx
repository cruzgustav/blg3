'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Trash2,
  Edit,
  Search,
  User,
  Mail,
  Image as ImageIcon,
  X,
  Check,
  Loader2,
} from 'lucide-react'

interface Author {
  id: string
  email: string
  name: string
  avatar: string | null
  createdAt: string
  _count?: { articles: number }
}

export default function AutoresPage() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Form state
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formAvatar, setFormAvatar] = useState('')

  const fetchAuthors = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/admins')
      const data = await res.json()
      setAuthors(data.admins || [])
    } catch (error) {
      console.error('Erro ao carregar autores:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAuthors()
  }, [fetchAuthors])

  const resetForm = () => {
    setFormName('')
    setFormEmail('')
    setFormPassword('')
    setFormAvatar('')
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formName.trim() || !formEmail.trim()) {
      alert('Nome e email são obrigatórios')
      return
    }

    if (!editingId && !formPassword.trim()) {
      alert('Senha é obrigatória para novo autor')
      return
    }

    setSaving(true)
    try {
      const url = editingId 
        ? `/api/admin/admins/${editingId}`
        : '/api/admin/admins'
      
      const body = editingId 
        ? { name: formName, avatar: formAvatar || null, ...(formPassword && { password: formPassword }) }
        : { name: formName, email: formEmail, password: formPassword, avatar: formAvatar || null }

      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (res.ok) {
        resetForm()
        fetchAuthors()
      } else {
        alert(data.error || 'Erro ao salvar autor')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar autor')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (author: Author) => {
    setFormName(author.name)
    setFormEmail(author.email)
    setFormPassword('')
    setFormAvatar(author.avatar || '')
    setEditingId(author.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o autor "${name}"?`)) return

    try {
      const res = await fetch(`/api/admin/admins/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchAuthors()
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao excluir autor')
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
    }
  }

  const filteredAuthors = authors.filter(author =>
    author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    author.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold heading-title">Autores</h1>
          <p className="text-muted-foreground">
            Gerencie os autores do blog
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Autor
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar autores..."
          className="pl-9"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card className="border-accent/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              {editingId ? 'Editar Autor' : 'Novo Autor'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome *</label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Nome do autor"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    disabled={!!editingId}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {editingId ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
                </label>
                <Input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder={editingId ? "•••••••• (opcional)" : "••••••••"}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">URL do Avatar</label>
                <div className="flex gap-2">
                  <Input
                    value={formAvatar}
                    onChange={(e) => setFormAvatar(e.target.value)}
                    placeholder="https://..."
                  />
                  {formAvatar && (
                    <img 
                      src={formAvatar} 
                      alt="Preview" 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {editingId ? 'Atualizar' : 'Criar Autor'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Authors List */}
      <div className="grid gap-4">
        {filteredAuthors.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {searchQuery ? 'Nenhum autor encontrado' : 'Nenhum autor cadastrado'}
            </CardContent>
          </Card>
        ) : (
          filteredAuthors.map((author) => (
            <Card key={author.id} className="hover:border-accent/30 transition-colors">
              <CardContent className="flex items-center gap-4 py-4">
                {/* Avatar */}
                {author.avatar ? (
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-lg">
                    {author.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{author.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {author.email}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(author)}
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(author.id, author.name)}
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
