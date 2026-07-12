const Vehicles = () => {
  return (
    <>
      <div className="flex justify-between mb-5">
        <h1 className="text-3xl font-bold">Vehicles</h1>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          + Add Vehicle
        </button>
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

        <tbody>
          <tr className="text-center border-t">
            <td className="p-4">MP09AB1234</td>
            <td>Tata Ace</td>
            <td>500 KG</td>
            <td className="text-green-600">Available</td>
          </tr>

          <tr className="text-center border-t">
            <td className="p-4">MH12XY9090</td>
            <td>Ashok Leyland</td>
            <td>2 Ton</td>
            <td className="text-orange-600">Maintenance</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default Vehicles;