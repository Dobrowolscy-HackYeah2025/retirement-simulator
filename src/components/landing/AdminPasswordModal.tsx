import { environment } from '@/lib/environment';

import { useState } from 'react';

import {
  AlertCircleIcon,
  DownloadIcon,
  KeyIcon,
  LoaderIcon,
} from 'lucide-react';

import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface AdminPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminPasswordModal({
  open,
  onOpenChange,
}: AdminPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!password.trim()) {
      setError('Hasło jest wymagane');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${environment.METRICS_HOST}/api/export`, {
        method: 'GET',
        headers: {
          Authorization: `Token ${password}`,
          'X-Vercel-Protection-Bypass': environment.VERCEL_BYPASS,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError('Nieprawidłowe hasło');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `raport-zainteresowania-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Close modal and reset
      onOpenChange(false);
      setPassword('');
      setError(null);
    } catch (err) {
      console.error('Error downloading report:', err);
      setError(
        'Wystąpił błąd podczas pobierania raportu. Sprawdź połączenie i spróbuj ponownie.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleDownload();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
      setPassword('');
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-left">
          <DialogTitle>Pobierz raport (admin)</DialogTitle>
          <DialogDescription>
            Wprowadź hasło administratora, aby pobrać raport zainteresowania w
            formacie XLSX. Widnieje na ostatnim slajdzie prezentacji.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 pt-2 py-4">
          <div className="grid gap-2">
            <Label htmlFor="password">Hasło</Label>
            <div className="relative">
              <KeyIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Wprowadź hasło"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                className="pl-10"
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircleIcon className="size-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            type="button"
          >
            Anuluj
          </Button>
          <Button onClick={handleDownload} disabled={isLoading} type="button">
            {isLoading ? (
              <>
                <LoaderIcon className="size-4 animate-spin" />
                Pobieranie...
              </>
            ) : (
              <>
                <DownloadIcon className="size-4" />
                Pobierz raport
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
