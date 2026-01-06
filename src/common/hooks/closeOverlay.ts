// hooks/useModalClose.ts
import { useState } from 'react';

interface UseModalCloseOptions {
  onClose: () => void;
  delay?: number;
  className: string;
}

export const useModalClose = ({ onClose, delay = 500, className}: UseModalCloseOptions) => {
  const [isClosing, setIsClosing] = useState(false);

  const closeWindow = () => {
    setIsClosing(true)

    setTimeout(() => {
        onClose()
        setIsClosing(false)
    }, delay)
  }

  const handleCloseWindow = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement

    if (target.className.includes(className)) {
        closeWindow()
    }

  }

  return {
    closeWindow,
    isClosing,
    handleCloseWindow
  }
}