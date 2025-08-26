import React from 'react';

interface LogoProps {
  collapsed?: boolean;
  isAdmin?: boolean;
}

const Logo: React.FC<LogoProps> = ({ collapsed = false, isAdmin = false }) => {
  const logoPath = "/logo.png";
  
  // Se estiver no admin e colapsado, não mostra a logo
  if (isAdmin && collapsed) {
    return null;
  }
  
  return (
    <div className="flex items-center">
      <img 
        src={logoPath} 
        alt="Multi Talk" 
        className={`w-auto transition-all duration-300 ${
          isAdmin 
            ? 'h-8' // Menor no admin
            : 'h-12 md:h-14' // Tamanho normal no site
        }`}
        onError={(e) => {
          console.error('Erro ao carregar logo:', e);
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
};

export default Logo;
