import React, { useEffect, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ICreateTransactionBody, ITransaction, expenseCategories, incomeCategories
} from "@/types/transactions";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ICreateTransactionBody, id?: string) => Promise<void>;
  initialData?: ITransaction | null;
}

export function TransactionModal({ isOpen, onClose, onSubmit, initialData }: TransactionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "",
    description: "",
    date: new Date(),
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        type: (initialData.type as "income" | "expense") || "expense",
        amount: (initialData.amount / 100).toString(),
        category: initialData.category,
        description: initialData.title,
        date: new Date(initialData.date),
      });
    } else if (!isOpen) {
      setFormData({
        type: "expense",
        amount: "",
        category: "",
        description: "",
        date: new Date(),
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) newErrors.type = "Tipo é obrigatório";
    if (!formData.amount) newErrors.amount = "Valor é obrigatório";
    else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) newErrors.amount = "Valor deve ser um número positivo";
    if (!formData.category) newErrors.category = "Categoria é obrigatória";
    if (!formData.description.trim()) newErrors.description = "Descrição é obrigatória";
    if (!formData.date) newErrors.date = "Data é obrigatória";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const transaction: ICreateTransactionBody = {
        type: formData.type as "income" | "expense",
        amount: Number(formData.amount),
        category: formData.category,
        title: formData.description.trim(),
        date: formData.date,
      };

      await onSubmit(transaction, initialData?.id);

    } catch (error) {
      setErrors({ general: "Erro ao salvar transação. Tente novamente." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (type: "income" | "expense") => {
    setFormData((prev) => ({ ...prev, type, category: "" }));
  };

  const categories = formData.type === "expense" ? expenseCategories : incomeCategories;
  const isEditing = !!initialData;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Transação" : "Nova Transação"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifique os detalhes da transação selecionada."
              : "Preencha os detalhes para adicionar uma nova transação."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Tipo de Transação</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.type === "income" ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleTypeChange("income")}
              >
                Receita
              </Button>
              <Button
                type="button"
                variant={formData.type === "expense" ? "destructive" : "outline"}
                className="flex-1"
                onClick={() => handleTypeChange("expense")}
              >
                Despesa
              </Button>
            </div>
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
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !formData.date && "text-muted-foreground",
                    errors.date && "border-destructive"
                  )}
                >
                  {formData.date ? (
                    format(formData.date, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && setFormData((prev) => ({ ...prev, date }))}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva a transação..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          {errors.general && (
            <Alert variant="destructive">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" variant="default" disabled={isLoading}>
              {isLoading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Salvar Transação"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}