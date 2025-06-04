
import React from "react";
import { createPortal } from "react-dom";

interface TooltipPortalProps {
  children: React.ReactNode;
}

export const TooltipPortal = ({ children }: TooltipPortalProps) => {
  const portalRoot = document.getElementById('portal-root') || document.body;
  
  return createPortal(
    <div 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 999999
      }}
    >
      {children}
    </div>,
    portalRoot
  );
};
