import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Listbox,
  ListboxItem,
  Spinner,
  Tooltip,
} from "@heroui/react";
import {
  CheckCircle,
  RefreshCw,
  LogOut,
  FolderPlus,
  Cloud,
} from "lucide-react";
import { useDriveClient } from "../../hooks/useDriveClient.ts";

function CallDrive() {
  const {
    ready,
    authorized,
    loadingFiles,
    files,
    error,
    signIn,
    signOut,
    ensureFolder,
    refreshFiles,
  } = useDriveClient({ filesTTL: 20_000 });

  return (
    <Card
      shadow="sm"
      className="mt-6 border border-default-200 bg-white/70 backdrop-blur-md"
    >
      <CardHeader className="flex gap-2 items-center">
        <Cloud size={20} />
        <h3 className="font-semibold text-md">Integração com Google Drive</h3>
      </CardHeader>

      <Divider />

      <CardBody className="space-y-4">
        {!ready && (
          <div className="flex items-center gap-2 text-gray-500">
            <Spinner size="sm" color="primary" />
            <span>Inicializando bibliotecas do Google...</span>
          </div>
        )}

        {!!error && (
          <p className="text-danger text-sm">
            {String(error?.message ?? error)}
          </p>
        )}

        {ready && !authorized && (
          <Button
            color="primary"
            startContent={<CheckCircle size={18} />}
            onPress={signIn}
          >
            Autorizar acesso ao Drive
          </Button>
        )}

        {ready && authorized && (
          <div className="flex flex-wrap gap-3">
            <Tooltip content="Revogar acesso e sair">
              <Button
                color="danger"
                startContent={<LogOut size={18} />}
                onPress={signOut}
              >
                Sair
              </Button>
            </Tooltip>

            <Tooltip content="Atualizar lista de arquivos">
              <Button
                color="success"
                startContent={<RefreshCw size={18} />}
                onPress={refreshFiles}
                isLoading={loadingFiles}
              >
                Atualizar Lista
              </Button>
            </Tooltip>

            <Tooltip content="Garantir pasta 'banco_de_questoes'">
              <Button
                color="secondary"
                startContent={<FolderPlus size={18} />}
                onPress={ensureFolder}
              >
                Criar Pasta Base
              </Button>
            </Tooltip>
          </div>
        )}

        {authorized && (
          <>
            <Divider className="my-2" />
            {loadingFiles ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Spinner size="sm" color="success" />
                <span>Carregando arquivos...</span>
              </div>
            ) : files.length > 0 ? (
              <Listbox aria-label="Arquivos do banco de questões">
                {files.map((file) => (
                  <ListboxItem
                    key={file.id}
                    description={file.id}
                    className="text-sm"
                  >
                    {file.name}
                  </ListboxItem>
                ))}
              </Listbox>
            ) : (
              <p className="text-gray-500 text-sm">
                Nenhum arquivo .docx encontrado no Drive.
              </p>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}
export default CallDrive;
