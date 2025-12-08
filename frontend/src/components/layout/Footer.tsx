import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center">
      <div className="flex flex-col items-center justify-center space-y-2">
        <a href="/about" className="text-gray-300 hover:text-white transition-colors">
          О нас
        </a>
        <p>&copy; {new Date().getFullYear()} The Slate. Все права защищены.</p>
      </div>
    </footer>
  );
};

export default Footer;