import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody } from '@heroui/react';
import { Download, X } from 'lucide-react';
import { useUpdater } from '@/hooks/useUpdater';
import UpdateModal from './UpdateModal';

export const UpdateNotification: React.FC = () => {
  const { isUpdateAvailable, updateInfo, downloadAndInstallUpdate } = useUpdater();
  const [showNotification, setShowNotification] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isUpdateAvailable) {
      setShowNotification(true);
    }
  }, [isUpdateAvailable]);

  const handleUpdateClick = () => {
    setShowModal(true);
    setShowNotification(false);
  };

  const handleUpdate = async () => {
    await downloadAndInstallUpdate();
  };

  if (!showNotification || !updateInfo) return null;

  return (
    <>
      <Card className="fixed bottom-4 right-4 w-80 shadow-lg z-50">
        <CardBody className="flex flex-row items-center gap-3 p-4">
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Atualização disponível</h4>
            <p className="text-xs text-gray-600">
              Versão {updateInfo.version} está pronta para instalar
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              color="primary"
              variant="flat"
              onPress={handleUpdateClick}
              startContent={<Download size={16} />}
            >
              Atualizar
            </Button>
            <Button
              size="sm"
              isIconOnly
              variant="light"
              onPress={() => setShowNotification(false)}
            >
              <X size={16} />
            </Button>
          </div>
        </CardBody>
      </Card>

      <UpdateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        updateInfo={updateInfo}
        onUpdate={handleUpdate}
      />
    </>
  );
};

export default UpdateNotification;