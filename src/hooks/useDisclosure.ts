import { useState } from 'react';

export const useDisclosure = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  return {
    close: () => setIsOpen(false),
    isOpen,
    open: () => setIsOpen(true),
    toggle: () => setIsOpen((currentState) => !currentState),
  };
};
