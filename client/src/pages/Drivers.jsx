const Drivers = () => {
  return (
    <>
      <h1 className="text-3xl font-bold mb-5">
        Drivers
      </h1>

      <table className="w-full bg-white rounded-xl shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Driver</th>
            <th>License</th>
            <th>Phone</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr className="text-center border-t">
            <td className="p-4">Alex</td>
            <td>DL123456</td>
            <td>9876543210</td>
            <td className="text-green-600">Available</td>
          </tr>

          <tr className="text-center border-t">
            <td className="p-4">John</td>
            <td>DL789654</td>
            <td>9876501234</td>
            <td className="text-blue-600">On Trip</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default Drivers;