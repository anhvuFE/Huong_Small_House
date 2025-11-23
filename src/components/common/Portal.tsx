import React, { ReactNode } from 'react';
import { createPortal } from 'react-dom';

type PortalProps = {
  children: ReactNode;
  containerId?: string;
};

export const Portal: React.FC<PortalProps> = ({ children, containerId }) => {
  if (typeof document === 'undefined') return <>{children}</>;
  const container = (containerId ? document.getElementById(containerId) : null) ?? document.body;
  return createPortal(children, container);
};
