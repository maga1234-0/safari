'use client';

import { useRef, ChangeEvent } from 'react';
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
import { Edit, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/user-context';

export function ProfileSettings() {
  const { avatar, setAvatar, name, setName } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please select an image smaller than 2MB.',
        });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Invalid file type',
          description: 'Please select an image file (e.g., PNG, JPG).',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        toast({
          title: 'Profile picture updated',
          description: 'Your new avatar is ready to be saved.',
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSave = () => {
    // In a real app, this would persist to a database.
    // Here it's just confirming the context state is what we want.
    toast({
      title: 'Profile Saved',
      description: 'Your profile has been updated.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Manage your public profile and avatar.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 pt-6">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatar} alt="User avatar" />
            <AvatarFallback>{name?.[0]}</AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            size="icon"
            className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background/80 backdrop-blur-sm"
            onClick={handleAvatarClick}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Change avatar</span>
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
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      </CardContent>
       <CardFooter className="border-t px-6 py-4">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}
