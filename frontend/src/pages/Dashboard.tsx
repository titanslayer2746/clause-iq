import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchContracts, clearError } from "../store/slices/contractsSlice";
import { fetchUpcomingTasks } from "../store/slices/tasksSlice";

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { contracts, loading, error, pagination } = useAppSelector(
    (state) => state.contracts
  );
  const { upcomingTasks } = useAppSelector((state) => state.tasks);

  const [filters, setFilters] = useState({
    status: "",
    search: "",
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    dispatch(fetchContracts(filters));
    dispatch(fetchUpcomingTasks(30));
  }, [dispatch, filters]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, status: e.target.value, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: { [key: string]: string } = {
      Pending: "bg-yellow-100 text-yellow-800",
      Reviewed: "bg-blue-100 text-blue-800",
      Approved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
      Expired: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          statusClasses[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  const getRiskBadge = (score?: number) => {
    if (!score) return <span className="text-gray-400">-</span>;

    let colorClass = "text-green-600";
    let label = "Low";

    if (score >= 70) {
      colorClass = "text-red-600";
      label = "High";
    } else if (score >= 40) {
      colorClass = "text-yellow-600";
      label = "Medium";
    }

    return (
      <span className={`font-semibold ${colorClass}`}>
        {score} ({label})
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate summary stats
  const totalContracts = pagination.total;
  const highRiskCount = contracts.filter((c) => (c.riskScore || 0) >= 70).length;
  const approvedCount = contracts.filter((c) => c.status === "Approved").length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black">
          WELCOME BACK, <span className="text-yellow-600">{user?.email.split("@")[0].toUpperCase()}</span>
        </h1>
        <p className="mt-2 text-lg text-gray-700 font-medium">
          Here's what's happening with your contracts today.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-100 border-2 border-red-500 text-red-800 px-4 py-3 rounded-lg font-medium">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white rounded-xl border-4 border-black p-6 hover:shadow-2xl transition-all transform hover:scale-105 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400 rounded-bl-full opacity-10"></div>
          <div className="relative z-10 flex items-center">
            <div className="flex-shrink-0">
              <div className="h-14 w-14 rounded-lg bg-black flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-xs font-bold text-gray-600">TOTAL CONTRACTS</p>
              <p className="text-3xl font-black text-black">
                {totalContracts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-4 border-black p-6 hover:shadow-2xl transition-all transform hover:scale-105 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-400 rounded-bl-full opacity-10"></div>
          <div className="relative z-10 flex items-center">
            <div className="flex-shrink-0">
              <div className="h-14 w-14 rounded-lg bg-red-600 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-xs font-bold text-gray-600">HIGH RISK</p>
              <p className="text-3xl font-black text-black">
                {highRiskCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-4 border-black p-6 hover:shadow-2xl transition-all transform hover:scale-105 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-400 rounded-bl-full opacity-10"></div>
          <div className="relative z-10 flex items-center">
            <div className="flex-shrink-0">
              <div className="h-14 w-14 rounded-lg bg-green-600 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-xs font-bold text-gray-600">APPROVED</p>
              <p className="text-3xl font-black text-black">
                {approvedCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-4 border-black p-6 hover:shadow-2xl transition-all transform hover:scale-105 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400 rounded-bl-full opacity-10"></div>
          <div className="relative z-10 flex items-center">
            <div className="flex-shrink-0">
              <div className="h-14 w-14 rounded-lg bg-black flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-xs font-bold text-gray-600">
                UPCOMING TASKS
              </p>
              <p className="text-3xl font-black text-black">
                {upcomingTasks.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-yellow-400 rounded-xl border-4 border-black mb-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search contracts..."
                value={filters.search}
                onChange={handleSearch}
                className="block w-full pl-10 pr-3 py-3 border-2 border-black rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleStatusFilter}
              className="block pl-3 pr-10 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black font-bold rounded-lg bg-white"
            >
              <option value="">ALL STATUSES</option>
              <option value="Pending">PENDING</option>
              <option value="Reviewed">REVIEWED</option>
              <option value="Approved">APPROVED</option>
              <option value="Rejected">REJECTED</option>
              <option value="Expired">EXPIRED</option>
            </select>

            <Link
              to="/contracts/upload"
              className="inline-flex items-center px-6 py-3 border-2 border-black shadow-md font-black rounded-lg text-yellow-400 bg-black hover:bg-gray-900 transition transform hover:scale-105"
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              UPLOAD
            </Link>
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      {loading && contracts.length === 0 ? (
        <div className="bg-white rounded-xl border-4 border-black p-12 text-center">
          <svg
            className="animate-spin h-12 w-12 mx-auto text-yellow-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-4 text-gray-700 font-bold">LOADING CONTRACTS...</p>
        </div>
      ) : contracts.length === 0 ? (
        <div className="bg-white rounded-xl border-4 border-black p-12 text-center">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-black text-black">
            NO CONTRACTS FOUND
          </h3>
          <p className="mt-2 text-sm text-gray-600 font-medium">
            {filters.status || filters.search
              ? "Try adjusting your filters"
              : "Get started by uploading your first contract"}
          </p>
          {!filters.status && !filters.search && (
            <div className="mt-6">
              <Link
                to="/contracts/upload"
                className="inline-flex items-center px-6 py-3 border-2 border-black shadow-md font-black rounded-lg text-yellow-400 bg-black hover:bg-gray-900 transition transform hover:scale-105"
              >
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                UPLOAD CONTRACT
              </Link>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Contracts Table */}
          <div className="bg-white shadow-xl rounded-xl border-4 border-black overflow-hidden">
            <table className="min-w-full divide-y-2 divide-black">
              <thead className="bg-yellow-400">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-wider"
                  >
                    Vendor
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-wider"
                  >
                    Risk Score
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-wider"
                  >
                    Upload Date
                  </th>
                  <th scope="col" className="relative px-6 py-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y-2 divide-gray-200">
                {contracts.map((contract) => (
                  <tr
                    key={contract.id}
                    className="hover:bg-yellow-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-black">
                        {contract.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700 font-medium">
                        {contract.vendor || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(contract.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getRiskBadge(contract.riskScore)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                      {formatDate(contract.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                      <Link
                        to={`/contracts/${contract.id}`}
                        className="text-black hover:text-yellow-600 underline"
                      >
                        VIEW
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t-4 border-black sm:px-6 mt-4 rounded-xl shadow-xl border-4">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}
                    </span>{" "}
                    of <span className="font-medium">{pagination.total}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    {[...Array(pagination.pages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === pagination.pages ||
                        (page >= pagination.page - 1 &&
                          page <= pagination.page + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pagination.page
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === pagination.page - 2 ||
                        page === pagination.page + 2
                      ) {
                        return (
                          <span
                            key={page}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;

