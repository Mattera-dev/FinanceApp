"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeftIcon } from "lucide-react"
import { Transaction, expenseCategories, incomeCategories } from "@/types/transactions"

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, "id">) => void
  initialData?: Partial<Transaction>
}

export function TransactionForm({ onSubmit, initialData }: TransactionFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    type: initialData?.type || ("expense" as "income" | "expense"),
    amount: initialData?.amount?.toString() || "",
    category: initialData?.category || "",
    description: initialData?.description || "",
    date: initialData?.date || new Date().toISOString().split("T")[0],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.type) {
      newErrors.type = "Tipo é obrigatório"
    }

    if (!formData.amount) {
      newErrors.amount = "Valor é obrigatório"
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = "Valor deve ser um número positivo"
    }

    if (!formData.category) {
      newErrors.category = "Categoria é obrigatória"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória"
    }

    if (!formData.date) {
      newErrors.date = "Data é obrigatória"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const transaction: Omit<Transaction, "id"> = {
        type: formData.type,
        amount: Number(formData.amount),
        category: formData.category,
        description: formData.description.trim(),
        date: formData.date,
      }

      onSubmit(transaction)
      router.push("/dashboard")
    } catch (error) {
      setErrors({ general: "Erro ao salvar transação. Tente novamente." })
    } finally {
      setIsLoading(false)
    }
  }

  const categories = formData.type === "expense" ? expenseCategories : incomeCategories

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2 mb-4">
            <ArrowLeftIcon className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-primary">Nova Transação</h1>
          <p className="text-muted-foreground">Registre uma nova receita ou despesa</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Transação</CardTitle>
            <CardDescription>Preencha os campos abaixo para registrar sua transação</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label>Tipo de Transação</Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={(value: "income" | "expense") => {
                    setFormData((prev) => ({ ...prev, type: value, category: "" }))
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="income" />
                    <Label htmlFor="income" className="text-primary font-medium">
                      Receita
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="expense" />
                    <Label htmlFor="expense" className="text-destructive font-medium">
                      Despesa
                    </Label>
                  </div>
                </RadioGroup>
                {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  className={errors.amount ? "border-destructive" : ""}
                />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  className={errors.date ? "border-destructive" : ""}
                />
                {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva a transação..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className={errors.description ? "border-destructive" : ""}
                  rows={3}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              {errors.general && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Salvando..." : "Salvar Transação"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
