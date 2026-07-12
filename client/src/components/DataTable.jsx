const DataTable = ({ columns = [], data = [] }) => {
  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="w-full">

        <thead className="bg-gray-100">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className="text-left px-5 py-3"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-5 text-gray-500"
              >
                No Data Found
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={index}
                className="border-t"
              >
                {row.map((item, i) => (
                  <td
                    key={i}
                    className="px-5 py-3"
                  >
                    {item}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>

      </table>
    </div>
  );
};

export default DataTable;