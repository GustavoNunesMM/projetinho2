import { useState } from "react";
import CallDrive from "./calldrive";
import Button from "../common/Button";

const Header = () => {
  const [showDrive, setShowDrive] = useState(false);

  return (
    <header className="bg-blue-600 text-white p-6 shadow-lg relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Banco de Questões</h1>
          <p className="text-blue-100 mt-1">
            Gerencie seus layouts e questões de forma profissional
          </p>
        </div>

        <Button onClick={() => setShowDrive(!showDrive)}>
          {showDrive ? "Fechar Drive" : "Integração Drive"}
        </Button>
      </div>

      {showDrive && (
        <div className="mt-6 bg-white text-black rounded-lg p-4 shadow-md">
          <CallDrive />
        </div>
      )}
    </header>
  );
};

export default Header;
