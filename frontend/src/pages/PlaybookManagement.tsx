import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchRules,
  createRule,
  updateRule,
  deleteRule,
  fetchStats,
} from "../store/slices/playbookSlice";

const PlaybookManagement = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { rules, stats, loading, error } = useAppSelector(
    (state) => state.playbook
  );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [ruleForm, setRuleForm] = useState({
    name: "",
    description: "",
    ruleType: "clause_required",
    category: "Legal",
    severity: "medium" as "low" | "medium" | "high" | "critical",
    config: {
      clauseType: "",
      minValue: "",
      maxValue: "",
    },
    recommendation: "",
  });

  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    dispatch(fetchRules());
    dispatch(fetchStats());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ruleData = {
      ...ruleForm,
      config: {
        ...ruleForm.config,
        minValue: ruleForm.config.minValue
          ? Number(ruleForm.config.minValue)
          : undefined,
        maxValue: ruleForm.config.maxValue
          ? Number(ruleForm.config.maxValue)
          : undefined,
      },
    };

    if (editingRule) {
      await dispatch(updateRule({ ruleId: editingRule.id, updates: ruleData }));
    } else {
      await dispatch(createRule(ruleData));
    }

    resetForm();
    dispatch(fetchStats());
  };

  const handleEdit = (rule: any) => {
    setEditingRule(rule);
    setRuleForm({
      name: rule.name,
      description: rule.description || "",
      ruleType: rule.ruleType,
      category: rule.category,
      severity: rule.severity,
      config: {
        clauseType: rule.config.clauseType || "",
        minValue: rule.config.minValue?.toString() || "",
        maxValue: rule.config.maxValue?.toString() || "",
      },
      recommendation: rule.recommendation || "",
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (ruleId: string) => {
    if (window.confirm("Are you sure you want to delete this rule?")) {
      await dispatch(deleteRule(ruleId));
      dispatch(fetchStats());
    }
  };

  const handleToggleEnabled = async (rule: any) => {
    await dispatch(
      updateRule({ ruleId: rule.id, updates: { enabled: !rule.enabled } })
    );
    dispatch(fetchRules());
  };

  const resetForm = () => {
    setRuleForm({
      name: "",
      description: "",
      ruleType: "clause_required",
      category: "Legal",
      severity: "medium",
      config: {
        clauseType: "",
        minValue: "",
        maxValue: "",
      },
      recommendation: "",
    });
    setEditingRule(null);
    setShowCreateModal(false);
  };

  const getSeverityBadge = (severity: string) => {
    const classes = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          classes[severity as keyof typeof classes] || "bg-gray-100 text-gray-800"
        }`}
      >
        {severity}
      </span>
    );
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-gray-600">
          Only administrators can manage playbook rules.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 p-6">
        <h1 className="text-4xl font-black text-black">
          PLAYBOOK <span className="text-yellow-600">MANAGEMENT</span>
        </h1>
        <p className="mt-2 text-lg text-gray-700 font-medium">
          Define compliance rules for contract review
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-500">Total Rules</p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">
              {stats.totalRules}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-500">Enabled Rules</p>
            <p className="text-2xl font-semibold text-green-600 mt-2">
              {stats.enabledRules}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-500">Avg Compliance</p>
            <p className="text-2xl font-semibold text-blue-600 mt-2">
              {stats.averageScore}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-500">Pass Rate</p>
            <p className="text-2xl font-semibold text-purple-600 mt-2">
              {stats.totalContracts > 0
                ? Math.round((stats.passedContracts / stats.totalContracts) * 100)
                : 0}
              %
            </p>
          </div>
        </div>
      )}

      {/* Rules Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Compliance Rules
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
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
              Add Rule
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rule Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {rule.name}
                    </div>
                    {rule.description && (
                      <div className="text-xs text-gray-500 mt-1">
                        {rule.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rule.ruleType.replace("_", " ")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rule.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSeverityBadge(rule.severity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleEnabled(rule)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        rule.enabled
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {rule.enabled ? "Enabled" : "Disabled"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(rule)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {rules.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No rules defined. Create your first compliance rule.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={resetForm}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-6 pt-5 pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingRule ? "Edit Rule" : "Create New Rule"}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Rule Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={ruleForm.name}
                        onChange={(e) =>
                          setRuleForm({ ...ruleForm, name: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        value={ruleForm.description}
                        onChange={(e) =>
                          setRuleForm({ ...ruleForm, description: e.target.value })
                        }
                        rows={2}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Rule Type *
                        </label>
                        <select
                          value={ruleForm.ruleType}
                          onChange={(e) =>
                            setRuleForm({ ...ruleForm, ruleType: e.target.value })
                          }
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="clause_required">Clause Required</option>
                          <option value="clause_forbidden">Clause Forbidden</option>
                          <option value="term_length">Term Length</option>
                          <option value="liability_cap">Liability Cap</option>
                          <option value="value_range">Value Range</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Category *
                        </label>
                        <input
                          type="text"
                          required
                          value={ruleForm.category}
                          onChange={(e) =>
                            setRuleForm({ ...ruleForm, category: e.target.value })
                          }
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Severity *
                      </label>
                      <select
                        value={ruleForm.severity}
                        onChange={(e) =>
                          setRuleForm({
                            ...ruleForm,
                            severity: e.target.value as any,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    {(ruleForm.ruleType === "clause_required" ||
                      ruleForm.ruleType === "clause_forbidden") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Clause Type
                        </label>
                        <input
                          type="text"
                          value={ruleForm.config.clauseType}
                          onChange={(e) =>
                            setRuleForm({
                              ...ruleForm,
                              config: {
                                ...ruleForm.config,
                                clauseType: e.target.value,
                              },
                            })
                          }
                          placeholder="e.g., Termination, Liability, Indemnity"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    )}

                    {ruleForm.ruleType === "term_length" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Min Months
                          </label>
                          <input
                            type="number"
                            value={ruleForm.config.minValue}
                            onChange={(e) =>
                              setRuleForm({
                                ...ruleForm,
                                config: {
                                  ...ruleForm.config,
                                  minValue: e.target.value,
                                },
                              })
                            }
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Max Months
                          </label>
                          <input
                            type="number"
                            value={ruleForm.config.maxValue}
                            onChange={(e) =>
                              setRuleForm({
                                ...ruleForm,
                                config: {
                                  ...ruleForm.config,
                                  maxValue: e.target.value,
                                },
                              })
                            }
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Recommendation
                      </label>
                      <textarea
                        value={ruleForm.recommendation}
                        onChange={(e) =>
                          setRuleForm({
                            ...ruleForm,
                            recommendation: e.target.value,
                          })
                        }
                        rows={2}
                        placeholder="What should be done if this rule is violated?"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {loading ? "Saving..." : editingRule ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaybookManagement;

