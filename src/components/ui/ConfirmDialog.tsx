import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
};

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete' }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-full bg-error-500/15 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-6 h-6 text-error-400" />
        </div>
        <p className="text-slate-300 text-sm pt-1">{message}</p>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose} className="btn-ghost">Cancel</button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className="px-4 py-2 rounded-lg bg-error-600 hover:bg-error-500 text-white font-medium text-sm transition-all"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
