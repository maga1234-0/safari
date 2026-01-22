import { ProfileSettings } from "@/components/profile-settings";
import { PasswordSettings } from "@/components/password-settings";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">Paramètres</h1>
      <p className="text-muted-foreground">Gérez les paramètres de votre compte.</p>
      <div className="mt-6 grid gap-6">
        <ProfileSettings />
        <PasswordSettings />
      </div>
    </div>
  );
}
