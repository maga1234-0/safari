'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth, useUser, initiateEmailSignIn, useFirestore, initiateEmailSignUp } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { FirebaseError } from "firebase/app";
import { collection, addDoc } from "firebase/firestore";

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

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await initiateEmailSignIn(auth, email, password);
      // On success, onAuthStateChanged will trigger the redirect.
    } catch (error) {
      let description = "Une erreur inconnue est survenue. Veuillez réessayer.";
      
      if (error instanceof FirebaseError && error.code === 'auth/invalid-credential' && email.toLowerCase() === 'safari@gmail.com') {
        // This block attempts to create the main admin user if login fails, assuming it might not exist.
        try {
            const userCredential = await initiateEmailSignUp(auth, email, password);
            if (userCredential.user && firestore) {
                const staffData = { name: 'Main Admin', email: email.toLowerCase(), role: 'Admin' };
                // Use a blocking write to ensure the staff document exists before proceeding
                await addDoc(collection(firestore, 'staff'), staffData);
                toast({
                    title: 'Compte Admin Créé',
                    description: "Le compte administrateur principal a été créé et vous êtes maintenant connecté.",
                });
            }
            // On successful creation, the onAuthStateChanged listener will handle the redirect.
            return; 
        } catch (signupError) {
            if (signupError instanceof FirebaseError) {
                // If signup fails because the email is in use, it means the password was simply incorrect.
                description = signupError.code === 'auth/email-already-in-use'
                    ? 'Email ou mot de passe invalide. Veuillez réessayer.'
                    : signupError.message;
            } else {
                description = 'Erreur lors de la tentative de création du compte admin. Veuillez réessayer.';
            }
        }
      } else if (error instanceof FirebaseError) {
        // Handle other Firebase errors
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
