const Dashboard = () => {
  const stats = [
    { title: "Active Vehicles", value: 52 },
    { title: "Drivers", value: 28 },
    { title: "Active Shipments", value: 17 },
    { title: "Alerts", value: 5 },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-5">
        {stats.map((item) => (
          <div
            key={item.title}
            className="bg-white p-6 rounded-xl shadow"
          >
            <h2 className="text-gray-500">{item.title}</h2>
            <p className="text-3xl font-bold mt-3">{item.value}</p>
          </div>
        ))}
      </div>

      <table className="w-full bg-white rounded-xl shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Registration</th>
            <th>Model</th>
            <th>Capacity</th>
            <th>Status</th>
          </tr>
        </thead>

        <ul className="space-y-3">
          <li>🚚 Truck MH12AB1234 dispatched.</li>
          <li>👨 Driver Alex assigned.</li>
          <li>⚠ Maintenance due for Vehicle V-205.</li>
        </ul>
      </div>
    </>
  );
};

export default Vehicles;