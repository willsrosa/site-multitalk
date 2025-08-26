import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import WhatsAppIcon from './icons/WhatsAppIcon';

interface PartnerWhatsAppButtonProps {
  whatsapp: string;
  partnerName?: string;
}

const PartnerWhatsAppButton: React.FC<PartnerWhatsAppButtonProps> = ({ whatsapp, partnerName }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openWhatsApp = () => {
    const cleanNumber = whatsapp.replace(/\D/g, '');
    const message = 'Olá! Vim através da sua página de vendas e gostaria de saber mais sobre seus serviços.';
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (!whatsapp) return null;

  return (
    <>
      {/* WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2, type: 'spring', stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-16 h-16 bg-[#25D366] rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 animate-pulse-whatsapp"
          aria-label="Abrir chat do WhatsApp"
        >
          <AnimatePresence mode="wait">
            {!isOpen ? (
              <motion.div
                key="whatsapp"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <WhatsAppIcon className="w-8 h-8" />
              </motion.div>
            ) : (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-8 h-8" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* WhatsApp Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-40 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#128C7E] p-4 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <WhatsAppIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{partnerName || 'Consultor Especializado'}</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                    <span className="text-sm opacity-90">Online agora</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <p className="text-gray-800 dark:text-gray-200 text-sm">
                  👋 Olá! Como posso ajudar você hoje?
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
                  Resposta em poucos minutos
                </span>
              </div>

              <button
                onClick={openWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <WhatsAppIcon className="w-5 h-5" />
                <span>Iniciar Conversa</span>
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                Clique para abrir no WhatsApp
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PartnerWhatsAppButton;