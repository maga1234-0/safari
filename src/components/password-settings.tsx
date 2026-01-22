'use client';

import { useState } from 'react';
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
import { Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser } from '@/firebase';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

export function PasswordSettings() {
  const { toast } = useToast();
  const auth = useAuth();
  const { user } = useUser();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Champs manquants',
        description: 'Veuillez remplir tous les champs de mot de passe.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Les mots de passe ne correspondent pas',
        description: 'Votre nouveau mot de passe et sa confirmation ne correspondent pas.',
      });
      return;
    }

    if (!user || !user.email) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible de trouver les informations de l'utilisateur.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      toast({
        title: 'Mot de passe mis à jour',
        description: 'Vos identifiants de connexion ont été modifiés avec succès.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      let description = 'Une erreur inconnue est survenue.';
      if (error instanceof FirebaseError) {
          description = error.code === 'auth/wrong-password' 
              ? 'Le mot de passe actuel que vous avez entré est incorrect.' 
              : 'Une erreur est survenue. Veuillez réessayer.';
      }
      toast({
        variant: 'destructive',
        title: 'La modification du mot de passe a échoué',
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identifiants de Connexion</CardTitle>
        <CardDescription>Changez le mot de passe de votre compte.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Mot de Passe Actuel</Label>
          <div className="relative">
            <Input 
              id="currentPassword" 
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isLoading}
              className="pr-10"
            />
             <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute inset-y-0 right-0 h-full px-3"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              disabled={isLoading}
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
              <span className="sr-only">Toggle current password visibility</span>
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">Nouveau Mot de Passe</Label>
           <div className="relative">
            <Input 
              id="newPassword" 
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
               className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute inset-y-0 right-0 h-full px-3"
              onClick={() => setShowNewPassword((prev) => !prev)}
              disabled={isLoading}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
              <span className="sr-only">Toggle new password visibility</span>
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmez le Nouveau Mot de Passe</Label>
          <div className="relative">
            <Input 
              id="confirmPassword" 
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className="pr-10"
            />
             <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute inset-y-0 right-0 h-full px-3"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
              <span className="sr-only">Toggle confirm new password visibility</span>
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button onClick={handlePasswordChange} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Enregistrement...' : 'Enregistrer le Mot de Passe'}
        </Button>
      </CardFooter>
    </Card>
  );
}
