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
        className="group"
        onClick={() => setIsModalOpen(true)}
      >
        <CloudDownloadIcon className="group-hover:-translate-y-0.5 transition-transform" />
        Pobierz raport (admin)
      </Button>

      <AdminPasswordModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
};
