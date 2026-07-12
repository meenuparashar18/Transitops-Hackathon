const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
}) => {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};

export default SearchBar;