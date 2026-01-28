'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import type { Expense, ExpenseCategory } from '@/lib/types';
import { PlusCircle, Edit, Trash, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, serverTimestamp } from 'firebase/firestore';
import { format, toDate, parse } from 'date-fns';

const expenseCategories: ExpenseCategory[] = ['Salaires', 'Marketing', 'Maintenance', 'Fournitures', 'Services publics', 'Autre'];

function toDateSafe(date: any): Date {
  if (date && typeof date.toDate === 'function') {
    return date.toDate();
  }
  return toDate(date);
}

export default function ExpensesPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const expensesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'expenses'));
  }, [firestore]);
  const { data: expenses } = useCollection<Expense>(expensesQuery);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory | ''>('');
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setSelectedExpense(null);
    setDescription('');
    setAmount('');
    setCategory('');
    setDate(new Date());
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (expense: Expense) => {
    setDialogMode('edit');
    setSelectedExpense(expense);
    setDescription(expense.description);
    setAmount(String(expense.amount));
    setCategory(expense.category);
    setDate(toDateSafe(expense.date));
    setDialogOpen(true);
  };
  
  const handleDelete = (expenseId: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'expenses', expenseId));
    toast({
      title: 'Dépense Supprimée',
      description: 'La dépense a été retirée de la liste.',
    });
  };

  const handleSave = () => {
    if (!description || !amount || !category || !date || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Informations Manquantes',
        description: 'Veuillez remplir tous les champs.',
      });
      return;
    }
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue)) {
      toast({
        variant: 'destructive',
        title: 'Montant Invalide',
        description: 'Veuillez entrer un montant numérique valide.',
      });
      return;
    }
    
    const expenseData = {
      description,
      amount: amountValue,
      category: category as ExpenseCategory,
      date,
    };

    if (dialogMode === 'add') {
      addDocumentNonBlocking(collection(firestore, 'expenses'), expenseData);
      toast({
        title: 'Dépense Ajoutée',
        description: `La dépense a été enregistrée.`,
      });
    } else if (dialogMode === 'edit' && selectedExpense) {
      updateDocumentNonBlocking(doc(firestore, 'expenses', selectedExpense.id), expenseData);
      toast({
        title: 'Dépense Mise à Jour',
        description: `La dépense a été mise à jour.`,
      });
    }

    setDialogOpen(false);
  };
  
  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    return expenses
      .filter(expense => expense.description.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => toDateSafe(b.date).getTime() - toDateSafe(a.date).getTime());
  }, [expenses, searchTerm]);


  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">Gestion des Dépenses</h1>
      <p className="text-muted-foreground">Suivez et catégorisez toutes les dépenses de l'hôtel.</p>
      <Card className="mt-6">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Toutes les Dépenses</CardTitle>
            <CardDescription>Afficher et gérer toutes les dépenses enregistrées.</CardDescription>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher par description..."
              className="w-full appearance-none bg-background pl-8 shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile view */}
          <div className="grid gap-4 md:hidden">
            {filteredExpenses?.map((expense, index) => (
              <Card
                key={expense.id}
                className="animate-slide-in-from-bottom transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
              >
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{expense.description}</CardTitle>
                      <CardDescription>{expense.category}</CardDescription>
                    </div>
                    <div className="text-lg font-bold">${expense.amount.toFixed(2)}</div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">{format(toDateSafe(expense.date), 'EEE, d MMM, yyyy')}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(expense)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous absolument sûr(e) ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. La dépense sera définitivement supprimée.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(expense.id)} className={buttonVariants({ variant: 'destructive' })}>
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Desktop view */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses?.map((expense, index) => (
                  <TableRow key={expense.id} className="animate-slide-in-from-bottom" style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'backwards' }}>
                    <TableCell>{format(toDateSafe(expense.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>${expense.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(expense)}>
                          <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Êtes-vous absolument sûr(e) ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. La dépense sera définitivement supprimée.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(expense.id)} className={buttonVariants({ variant: 'destructive' })}>
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
         <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleOpenAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une Dépense
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'add' ? 'Ajouter une Nouvelle Dépense' : 'Modifier la Dépense'}</DialogTitle>
            <DialogDescription>
              Remplissez les détails pour enregistrer une dépense.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Achat de produits de nettoyage" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                <Label htmlFor="amount">Montant</Label>
                <Input id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="e.g. 150.50" />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date ? format(date, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setDate(e.target.value ? parse(e.target.value, 'yyyy-MM-dd', new Date()) : undefined)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Catégorie</Label>
               <Select value={category} onValueChange={(value: ExpenseCategory) => setCategory(value)}>
                  <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                      {expenseCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
