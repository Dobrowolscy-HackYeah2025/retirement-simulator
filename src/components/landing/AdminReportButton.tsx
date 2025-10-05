import { useState } from 'react';

import { CloudDownloadIcon } from 'lucide-react';

import { Button } from '../ui/button';
import { AdminPasswordModal } from './AdminPasswordModal';

export const AdminReportButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="fixed top-4 right-4 z-50"
        onClick={() => setIsModalOpen(true)}
      >
        <CloudDownloadIcon />
        Pobierz raport (admin)
      </Button>

      <AdminPasswordModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
};
