import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchOrganization,
  fetchMembers,
  inviteMember,
  clearError,
} from "../store/slices/organizationSlice";
import api from "../api/client";

interface Invitation {
  id: string;
  email: string;
  role: string;
  invitedBy: { email: string };
  expiresAt: string;
  createdAt: string;
}

const OrganizationSettings = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { organization, members, loading, error } = useAppSelector(
    (state) => state.organization
  );

  const [activeTab, setActiveTab] = useState<"general" | "team" | "invitations">(
    "general"
  );
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "Viewer",
  });
  const [orgForm, setOrgForm] = useState({
    name: "",
  });
  const [editingOrg, setEditingOrg] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    dispatch(fetchOrganization());
    dispatch(fetchMembers());
  }, [dispatch]);

  useEffect(() => {
    if (activeTab === "invitations") {
      fetchInvitations();
    }
  }, [activeTab]);

  useEffect(() => {
    if (organization) {
      setOrgForm({ name: organization.name });
    }
  }, [organization]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const fetchInvitations = async () => {
    if (user?.role !== "Admin") return;

    setInvitationsLoading(true);
    try {
      const response = await api.get("/organizations/invitations");
      setInvitations(response.data.data.invitations || []);
    } catch (error) {
      console.error("Failed to fetch invitations:", error);
    } finally {
      setInvitationsLoading(false);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(inviteMember(inviteForm));

    if (inviteMember.fulfilled.match(result)) {
      setShowInviteModal(false);
      setInviteForm({ email: "", role: "Viewer" });
      setSuccessMessage("Invitation sent successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchInvitations();
    }
  };

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch("/organizations/current", orgForm);
      dispatch(fetchOrganization());
      setEditingOrg(false);
      setSuccessMessage("Organization updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update organization");
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!window.confirm("Are you sure you want to cancel this invitation?")) {
      return;
    }

    try {
      await api.delete(`/organizations/invitations/${invitationId}`);
      setSuccessMessage("Invitation cancelled successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchInvitations();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to cancel invitation");
    }
  };

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${memberEmail} from the organization?`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/organizations/members/${memberId}`);
      setSuccessMessage("Member removed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      dispatch(fetchMembers());
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to remove member");
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      await api.patch(`/organizations/members/${memberId}/role`, {
        role: newRole,
      });
      setSuccessMessage("Role updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      dispatch(fetchMembers());
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update role");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isAdmin = user?.role === "Admin";

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 p-6">
        <h1 className="text-4xl font-black text-black">
          ORGANIZATION <span className="text-yellow-400">SETTINGS</span>
        </h1>
        <p className="mt-2 text-gray-600 font-bold uppercase">
          Manage your organization, team members, and invitations
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-100 border-2 border-green-500 text-green-800 px-4 py-3 rounded-lg">
          <div className="flex">
            <svg
              className="h-5 w-5 text-green-600 mr-2"
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
            <span className="font-bold">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-100 border-2 border-red-500 text-red-800 px-4 py-3 rounded-lg">
          <span className="font-bold">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b-4 border-gray-700 mb-6">
        <nav className="-mb-1 flex space-x-8">
          <button
            onClick={() => setActiveTab("general")}
            className={`${
              activeTab === "general"
                ? "border-yellow-400 text-yellow-400"
                : "border-transparent text-gray-500 hover:text-gray-400 hover:border-gray-500"
            } whitespace-nowrap py-4 px-1 border-b-4 font-black text-sm uppercase`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`${
              activeTab === "team"
                ? "border-yellow-400 text-yellow-400"
                : "border-transparent text-gray-500 hover:text-gray-400 hover:border-gray-500"
            } whitespace-nowrap py-4 px-1 border-b-4 font-black text-sm uppercase`}
          >
            Team Members
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab("invitations")}
              className={`${
                activeTab === "invitations"
                  ? "border-yellow-400 text-yellow-400"
                  : "border-transparent text-gray-500 hover:text-gray-400 hover:border-gray-500"
              } whitespace-nowrap py-4 px-1 border-b-4 font-black text-sm uppercase`}
            >
              Invitations
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "general" && (
        <div className="bg-white rounded-xl border-4 border-black shadow-2xl p-6">
          <h2 className="text-xl font-black text-black mb-6 uppercase">
            Organization Details
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <svg
                className="animate-spin h-8 w-8 mx-auto text-yellow-400"
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
          ) : (
            <form onSubmit={handleUpdateOrg} className="space-y-6">
              <div>
                <label
                  htmlFor="orgName"
                  className="block text-sm font-bold text-gray-700 uppercase"
                >
                  Organization Name
                </label>
                <div className="mt-1 flex items-center space-x-3">
                  <input
                    type="text"
                    id="orgName"
                    value={orgForm.name}
                    onChange={(e) =>
                      setOrgForm({ ...orgForm, name: e.target.value })
                    }
                    disabled={!editingOrg || !isAdmin}
                    className="flex-1 px-3 py-2 bg-white border-2 border-gray-300 text-black rounded-md shadow-sm focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                  />
                  {isAdmin && (
                    <>
                      {!editingOrg ? (
                        <button
                          type="button"
                          onClick={() => setEditingOrg(true)}
                          className="px-4 py-2 border-2 border-black rounded-md text-sm font-bold text-black bg-white hover:bg-gray-100 uppercase"
                        >
                          Edit
                        </button>
                      ) : (
                        <>
                          <button
                            type="submit"
                            className="px-4 py-2 border-2 border-black rounded-md text-sm font-black text-yellow-400 bg-black hover:bg-gray-900 uppercase"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingOrg(false);
                              setOrgForm({ name: organization?.name || "" });
                            }}
                            className="px-4 py-2 border-2 border-black rounded-md text-sm font-bold text-black bg-white hover:bg-gray-100 uppercase"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="border-t-2 border-gray-200 pt-6">
                <h3 className="text-sm font-black text-black mb-4 uppercase">
                  Organization Statistics
                </h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="bg-yellow-50 rounded-lg border-2 border-yellow-500 p-4">
                    <dt className="text-sm font-bold text-gray-700 uppercase">
                      Total Members
                    </dt>
                    <dd className="mt-1 text-2xl font-black text-black">
                      {members.length}
                    </dd>
                  </div>
                  <div className="bg-yellow-50 rounded-lg border-2 border-yellow-500 p-4">
                    <dt className="text-sm font-bold text-gray-700 uppercase">
                      Created On
                    </dt>
                    <dd className="mt-1 text-sm font-bold text-black">
                      {organization?.createdAt
                        ? formatDate(organization.createdAt)
                        : "-"}
                    </dd>
                  </div>
                  <div className="bg-yellow-50 rounded-lg border-2 border-yellow-500 p-4">
                    <dt className="text-sm font-bold text-gray-700 uppercase">
                      Your Role
                    </dt>
                    <dd className="mt-1 text-sm font-black text-black uppercase">
                      {user?.role}
                    </dd>
                  </div>
                </dl>
              </div>
            </form>
          )}
        </div>
      )}

      {activeTab === "team" && (
        <div className="bg-white rounded-xl border-4 border-black shadow-2xl">
          <div className="p-6 border-b-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-black uppercase">
                  Team Members
                </h2>
                <p className="mt-1 text-sm text-gray-600 font-bold">
                  Manage your organization's team members and roles
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="inline-flex items-center px-4 py-2 border-2 border-black rounded-md shadow-sm text-sm font-black text-yellow-400 bg-black hover:bg-gray-900 uppercase"
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
                  Invite Member
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-black text-black uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-black text-black uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-black text-black uppercase tracking-wider">
                    Status
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-right text-xs font-black text-black uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center text-black font-black text-sm border-2 border-black">
                          {member.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-bold text-black">
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isAdmin && member.id !== user?.id ? (
                        <select
                          value={member.role}
                          onChange={(e) =>
                            handleUpdateRole(member.id, e.target.value)
                          }
                          className="text-sm bg-white text-black border-2 border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 font-bold"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Legal">Legal</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      ) : (
                        <span className="text-sm text-black font-bold">
                          {member.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-black rounded-full uppercase ${
                          member.isEmailVerified
                            ? "bg-green-100 text-green-800 border-2 border-green-500"
                            : "bg-yellow-100 text-yellow-800 border-2 border-yellow-500"
                        }`}
                      >
                        {member.isEmailVerified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                        {member.id !== user?.id ? (
                          <button
                            onClick={() =>
                              handleRemoveMember(member.id, member.email)
                            }
                            className="text-red-600 hover:text-red-700 font-black uppercase"
                          >
                            Remove
                          </button>
                        ) : (
                          <span className="text-gray-500 uppercase">You</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "invitations" && isAdmin && (
        <div className="bg-white rounded-xl border-4 border-black shadow-2xl">
          <div className="p-6 border-b-2 border-gray-200">
            <h2 className="text-xl font-black text-black uppercase">
              Pending Invitations
            </h2>
            <p className="mt-1 text-sm text-gray-600 font-bold">
              Manage pending team invitations
            </p>
          </div>

          {invitationsLoading ? (
            <div className="p-12 text-center">
              <svg
                className="animate-spin h-8 w-8 mx-auto text-yellow-600"
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
          ) : invitations.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-4 text-gray-600 font-bold uppercase">No pending invitations</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-black text-black uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-black text-black uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-black text-black uppercase tracking-wider">
                      Invited By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-black text-black uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-black text-black uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invitations.map((invitation) => (
                    <tr key={invitation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-bold">
                        {invitation.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-bold">
                        {invitation.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {invitation.invitedBy.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(invitation.expiresAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                        <button
                          onClick={() => handleCancelInvitation(invitation.id)}
                          className="text-red-600 hover:text-red-700 font-black uppercase"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowInviteModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-xl border-4 border-black text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleInviteSubmit}>
                <div className="bg-white px-6 pt-5 pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-black border-2 border-black sm:mx-0 sm:h-10 sm:w-10">
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-xl leading-6 font-black text-black mb-4 uppercase">
                        Invite Team Member
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="invite-email"
                            className="block text-sm font-bold text-gray-700 uppercase"
                          >
                            Email address
                          </label>
                          <input
                            type="email"
                            id="invite-email"
                            required
                            value={inviteForm.email}
                            onChange={(e) =>
                              setInviteForm({
                                ...inviteForm,
                                email: e.target.value,
                              })
                            }
                            className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-300 text-black rounded-md shadow-sm focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm placeholder-gray-400"
                            placeholder="colleague@example.com"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="invite-role"
                            className="block text-sm font-bold text-gray-700 uppercase"
                          >
                            Role
                          </label>
                          <select
                            id="invite-role"
                            value={inviteForm.role}
                            onChange={(e) =>
                              setInviteForm({
                                ...inviteForm,
                                role: e.target.value,
                              })
                            }
                            className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-300 text-black rounded-md shadow-sm focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm font-bold"
                          >
                            <option value="Admin">Admin</option>
                            <option value="Legal">Legal</option>
                            <option value="Viewer">Viewer</option>
                          </select>
                          <p className="mt-2 text-xs text-gray-600">
                            <strong className="text-black">Admin:</strong> Full access
                            <br />
                            <strong className="text-black">Legal:</strong> Can review and edit contracts
                            <br />
                            <strong className="text-black">Viewer:</strong> Can only view contracts
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 sm:flex sm:flex-row-reverse border-t-2 border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center rounded-md border-2 border-black shadow-sm px-4 py-2 bg-black text-base font-black text-yellow-400 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 uppercase"
                  >
                    {loading ? "Sending..." : "Send Invitation"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteForm({ email: "", role: "Viewer" });
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border-2 border-black shadow-sm px-4 py-2 bg-white text-base font-bold text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm uppercase"
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

export default OrganizationSettings;
