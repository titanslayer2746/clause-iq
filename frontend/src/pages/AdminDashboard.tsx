import { useState, useEffect } from "react";
import { useAppSelector } from "../store/hooks";
import api from "../api/client";

const AdminDashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "Admin") {
      fetchMetrics();
    }
  }, [user]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await api.get("/metrics/admin");
      setMetrics(response.data.data);
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "Admin") {
    return (
      <div className="text-center py-12 p-6">
        <div className="bg-white rounded-xl border-4 border-black p-12 shadow-2xl">
          <h2 className="text-3xl font-black text-black">ACCESS DENIED</h2>
          <p className="mt-2 text-lg text-gray-600 font-medium">
            Only administrators can access this dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 p-6">
        <svg
          className="animate-spin h-12 w-12 text-yellow-400"
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
      </div>
    );
  }

  if (!metrics) {
    return <div className="text-center py-12 text-yellow-400 font-bold text-xl">NO METRICS AVAILABLE</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black">
          ADMIN <span className="text-yellow-400">DASHBOARD</span>
        </h1>
        <p className="mt-2 text-lg text-gray-600 font-bold">
          ORGANIZATION METRICS AND USAGE STATISTICS
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border-4 border-black shadow-2xl p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-md bg-black flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-yellow-400"
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
              <p className="text-sm font-bold text-gray-600 uppercase">Total Contracts</p>
              <p className="text-3xl font-black text-black">
                {metrics.overview.totalContracts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-4 border-black shadow-2xl p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-md bg-black flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-bold text-gray-600 uppercase">Total Tasks</p>
              <p className="text-3xl font-black text-black">
                {metrics.overview.totalTasks}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-4 border-black shadow-2xl p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-md bg-black flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-bold text-gray-600 uppercase">AI Extractions</p>
              <p className="text-3xl font-black text-black">
                {metrics.overview.totalExtractions}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-4 border-black shadow-2xl p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-md bg-black flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-bold text-gray-600 uppercase">Chat Messages</p>
              <p className="text-3xl font-black text-black">
                {metrics.overview.totalChatMessages}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border-4 border-black shadow-2xl p-6">
          <h3 className="text-xl font-black text-black mb-6 uppercase">
            Risk Distribution
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-2 border-red-500">
              <span className="text-sm font-bold text-gray-700 uppercase">High Risk</span>
              <span className="text-xl font-black text-red-600">
                {metrics.riskDistribution.high}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-2 border-yellow-500">
              <span className="text-sm font-bold text-gray-700 uppercase">Medium Risk</span>
              <span className="text-xl font-black text-yellow-600">
                {metrics.riskDistribution.medium}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-2 border-green-500">
              <span className="text-sm font-bold text-gray-700 uppercase">Low Risk</span>
              <span className="text-xl font-black text-green-600">
                {metrics.riskDistribution.low}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-gray-400">
              <span className="text-sm font-bold text-gray-700 uppercase">Not Analyzed</span>
              <span className="text-xl font-black text-gray-600">
                {metrics.riskDistribution.unanalyzed}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-4 border-black shadow-2xl p-6">
          <h3 className="text-xl font-black text-black mb-6 uppercase">
            Task Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-gray-400">
              <span className="text-sm font-bold text-gray-700 uppercase">Pending</span>
              <span className="text-xl font-black text-gray-600">
                {metrics.taskDistribution.pending}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-2 border-blue-500">
              <span className="text-sm font-bold text-gray-700 uppercase">In Progress</span>
              <span className="text-xl font-black text-blue-600">
                {metrics.taskDistribution.in_progress}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-2 border-green-500">
              <span className="text-sm font-bold text-gray-700 uppercase">Completed</span>
              <span className="text-xl font-black text-green-600">
                {metrics.taskDistribution.completed}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-2 border-red-500">
              <span className="text-sm font-bold text-gray-700 uppercase">Cancelled</span>
              <span className="text-xl font-black text-red-600">
                {metrics.taskDistribution.cancelled}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border-4 border-black shadow-2xl p-6">
        <h3 className="text-xl font-black text-black mb-6 uppercase">
          Recent Activity (This Month)
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-500">
            <p className="text-sm font-bold text-gray-700 uppercase">Contracts Added</p>
            <p className="text-3xl font-black text-black mt-2">
              {metrics.recentActivity.contractsThisMonth}
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-500">
            <p className="text-sm font-bold text-gray-700 uppercase">Tasks Created</p>
            <p className="text-3xl font-black text-black mt-2">
              {metrics.recentActivity.tasksThisMonth}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

