import React from 'react';

const Logo: React.FC = () => {
  // O caminho agora aponta para o arquivo na pasta /public
  // Certifique-se de que o arquivo 'logo.png' existe na pasta 'public'.
  const localLogoPath = "/logo.png"; 
  
  return (
    <div className="flex items-center">
      {/* Logo para o Tema Claro (forçado para preto com filtro CSS) */}
      <img 
        src={localLogoPath} 
        alt="Multi Talk" 
        className="h-8 md:h-10 w-auto block dark:hidden filter-[grayscale(1)_brightness(0)]"
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />
      {/* Logo para o Tema Escuro (original, assumindo que seja branca) */}
      <img 
        src={localLogoPath} 
        alt="Multi Talk" 
        className="h-8 md:h-10 w-auto hidden dark:block"
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />
    </div>
  );
};

export default Logo;
