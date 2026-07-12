const Alerts = () => {
  return (
    <>
      <h1 className="text-3xl font-bold mb-5">
        Alerts
      </h1>

      <div className="space-y-4">

        <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
          ⚠ Vehicle MH12XY9090 requires maintenance.
        </div>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
          ⚠ Driver Alex's license expires in 7 days.
        </div>

        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded">
          ℹ Shipment SHP001 delayed by 20 minutes.
        </div>

      </div>
    </>
  );
};

export default Alerts;