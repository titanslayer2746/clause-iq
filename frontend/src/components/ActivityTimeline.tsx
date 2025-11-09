import { useState, useEffect } from "react";
import api from "../api/client";

interface AuditLog {
  id: string;
  userId?: { email: string };
  action: string;
  resourceType: string;
  changes?: Array<{
    field: string;
    oldValue?: any;
    newValue?: any;
  }>;
  metadata?: any;
  createdAt: string;
}

interface ActivityTimelineProps {
  contractId: string;
}

const ActivityTimeline = ({ contractId }: ActivityTimelineProps) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [contractId]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/audit-logs/contracts/${contractId}`);
      setLogs(response.data.data.logs || []);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    const icons: { [key: string]: string } = {
      contract_created: "📄",
      contract_updated: "✏️",
      extraction_run: "📝",
      ai_extraction_run: "🤖",
      compliance_check: "✅",
      risk_analysis: "⚠️",
      task_created: "📋",
      field_edited: "✏️",
      comment_added: "💬",
    };
    return icons[action] || "📌";
  };

  const getActionLabel = (action: string) => {
    return action
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Activity Timeline
        </h3>
        <div className="text-center py-8">
          <svg
            className="animate-spin h-8 w-8 mx-auto text-blue-600"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Activity Timeline
      </h3>

      {logs.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No activity yet</p>
      ) : (
        <div className="flow-root">
          <ul className="-mb-8">
            {logs.map((log, idx) => (
              <li key={log.id}>
                <div className="relative pb-8">
                  {idx < logs.length - 1 && (
                    <span
                      className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    ></span>
                  )}
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                        {getActionIcon(log.action)}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">
                            {log.userId?.email || "System"}
                          </span>
                          <span className="text-gray-500 ml-1">
                            {getActionLabel(log.action).toLowerCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatTime(log.createdAt)}
                        </p>
                      </div>
                      {log.changes && log.changes.length > 0 && (
                        <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
                          {log.changes.map((change, changeIdx) => (
                            <div key={changeIdx}>
                              <span className="font-medium">{change.field}:</span>{" "}
                              {change.oldValue && (
                                <span className="line-through text-red-600">
                                  {String(change.oldValue).substring(0, 50)}
                                </span>
                              )}{" "}
                              →{" "}
                              <span className="text-green-600">
                                {String(change.newValue).substring(0, 50)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;

