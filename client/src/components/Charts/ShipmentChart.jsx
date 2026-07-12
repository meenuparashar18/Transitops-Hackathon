import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";


const data = [
  {
    month:"Jan",
    shipments:40
  },
  {
    month:"Feb",
    shipments:65
  },
  {
    month:"Mar",
    shipments:90
  },
  {
    month:"Apr",
    shipments:70
  }
];


const ShipmentChart =()=>{

return(

<div className="bg-white rounded-xl shadow p-6">

<h2 className="text-xl font-bold mb-4">
Shipment Analytics
</h2>


<ResponsiveContainer width="100%" height={250}>

<BarChart data={data}>

<XAxis dataKey="month"/>

<YAxis/>

<Tooltip/>

<Bar dataKey="shipments"/>

</BarChart>


</ResponsiveContainer>


</div>

)

}


export default ShipmentChart;