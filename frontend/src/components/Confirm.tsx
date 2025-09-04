// frontend/src/components/Confirm.tsx
import "./confirm.css";

type ConfirmProps = {
  open: boolean;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export default function Confirm({
  open,
  message,
  confirmText = "Confirmar",
  onConfirm,
  onClose,
}: ConfirmProps) {
  if (!open) return null;

  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      className="confirm-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Confirmación"
      onKeyDown={handleKey}
    >
      <div className="confirm-card">
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn btn-cancel" onClick={onClose} autoFocus>
            Cancelar
          </button>
          <button
            className="btn btn-confirm"
            onClick={() => {
              try {
                onConfirm();
              } finally {
                onClose();
              }
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
