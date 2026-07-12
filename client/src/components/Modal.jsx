const Modal = ({
  open,
  title,
  children,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-[500px]">

        <div className="flex justify-between mb-5">
          <h2 className="text-xl font-bold">{title}</h2>

          <button onClick={onClose}>
            ✕
          </button>
        </div>

        {children}

      </div>
    </div>
  );
};

export default Modal;