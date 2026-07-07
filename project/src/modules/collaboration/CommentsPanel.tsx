import { useEffect, useState } from "react";
import { X, MessageSquare, Send } from "lucide-react";
import { addComment, subscribeToComments, type CommentDoc } from "@/modules/dashboard/projectService";
import { useAuthStore } from "@/store/authStore";

function formatTime(timestamp: any) {
  if (!timestamp?.toDate) return "Just now";
  return timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Volume 09 — Comments + Chat. Firestore real-time listener use karta hai,
// isliye sab collaborators ko naye comments turant dikhte hain.
export default function CommentsPanel({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const [comments, setComments] = useState<CommentDoc[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToComments(projectId, setComments);
    return () => unsubscribe();
  }, [projectId]);

  async function handleSend() {
    if (!text.trim() || !user) return;
    const messageText = text.trim();
    setText("");
    await addComment(projectId, user.email ?? "unknown", messageText);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-canvas-panel border border-canvas-border rounded-lg w-full max-w-sm p-4 max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare size={15} /> Comments
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-3">
          {comments.length === 0 && (
            <p className="text-[11px] text-white/30 text-center py-4">
              Abhi koi comment nahi hai — pehla comment likhein.
            </p>
          )}
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white/5 rounded-md px-3 py-2 text-xs">
              <div className="flex justify-between text-[10px] text-white/40 mb-1">
                <span>{comment.authorEmail}</span>
                <span>{formatTime(comment.createdAt)}</span>
              </div>
              <div className="text-white/80">{comment.text}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Comment likhein..."
            className="flex-1 bg-canvas-bg border border-canvas-border rounded-md px-2 py-1.5 text-xs outline-none focus:border-brand-500"
          />
          <button
            onClick={handleSend}
            className="flex items-center justify-center rounded-md bg-brand-600 hover:bg-brand-700 w-9 transition-colors"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
