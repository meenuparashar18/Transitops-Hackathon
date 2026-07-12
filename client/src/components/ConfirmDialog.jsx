const ConfirmDialog = ({
  open,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center">

      <div className="bg-white rounded-xl p-6 w-96">

        <h2 className="text-lg font-semibold mb-4">
          Confirmation
        </h2>

        <p>{message}</p>

        <div className="flex justify-end gap-3 mt-5">

          <button
            onClick={onCancel}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  );
};

export default ConfirmDialog;