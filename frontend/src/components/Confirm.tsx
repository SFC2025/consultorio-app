import "./confirm.css";

type Props = {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export default function Confirm({
  open,
  title = "Confirmar acción",
  message,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  onConfirm,
  onClose,
}: Props) {
  if (!open) return null;
  return (
    <div className="cfm-overlay" onClick={onClose}>
      <div className="cfm-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="cfm-title">{title}</h3>
        <p className="cfm-msg">{message}</p>
        <div className="cfm-actions">
          <button className="btn-outline" onClick={onClose}>
            {cancelText}
          </button>
          <button
            className="btn-rojo"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
