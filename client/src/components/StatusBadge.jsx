const StatusBadge = ({ status }) => {
  let color = "bg-gray-100 text-gray-700";

  if (status === "Available") {
    color = "bg-green-100 text-green-700";
  }

  if (status === "On Trip") {
    color = "bg-blue-100 text-blue-700";
  }

  if (status === "Maintenance") {
    color = "bg-orange-100 text-orange-700";
  }

  if (status === "Delivered") {
    color = "bg-green-100 text-green-700";
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;