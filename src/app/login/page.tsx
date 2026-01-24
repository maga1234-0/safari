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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const [email, setEmail] = useState("safari@gmail.com");
  const [password, setPassword] = useState("pms1234@#");
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
      // On success, the useEffect hook above will handle the redirect.
    } catch (signInError) {
      if (
        signInError instanceof FirebaseError &&
        signInError.code === 'auth/invalid-credential' &&
        email === 'safari@gmail.com'
      ) {
        // This could be a first-time admin login or a wrong password for the admin.
        // Let's try to create the account. If it already exists, this will fail.
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const newUser = userCredential.user;

          // If user creation is successful, create the corresponding staff document.
          // This is crucial for role-based access to work correctly.
          if (firestore) {
            const staffDocRef = doc(firestore, 'staff', newUser.uid);
            await setDoc(staffDocRef, {
              uid: newUser.uid,
              name: 'Safari Admin',
              email: newUser.email,
              role: 'Admin',
            });
             toast({
              title: 'Admin Account Created',
              description: 'Welcome! Your administrator account has been set up.',
            });
            // At this point, the user is signed in, and the auth state listener will trigger the redirect.
          } else {
             throw new Error("Firestore is not available to create staff record.");
          }

        } catch (signUpError: any) {
          // If sign up fails, check why.
          if (signUpError instanceof FirebaseError && signUpError.code === 'auth/email-already-in-use') {
            // This means the account exists, so the password for the initial sign-in attempt was simply wrong.
            toast({
              variant: 'destructive',
              title: 'Login Failed',
              description: 'Incorrect password for the admin account. Please try again.',
            });
          } else if (signUpError instanceof FirebaseError && signUpError.code === 'auth/weak-password') {
            toast({
              variant: 'destructive',
              title: 'Setup Failed',
              description: 'The admin password must be at least 6 characters long.',
            });
          }
          else {
            // Another error occurred during the account creation attempt.
            toast({
              variant: 'destructive',
              title: 'Admin Setup Failed',
              description: `An unexpected error occurred: ${signUpError.message}`,
            });
          }
        }
      } else {
        // This is a standard login failure (not the special admin case).
        let description = 'An unknown error occurred.';
        if (signInError instanceof FirebaseError && signInError.code === 'auth/invalid-credential') {
          description = 'Invalid email or password. Please check your credentials and try again.';
        }
        toast({
          variant: 'destructive',
          title: 'Login Failed',
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

  // Show a loading spinner while checking auth state or if the user is already logged in (and redirecting).
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
          <CardDescription>Enter your credentials to access the admin panel.</CardDescription>
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
                placeholder="safari@gmail.com"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
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
                  <span className="sr-only">Toggle password visibility</span>
                </Button>
              </div>
            </div>
            <Button onClick={handleLogin} disabled={isLoggingIn} className="w-full mt-2">
              {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoggingIn ? 'Logging In...' : 'Login'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
