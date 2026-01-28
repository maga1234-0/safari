import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import ReservationsClientPage from './client-page';


export default function ReservationsPage() {
  return (
    <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <ReservationsClientPage />
    </Suspense>
  );
}
