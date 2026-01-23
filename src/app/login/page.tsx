'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth, useUser, initiateEmailSignIn, useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { FirebaseError } from "firebase/app";
import { collection, addDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, type UserCredential } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, deleteApp } from 'firebase/app';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);
  
  const createAuthUserWithoutSigningOut = async (email: string, password: string): Promise<UserCredential> => {
    const tempAppName = `temp-signup-${Date.now()}`;
    const tempApp = initializeApp(firebaseConfig, tempAppName);
    const tempAuth = getAuth(tempApp);

    try {
      const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
      return userCredential;
    } finally {
      await deleteApp(tempApp);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await initiateEmailSignIn(auth, email, password);
    } catch (error) {
      if (
        error instanceof FirebaseError &&
        error.code === 'auth/invalid-credential' &&
        email === 'safari@gmail.com'
      ) {
        // This can mean either "user not found" or "wrong password".
        // We'll try to create the user to resolve this.
        try {
          const userCredential = await createAuthUserWithoutSigningOut(email, password);
          // If creation succeeds, the user did not exist.
          // Now, create the corresponding staff document with the correct UID.
          if (firestore) {
            await addDoc(collection(firestore, 'staff'), {
              name: 'Main Admin',
              email: email,
              role: 'Admin',
              uid: userCredential.user.uid,
            });
          }
          // Now that the auth user and staff doc exist, log in. This should succeed.
          await initiateEmailSignIn(auth, email, password);
        } catch (creationError) {
          let description = "Impossible de configurer le compte administrateur.";
          if (creationError instanceof FirebaseError) {
            if (creationError.code === 'auth/email-already-in-use') {
              // This means the user exists, so the initial login attempt failed due to a wrong password.
              description = "Le mot de passe est incorrect. Veuillez réessayer.";
            } else if (creationError.code === 'auth/weak-password') {
              description = 'Le mot de passe doit contenir au moins 6 caractères.';
            }
          }
          toast({
            variant: 'destructive',
            title: 'Échec de la Connexion',
            description,
          });
        }
      } else {
        let description = "Une erreur inconnue est survenue. Veuillez réessayer.";
        if (error instanceof FirebaseError) {
          description =
            error.code === 'auth/invalid-credential'
              ? 'Email ou mot de passe invalide. Veuillez réessayer.'
              : error.message;
        }
        
        toast({
          variant: 'destructive',
          title: 'Échec de la Connexion',
          description: description,
        });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Home className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">PMS safari</CardTitle>
          <CardDescription>Entrez vos identifiants pour accéder au panneau d'administration.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Mot de passe</Label>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="sr-only">Basculer la visibilité du mot de passe</span>
                </Button>
              </div>
            </div>
            <Button onClick={handleLogin} disabled={isLoggingIn} className="w-full mt-2">
              {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoggingIn ? 'Connexion en cours...' : 'Connexion'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
