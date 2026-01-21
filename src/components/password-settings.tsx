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
import { Save, Loader2 } from 'lucide-react';
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

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill in all password fields.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Your new password and confirmation do not match.',
      });
      return;
    }

    if (!user || !user.email) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not find user information.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      toast({
        title: 'Password updated',
        description: 'Your login credentials have been successfully changed.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      let description = 'An unknown error occurred.';
      if (error instanceof FirebaseError) {
          description = error.code === 'auth/wrong-password' 
              ? 'The current password you entered is incorrect.' 
              : 'An error occurred. Please try again.';
      }
      toast({
        variant: 'destructive',
        title: 'Password change failed',
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login Credentials</CardTitle>
        <CardDescription>Change your account password.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input 
            id="currentPassword" 
            type="password" 
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input 
            id="newPassword" 
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input 
            id="confirmPassword" 
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button onClick={handlePasswordChange} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Saving...' : 'Save Password'}
        </Button>
      </CardFooter>
    </Card>
  );
}
