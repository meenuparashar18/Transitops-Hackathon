import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center">

      <h1 className="text-8xl font-bold text-blue-600">
        404
      </h1>

      <p className="text-xl mt-3 mb-6">
        Page Not Found
      </p>

      <Link
        to="/dashboard"
        className="bg-blue-600 text-white px-6 py-3 rounded"
      >
        Back to Dashboard
      </Link>

    </div>
  );
};

export default NotFound;