
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full py-6 px-6 border-t bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500">© 2025 DNC. Todos os direitos reservados.</p>
          </div>
          <div className="flex space-x-6">
            <Link to="#" className="text-sm text-gray-500 hover:text-gray-700">Termos de uso</Link>
            <Link to="#" className="text-sm text-gray-500 hover:text-gray-700">Política de privacidade</Link>
            <Link to="#" className="text-sm text-gray-500 hover:text-gray-700">Ajuda</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
