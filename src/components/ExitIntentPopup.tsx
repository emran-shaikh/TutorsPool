import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export const ExitIntentPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const handleMouseOut = (e: MouseEvent) => {
      // If the mouse is leaving the viewport from the top
      if (e.clientY < 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    // Add event listener for mouse leaving the viewport
    document.addEventListener('mouseout', handleMouseOut);

    // Cleanup
    return () => {
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [hasShown]);

  if (!isVisible) return null;

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/92345384284?text=Hi!%20I%27m%20interested%20in%20the%2020%%20discount%20offer');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Wait! Don't Go Yet! 🎉</h3>
          <h4 className="text-xl font-semibold text-blue-600 mb-4">Get 20% Off Your First Session!</h4>
          
          <p className="text-gray-600 mb-6">
            You're just one step away from unlocking expert tutoring at an exclusive rate. 
            Book your first session now and enjoy a special 20% discount!
          </p>
          
          <button
            onClick={handleWhatsAppClick}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg w-full flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.15-.197.297-.767.963-.94 1.16-.174.196-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.795-1.484-1.761-1.66-2.059-.173-.297-.018-.458.132-.606.136-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.508-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.492.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.36-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.3A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.549 4.142 1.595 5.945L0 24l6.335-1.652a11.882 11.882 0 005.723 1.465h.006c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat on WhatsApp Now
          </button>
          
          <button
            onClick={() => setIsVisible(false)}
            className="mt-3 text-sm text-gray-500 hover:text-gray-700"
          >
            No thanks, I'll pass
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitIntentPopup;
