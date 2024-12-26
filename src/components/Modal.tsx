import { Dialog } from '@headlessui/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black opacity-30"
          onClick={onClose}
          aria-hidden="true"
        />
        <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
        
        {/* Modal Content */}
        <div className="inline-block bg-white rounded-lg p-6 max-w-md w-full z-20">
          {children}
          <button
            onClick={onClose}
            className="mt-4 bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );
}
