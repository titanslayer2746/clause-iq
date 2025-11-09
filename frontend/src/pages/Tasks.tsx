import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchTasks, updateTask, deleteTask, createTask } from "../store/slices/tasksSlice";
import { fetchMembers } from "../store/slices/organizationSlice";

const Tasks = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { tasks, loading, error, pagination } = useAppSelector(
    (state) => state.tasks
  );
  const { members } = useAppSelector((state) => state.organization);

  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    type: "",
    page: 1,
    limit: 20,
  });

  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    dispatch(fetchTasks(filters));
    dispatch(fetchMembers());
  }, [dispatch, filters]);

  const getPriorityBadge = (priority: string) => {
    const priorityClasses: { [key: string]: string } = {
      critical: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };

    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          priorityClasses[priority] || "bg-gray-100 text-gray-800"
        }`}
      >
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: { [key: string]: string } = {
      pending: "bg-gray-100 text-gray-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    const statusLabels: { [key: string]: string } = {
      pending: "Pending",
      in_progress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
    };

    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          statusClasses[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {statusLabels[status] || status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const daysUntil = Math.ceil(
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    const formatted = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    if (daysUntil < 0) {
      return (
        <span className="text-red-600 font-medium">
          {formatted} (Overdue)
        </span>
      );
    } else if (daysUntil <= 7) {
      return (
        <span className="text-orange-600 font-medium">
          {formatted} ({daysUntil}d)
        </span>
      );
    }

    return formatted;
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const result = await dispatch(updateTask({ taskId, updates: { status: newStatus } as any }));
      if (updateTask.fulfilled.match(result)) {
        // Task updated successfully
        console.log("Task status updated successfully");
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
      alert("Failed to update task status. Please try again.");
    }
  };

  const handleAssignTask = async (taskId: string, userId: string) => {
    try {
      const result = await dispatch(updateTask({ 
        taskId, 
        updates: { assignedTo: userId || undefined } as any 
      }));
      if (updateTask.fulfilled.match(result)) {
        console.log("Task assignment updated successfully");
      }
    } catch (error) {
      console.error("Failed to assign task:", error);
      alert("Failed to assign task. Please try again.");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await dispatch(deleteTask(taskId));
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  const groupedTasks = {
    pending: tasks.filter((t) => t.status === "pending"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    completed: tasks.filter((t) => t.status === "completed"),
    cancelled: tasks.filter((t) => t.status === "cancelled"),
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black">
          TASK <span className="text-yellow-600">MANAGEMENT</span>
        </h1>
        <p className="mt-2 text-lg text-gray-700 font-medium">
          Manage contract-related tasks and deadlines
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-100 border-2 border-red-500 text-red-800 px-4 py-3 rounded-lg font-medium">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Filters and View Controls */}
      <div className="bg-yellow-400 rounded-xl border-4 border-black mb-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex gap-3 flex-wrap">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value, page: 1 })
              }
              className="px-3 py-2 border-2 border-black rounded-lg font-bold bg-white"
            >
              <option value="">ALL STATUSES</option>
              <option value="pending">PENDING</option>
              <option value="in_progress">IN PROGRESS</option>
              <option value="completed">COMPLETED</option>
              <option value="cancelled">CANCELLED</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters({ ...filters, priority: e.target.value, page: 1 })
              }
              className="px-3 py-2 border-2 border-black rounded-lg font-bold bg-white"
            >
              <option value="">ALL PRIORITIES</option>
              <option value="critical">CRITICAL</option>
              <option value="high">HIGH</option>
              <option value="medium">MEDIUM</option>
              <option value="low">LOW</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) =>
                setFilters({ ...filters, type: e.target.value, page: 1 })
              }
              className="px-3 py-2 border-2 border-black rounded-lg font-bold bg-white"
            >
              <option value="">ALL TYPES</option>
              <option value="renewal">RENEWAL</option>
              <option value="termination">TERMINATION</option>
              <option value="notice">NOTICE</option>
              <option value="obligation">OBLIGATION</option>
              <option value="custom">CUSTOM</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg font-bold transition transform hover:scale-105 ${
                viewMode === "list"
                  ? "bg-black text-yellow-400"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              LIST
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`px-4 py-2 rounded-lg font-bold transition transform hover:scale-105 ${
                viewMode === "board"
                  ? "bg-black text-yellow-400"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              BOARD
            </button>
          </div>
        </div>
      </div>

      {loading && tasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg
            className="animate-spin h-12 w-12 mx-auto text-blue-600"
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
          <p className="mt-4 text-gray-500">Loading tasks...</p>
        </div>
      ) : viewMode === "list" ? (
        /* List View */
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contract
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {task.title}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {task.type.replace("_", " ")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/contracts/${task.contractId.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {task.contractId.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(task.dueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPriorityBadge(task.priority)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task.id, e.target.value)
                      }
                      className="text-xs font-semibold rounded-md border-2 border-gray-300 px-2 py-1 focus:outline-none focus:border-yellow-400 hover:border-gray-400 transition"
                      style={{
                        backgroundColor:
                          task.status === "completed"
                            ? "#dcfce7"
                            : task.status === "in_progress"
                            ? "#dbeafe"
                            : task.status === "cancelled"
                            ? "#fee2e2"
                            : "#f3f4f6",
                        color:
                          task.status === "completed"
                            ? "#166534"
                            : task.status === "in_progress"
                            ? "#1e40af"
                            : task.status === "cancelled"
                            ? "#991b1b"
                            : "#374151",
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={task.assignedTo?.id || ""}
                      onChange={(e) =>
                        handleAssignTask(task.id, e.target.value)
                      }
                      className="text-xs font-medium rounded-md border-2 border-gray-300 px-2 py-1 focus:outline-none focus:border-yellow-400 hover:border-gray-400 transition max-w-[180px] truncate"
                    >
                      <option value="">Unassigned</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.email}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {tasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No tasks found</p>
            </div>
          )}
        </div>
      ) : (
        /* Board View */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Object.entries(groupedTasks).map(([status, statusTasks]) => (
            <div key={status} className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4 capitalize flex items-center justify-between">
                {status.replace("_", " ")}
                <span className="text-sm font-normal text-gray-500">
                  {statusTasks.length}
                </span>
              </h3>
              <div className="space-y-3">
                {statusTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {task.title}
                      </h4>
                      {getPriorityBadge(task.priority)}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {task.contractId.title}
                    </p>
                    <div className="text-xs text-gray-500">
                      Due: {formatDate(task.dueDate)}
                    </div>
                    <div className="mt-2">
                      <select
                        value={task.assignedTo?.id || ""}
                        onChange={(e) =>
                          handleAssignTask(task.id, e.target.value)
                        }
                        className="text-xs w-full font-medium rounded-md border-2 border-gray-300 px-2 py-1 focus:outline-none focus:border-yellow-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="">Unassigned</option>
                        {members.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
                {statusTasks.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No tasks
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;

