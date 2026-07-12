const Shipments = () => {
  return (
    <>
      <div className="flex justify-between mb-5">
        <h1 className="text-3xl font-bold">
          Shipments
        </h1>

        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Create Shipment
        </button>
      </div>

      <table className="w-full bg-white rounded-xl shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Shipment ID</th>
            <th>Source</th>
            <th>Destination</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr className="text-center border-t">
            <td>SHP001</td>
            <td>Delhi</td>
            <td>Mumbai</td>
            <td className="text-blue-600">In Transit</td>
          </tr>

          <tr className="text-center border-t">
            <td>SHP002</td>
            <td>Indore</td>
            <td>Bhopal</td>
            <td className="text-green-600">Delivered</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default Shipments;