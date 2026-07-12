const Pagination = () => {
  return (
    <div className="flex justify-end gap-2 mt-5">

      <button className="px-4 py-2 border rounded">
        Previous
      </button>

      <button className="px-4 py-2 bg-blue-600 text-white rounded">
        1
      </button>

      <button className="px-4 py-2 border rounded">
        Next
      </button>

    </div>
  );
};

export default Pagination;