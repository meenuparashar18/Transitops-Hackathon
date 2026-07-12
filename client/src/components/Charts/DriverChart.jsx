import {
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer
} from "recharts";


const data=[
{
day:"Mon",
drivers:20
},
{
day:"Tue",
drivers:35
},
{
day:"Wed",
drivers:30
},
{
day:"Thu",
drivers:45
},
];


const DriverChart=()=>{

return(

<div className="bg-white rounded-xl shadow p-6">


<h2 className="text-xl font-bold mb-4">
Driver Activity
</h2>


<ResponsiveContainer width="100%" height={250}>

<LineChart data={data}>

<XAxis dataKey="day"/>

<YAxis/>

<Tooltip/>

<Line 
dataKey="drivers"
/>

</LineChart>


</ResponsiveContainer>


</div>

)

}


export default DriverChart;