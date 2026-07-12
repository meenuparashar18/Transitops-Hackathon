export default function Loader() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

        <p className="mt-4 text-gray-600 font-medium">
          Loading...
        </p>
      </div>
    </div>
  );
}