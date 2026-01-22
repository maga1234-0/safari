'use client';

import { useRef, ChangeEvent, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser as useAppUser } from '@/context/user-context';
import { useUser as useFirebaseAuthUser } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

export function ProfileSettings() {
  const { avatar, setAvatar, name, setName } = useAppUser();
  const { user: firebaseUser } = useFirebaseAuthUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit, since we resize it
        toast({
          variant: 'destructive',
          title: 'Fichier trop volumineux',
          description: 'Veuillez sélectionner une image de moins de 5 Mo.',
        });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Type de fichier invalide',
          description: 'Veuillez sélectionner un fichier image (par ex., PNG, JPG).',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target?.result) return;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

          setAvatar(dataUrl);
          toast({
            title: 'Photo de profil mise à jour',
            description: 'Votre nouvel avatar est prêt à être enregistré.',
          });
        };
        img.src = e.target.result as string;
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSave = async () => {
    if (!firebaseUser) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Utilisateur non authentifié.',
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(firebaseUser, {
        displayName: name,
        photoURL: avatar,
      });

      toast({
        title: 'Profil Enregistré',
        description: 'Votre profil a été mis à jour.',
      });
    } catch (error) {
      let description = 'Une erreur inconnue est survenue. Veuillez réessayer.';
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/invalid-profile-attribute':
             description = "L'URL de la photo est trop longue ou invalide. Veuillez réessayer avec une autre image.";
            break;
          case 'requires-recent-login':
            description = 'Cette action nécessite une connexion récente. Veuillez vous déconnecter et vous reconnecter.';
            break;
          default:
            description = `Une erreur est survenue lors de la mise à jour: ${error.message}`;
        }
      }
      toast({
        variant: 'destructive',
        title: 'Échec de la sauvegarde',
        description,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>Gérez votre profil public et votre avatar.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 pt-6">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatar} alt="User avatar" />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            size="icon"
            className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background/80 backdrop-blur-sm"
            onClick={handleAvatarClick}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Changer d'avatar</span>
          </Button>
          <Input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <div className="w-full space-y-2">
            <Label htmlFor="displayName">Nom d'Affichage</Label>
            <Input id="displayName" value={name || ''} onChange={(e) => setName(e.target.value)} disabled={isSaving} />
        </div>
      </CardContent>
       <CardFooter className="border-t px-6 py-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {isSaving ? 'Enregistrement...' : 'Sauvegarder les Modifications'}
        </Button>
      </CardFooter>
    </Card>
  );
}
