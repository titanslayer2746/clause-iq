import { useState, useEffect } from "react";
import { useAppSelector } from "../store/hooks";
import api from "../api/client";

interface Comment {
  _id: string;
  userId: { email: string };
  text: string;
  mentions: Array<{ email: string }>;
  edited: boolean;
  editedAt?: string;
  createdAt: string;
  replies?: Comment[];
}

interface CommentsProps {
  contractId: string;
}

const Comments = ({ contractId }: CommentsProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [contractId]);

  const fetchComments = async () => {
    try {
      const response = await api.get(`/comments/contracts/${contractId}`);
      setComments(response.data.data.comments || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await api.post(`/comments/contracts/${contractId}`, {
        text: newComment,
      });
      setNewComment("");
      fetchComments();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim()) return;

    setLoading(true);
    try {
      await api.post(`/comments/contracts/${contractId}`, {
        text: replyText,
        parentId,
      });
      setReplyText("");
      setReplyingTo(null);
      fetchComments();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to add reply");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await api.delete(`/comments/${commentId}`);
      fetchComments();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete comment");
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Comments ({comments.length})
      </h3>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="border-l-2 border-gray-200 pl-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                      {comment.userId.email.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        {comment.userId.email}
                      </p>
                      <span className="mx-2 text-gray-400">·</span>
                      <p className="text-xs text-gray-500">
                        {formatTime(comment.createdAt)}
                        {comment.edited && " (edited)"}
                      </p>
                    </div>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                      {comment.text}
                    </p>

                    {/* Reply Button */}
                    <button
                      onClick={() => setReplyingTo(comment._id)}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                    >
                      Reply
                    </button>

                    {/* Reply Form */}
                    {replyingTo === comment._id && (
                      <div className="mt-3">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText("");
                            }}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubmitReply(comment._id)}
                            disabled={loading || !replyText.trim()}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply._id} className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="h-6 w-6 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold text-xs">
                                {reply.userId.email.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="ml-2 flex-1">
                              <div className="bg-gray-50 rounded-lg p-2">
                                <div className="flex items-center">
                                  <p className="text-xs font-medium text-gray-900">
                                    {reply.userId.email}
                                  </p>
                                  <span className="mx-1 text-gray-400">·</span>
                                  <p className="text-xs text-gray-500">
                                    {formatTime(reply.createdAt)}
                                  </p>
                                </div>
                                <p className="text-xs text-gray-700 mt-1">
                                  {reply.text}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Delete button (only for own comments) */}
                {comment.userId.email === user?.email && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="text-gray-400 hover:text-red-600 ml-2"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;

