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
import { FirebaseError, initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, type UserCredential } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// This helper function creates a user in a temporary, separate Firebase app instance.
// This is the key to creating a new user account without automatically signing in
// as that new user, which would disrupt the current session.
const createAuthUserWithoutSigningOut = async (email: string, password: string): Promise<UserCredential> => {
  const tempAppName = `temp-signup-${Date.now()}`;
  const tempApp = initializeApp(firebaseConfig, tempAppName);
  const tempAuth = getAuth(tempApp);

  try {
    const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
    return userCredential;
  } finally {
    // Clean up the temporary app instance to prevent memory leaks.
    await deleteApp(tempApp);
  }
};

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const [email, setEmail] = useState("safari@gmail.com");
  const [password, setPassword] = useState("safari@#");
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
      // First, attempt to sign in normally.
      await initiateEmailSignIn(auth, email, password);
      // If successful, the useEffect hook will handle the redirect.
    } catch (error) {
      // Check if the error is a specific "user not found" or "invalid credential" error
      if (
        error instanceof FirebaseError &&
        error.code === 'auth/invalid-credential' &&
        email === 'safari@gmail.com'
      ) {
        // This block handles the special case for the main admin.
        // The error could mean the user doesn't exist, or the password is wrong.
        // We'll try to create the user to find out which it is.
        try {
          const userCredential = await createAuthUserWithoutSigningOut(email, password);
          // If creation succeeds, it means the user did not exist.
          // Now, create the corresponding staff document with the correct UID.
          if (firestore) {
            await addDoc(collection(firestore, 'staff'), {
              name: 'Main Admin',
              email: email,
              role: 'Admin',
              uid: userCredential.user.uid,
            });
          }
          // Now that we've created the auth user and the staff doc, we can log in.
          // This attempt should succeed.
          await initiateEmailSignIn(auth, email, password);
        } catch (creationError) {
          // This catch block handles errors during the creation attempt.
          let description = "Could not set up the admin account.";
          if (creationError instanceof FirebaseError) {
            if (creationError.code === 'auth/email-already-in-use') {
              // If the email is already in use, it means our first login attempt failed
              // due to a wrong password, not a missing user.
              description = "The password is incorrect. Please try again.";
            } else if (creationError.code === 'auth/weak-password') {
              description = 'The password must contain at least 6 characters.';
            }
          }
          toast({
            variant: 'destructive',
            title: 'Login Failed',
            description,
          });
        }
      } else {
        // This handles all other login errors (e.g., network issues, wrong password for non-admin).
        let description = "An unknown error occurred. Please try again.";
        if (error instanceof FirebaseError) {
          description =
            error.code === 'auth/invalid-credential'
              ? 'Invalid email or password. Please try again.'
              : error.message;
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
