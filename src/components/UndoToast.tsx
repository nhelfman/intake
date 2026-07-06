import { useEffect } from 'react';

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
}

export default function UndoToast({ message, onUndo, onDismiss }: UndoToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-xl max-w-xs w-full mx-4">
      <span className="text-sm flex-1">{message}</span>
      <button
        onClick={() => { onUndo(); onDismiss(); }}
        className="text-sm font-bold text-emerald-400 hover:text-emerald-300 shrink-0"
      >
        Undo
      </button>
    </div>
  );
}
