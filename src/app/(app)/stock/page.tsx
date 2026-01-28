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
import type { StockItem, StockCategory } from '@/lib/types';
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
import { format, toDate } from 'date-fns';

const stockCategories: StockCategory[] = ['Nourriture', 'Boissons', 'Linge de maison', 'Produits de nettoyage', 'Articles de toilette', 'Autre'];

function toDateSafe(date: any): Date {
  if (date && typeof date.toDate === 'function') {
    return date.toDate();
  }
  return toDate(date);
}

export default function StockPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const stockQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'stock'));
  }, [firestore]);
  const { data: stockItems } = useCollection<StockItem>(stockQuery);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<StockCategory | ''>('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');

  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setSelectedItem(null);
    setName('');
    setCategory('');
    setQuantity('');
    setUnit('');
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (item: StockItem) => {
    setDialogMode('edit');
    setSelectedItem(item);
    setName(item.name);
    setCategory(item.category);
    setQuantity(String(item.quantity));
    setUnit(item.unit);
    setDialogOpen(true);
  };
  
  const handleDelete = (itemId: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'stock', itemId));
    toast({
      title: 'Article de Stock Supprimé',
      description: "L'article a été retiré de l'inventaire.",
    });
  };

  const handleSave = () => {
    if (!name || !category || !quantity || !unit || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Informations Manquantes',
        description: 'Veuillez remplir tous les champs.',
      });
      return;
    }
    
    const quantityValue = parseFloat(quantity);
    if (isNaN(quantityValue)) {
      toast({
        variant: 'destructive',
        title: 'Quantité Invalide',
        description: 'Veuillez entrer une quantité numérique valide.',
      });
      return;
    }
    
    const itemData = {
      name,
      category: category as StockCategory,
      quantity: quantityValue,
      unit,
      lastUpdated: serverTimestamp(),
    };

    if (dialogMode === 'add') {
      addDocumentNonBlocking(collection(firestore, 'stock'), itemData);
      toast({
        title: 'Article Ajouté au Stock',
        description: `L'article a été ajouté à l'inventaire.`,
      });
    } else if (dialogMode === 'edit' && selectedItem) {
      updateDocumentNonBlocking(doc(firestore, 'stock', selectedItem.id), itemData);
      toast({
        title: 'Stock Mis à Jour',
        description: `L'article a été mis à jour.`,
      });
    }

    setDialogOpen(false);
  };
  
  const filteredStockItems = useMemo(() => {
    if (!stockItems) return [];
    return stockItems
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => toDateSafe(b.lastUpdated).getTime() - toDateSafe(a.lastUpdated).getTime());
  }, [stockItems, searchTerm]);


  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">Gestion du Stock</h1>
      <p className="text-muted-foreground">Suivez et gérez l'inventaire de l'hôtel.</p>
      <Card className="mt-6">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Inventaire du Stock</CardTitle>
            <CardDescription>Afficher et gérer tous les articles en stock.</CardDescription>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher par nom d'article..."
              className="w-full appearance-none bg-background pl-8 shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom de l'article</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Unité</TableHead>
                  <TableHead>Dernière Mise à Jour</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStockItems?.map((item, index) => (
                  <TableRow key={item.id} className="animate-slide-in-from-bottom" style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'backwards' }}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{format(toDateSafe(item.lastUpdated), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(item)}>
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
                              Cette action est irréversible. L'article sera définitivement supprimé de votre inventaire.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)} className={buttonVariants({ variant: 'destructive' })}>
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
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Article
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'add' ? 'Ajouter un Nouvel Article au Stock' : "Modifier l'Article"}</DialogTitle>
            <DialogDescription>
              Remplissez les détails pour gérer l'inventaire.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom de l'article</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bouteilles d'eau" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                <Label htmlFor="quantity">Quantité</Label>
                <Input id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" placeholder="e.g. 100" />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="unit">Unité</Label>
                <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. pièces, kg, litres" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Catégorie</Label>
               <Select value={category} onValueChange={(value: StockCategory) => setCategory(value)}>
                  <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                      {stockCategories.map(cat => (
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
