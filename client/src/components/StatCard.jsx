const StatCard = ({ title, value, color = "blue" }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
      <h3 className="text-gray-500 text-sm">{title}</h3>

      <h2 className={`text-3xl font-bold text-${color}-600 mt-2`}>
        {value}
      </h2>
    </div>
  );
};

export default StatCard;