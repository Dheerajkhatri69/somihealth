import { Tooltip } from 'react-tooltip';
import { Info, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const ContactInfoTooltip = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close tooltip on outside click (mobile only)
  useEffect(() => {
    if (!isMobile || !isOpen) return;
    const handleClickOutside = (event) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target) &&
        !event.target.closest('[data-tooltip-id="contact-info-tooltip"]')
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isOpen]);

  return (
    <>
      <div>
        <Info 
          size={18} 
          className="cursor-pointer text-gray-500 hover:text-blue-600 transition-colors duration-150  focus:ring-blue-400 rounded-full" 
          data-tooltip-id="contact-info-tooltip"
          data-tooltip-place={isMobile ? "top" : "right"}
          onClick={() => isMobile && setIsOpen(!isOpen)}
          tabIndex={0}
          aria-label="Show contact info"
        />
      </div>

      <Tooltip 
        id="contact-info-tooltip"
        className="!bg-gray-50 !text-gray-800 !border !border-gray-300 !rounded-xl !shadow-2xl !max-w-xs !z-[9999] !p-0 !font-sans"
        noArrow={false}
        offset={10}
        openOnClick={isMobile}
        isOpen={isMobile ? isOpen : undefined}
        clickable={true}
        positionStrategy="fixed"
        style={{ padding: 0 }}
        render={() => (
          <div ref={tooltipRef} className="relative">
            <div className="p-5 text-sm">
              <h3 className="font-bold text-gray-900 mb-3 text-base">Have questions?</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-medium min-w-[48px]">Email:</span>
                  <a 
                    href="mailto:info@joinsomi.com" 
                    className="text-blue-600 hover:underline hover:text-blue-700 transition-colors font-semibold break-all"
                  >
                    info@joinsomi.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-medium min-w-[48px]">Text Us:</span>
                  <a 
                    href="tel:+17043866871" 
                    className="text-blue-600 hover:underline hover:text-blue-700 transition-colors font-semibold"
                  >
                    +1 (704) 386-6871
                  </a>
                </div>
              </div>
            </div>
            {isMobile && (
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Close tooltip"
              >
                <X size={18} className="text-gray-500" />
              </button>
            )}
          </div>
        )}
      />
    </>
  );
};

export default ContactInfoTooltip;