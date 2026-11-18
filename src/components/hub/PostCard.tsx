import { useMemo, useRef, useState } from "react";
import { Heart, Loader2, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { hubService } from "@/services/hub-service";
import {
  authorFromName,
  displayNameFor,
  formatRelative,
  POST_TAG_META,
} from "@/lib/hub-utils";
import type { Post } from "@/types/hub";
import { cn } from "@/lib/utils";

export function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const author = useMemo(() => authorFromName(displayNameFor(user)), [user]);
  const tag = POST_TAG_META[post.tag];
  const TagIcon = tag.icon;
  const [comment, setComment] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [liking, setLiking] = useState(false);
  const [posting, setPosting] = useState(false);
  const commentInput = useRef<HTMLInputElement>(null);

  const visibleComments = showAllComments
    ? post.comments
    : post.comments.slice(-2);
  const hiddenComments = post.comments.length - visibleComments.length;

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      await hubService.toggleLike(post.id);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The reaction could not be saved.",
      );
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (posting || !comment.trim()) return;
    setPosting(true);
    try {
      await hubService.addComment(post.id, comment, author);
      setComment("");
      setShowAllComments(true);
      toast.success("Comment added.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The comment could not be added.",
      );
    } finally {
      setPosting(false);
    }
  };

  return (
    <article className="glass-panel rounded-2xl p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-full text-[11px] font-bold text-[#06101f]"
          style={{ backgroundColor: post.authorAccent }}
        >
          {post.authorInitials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-xs font-semibold text-white">{post.authorName}</p>
            <span className="text-[10px] text-muted-foreground">
              {formatRelative(post.createdAt)}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {post.tag === "question" ? "Asking the team" : "Shared with the team"}
          </p>
        </div>
        <span
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-medium",
            tag.className,
          )}
        >
          <TagIcon className="size-2.5" />
          {tag.label}
        </span>
      </div>

      <div className="mt-3">
        <h3 className="font-display text-[15px] font-semibold leading-snug text-white">
          {post.title}
        </h3>
        <p className="mt-1.5 whitespace-pre-line text-[12px] leading-relaxed text-slate-300">
          {post.body}
        </p>
      </div>

      {post.imageUrl && (
        <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.07]">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="max-h-[360px] w-full object-cover"
          />
        </div>
      )}

      <div className="mt-3.5 flex items-center gap-2 border-t border-white/[0.06] pt-3">
        <button
          type="button"
          onClick={handleLike}
          disabled={liking}
          aria-pressed={post.likedByMe}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10.5px] transition-colors",
            post.likedByMe
              ? "bg-rose-400/10 text-rose-300"
              : "text-muted-foreground hover:bg-white/[0.05] hover:text-slate-200",
          )}
        >
          <Heart className={cn("size-3.5", post.likedByMe && "fill-rose-300")} />
          {post.likes}
        </button>
        <button
          type="button"
          onClick={() => {
            setCommenting((value) => !value);
            window.setTimeout(() => commentInput.current?.focus(), 40);
          }}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10.5px] text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-slate-200"
        >
          <MessageCircle className="size-3.5" />
          {post.comments.length}{" "}
          {post.comments.length === 1 ? "comment" : "comments"}
        </button>
      </div>

      {post.comments.length > 0 && (
        <div className="mt-2 space-y-2 rounded-xl border border-white/[0.05] bg-white/[0.02] p-2.5">
          {hiddenComments > 0 && (
            <button
              type="button"
              onClick={() => setShowAllComments(true)}
              className="text-[10px] font-medium text-cyan-300 transition-colors hover:text-cyan-200"
            >
              Show {hiddenComments} earlier {hiddenComments === 1 ? "comment" : "comments"}
            </button>
          )}
          {visibleComments.map((item) => (
            <div key={item.id} className="flex gap-2">
              <span
                className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[8px] font-bold text-[#06101f]"
                style={{ backgroundColor: item.authorAccent }}
              >
                {item.authorInitials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 text-[10.5px]">
                  <span className="font-medium text-slate-100">
                    {item.authorName}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    {formatRelative(item.createdAt)}
                  </span>
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-300">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {commenting && (
        <form onSubmit={handleComment} className="mt-2 flex items-center gap-2">
          <span
            className="grid size-6 shrink-0 place-items-center rounded-full text-[8px] font-bold text-[#06101f]"
            style={{ backgroundColor: author.accent }}
          >
            {author.initials}
          </span>
          <input
            ref={commentInput}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Add to the conversation…"
            maxLength={400}
            className="h-8 min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-[11px] text-white outline-none placeholder:text-muted-foreground/60 focus:border-cyan-300/40"
          />
          <button
            type="submit"
            disabled={posting || !comment.trim()}
            aria-label="Post comment"
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-cyan-400/15 text-cyan-200 transition-colors hover:bg-cyan-400/25 disabled:opacity-40"
          >
            {posting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
          </button>
        </form>
      )}
    </article>
  );
}
