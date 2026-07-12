import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";


const data = [
  {
    name: "Available",
    value: 60
  },
  {
    name: "On Trip",
    value: 25
  },
  {
    name: "Maintenance",
    value: 15
  }
];


const VehicleChart = () => {

  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-xl font-bold mb-4">
        Vehicle Status
      </h2>


      <ResponsiveContainer width="100%" height={250}>

        <PieChart>

          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={90}
            label
          >

            {
              data.map((entry,index)=>(
                <Cell key={index}/>
              ))
            }

          </Pie>


          <Tooltip />

        </PieChart>

      </ResponsiveContainer>

    </div>
  );
};


export default VehicleChart;