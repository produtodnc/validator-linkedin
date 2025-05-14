
import React from "react";
import { Link } from "react-router-dom";
const Header = () => {
  return <header className="w-full py-4 px-6 border-b">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img src="/lovable-uploads/1f74fc54-cccd-45b8-bd09-95465976e0b5.png" alt="DNC Logo" className="h-10" />
        </Link>
      </div>
    </header>;
};
export default Header;
