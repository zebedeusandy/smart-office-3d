import { useRef, useState } from "react";
import { ImagePlus, Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { hubService } from "@/services/hub-service";
import {
  authorFromName,
  displayNameFor,
  POST_TAG_META,
} from "@/lib/hub-utils";
import type { PostTag } from "@/types/hub";
import { cn } from "@/lib/utils";

const tags: PostTag[] = ["update", "announcement", "question", "resource"];
const MAX_IMAGE_BYTES = 800 * 1024;

export function PostComposer() {
  const { user } = useAuth();
  const author = authorFromName(displayNameFor(user));
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState<PostTag>("update");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFile = (file?: File) => {
    setFileError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFileError("Upload an image file — PNG, JPG or WebP.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setFileError("That image is over 800 KB. Compress it and try again.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setImageUrl(reader.result);
    };
    reader.onerror = () => setFileError("The image could not be read.");
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      await hubService.createPost({
        title,
        body,
        tag,
        imageUrl: imageUrl ?? undefined,
        author,
      });
      setTitle("");
      setBody("");
      setTag("update");
      setImageUrl(null);
      setFileError(null);
      if (fileInput.current) fileInput.current.value = "";
      toast.success("Your post is live in the team feed.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The post could not be published.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      id="composer"
      onSubmit={handleSubmit}
      className="glass-panel scroll-mt-24 rounded-2xl p-4 sm:p-5"
    >
      <div className="flex items-center gap-3">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-full text-[11px] font-bold text-[#06101f]"
          style={{ backgroundColor: author.accent }}
        >
          {author.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-white">{author.name}</p>
          <p className="text-[10px] text-muted-foreground">
            Share something with the team
          </p>
        </div>
        <div className="ml-auto hidden items-center gap-1.5 sm:flex">
          {tags.map((option) => {
            const meta = POST_TAG_META[option];
            return (
              <button
                key={option}
                type="button"
                onClick={() => setTag(option)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[9px] font-medium transition-colors",
                  tag === option
                    ? meta.className
                    : "border-white/[0.08] bg-white/[0.02] text-muted-foreground hover:text-slate-200",
                )}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Give your post a short headline"
        maxLength={120}
        className="mt-4 h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-[13px] text-white outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-cyan-300/40 focus:bg-white/[0.05]"
      />
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Share an update, ask a question, or point the team to a resource…"
        rows={3}
        className="mt-2 w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[12.5px] leading-relaxed text-white outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-cyan-300/40 focus:bg-white/[0.05]"
      />

      {imageUrl && (
        <div className="relative mt-2 overflow-hidden rounded-xl border border-white/[0.08]">
          <img
            src={imageUrl}
            alt="Selected upload preview"
            className="max-h-64 w-full object-cover"
          />
          <button
            type="button"
            onClick={() => {
              setImageUrl(null);
              if (fileInput.current) fileInput.current.value = "";
            }}
            className="absolute right-2 top-2 grid size-7 place-items-center rounded-lg border border-white/20 bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
            aria-label="Remove uploaded image"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {fileError && (
        <p className="mt-2 text-[10.5px] text-rose-300">{fileError}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 sm:hidden">
          {tags.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTag(option)}
              className={cn(
                "rounded-full border px-2 py-1 text-[9px]",
                tag === option
                  ? POST_TAG_META[option].className
                  : "border-white/[0.08] text-muted-foreground",
              )}
            >
              {POST_TAG_META[option].label}
            </button>
          ))}
        </div>

        <input
          ref={fileInput}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5 text-[10px] text-slate-300 transition-colors hover:border-cyan-300/25 hover:text-white"
        >
          <ImagePlus className="size-3.5 text-cyan-300" />
          Add image
        </button>
        <span className="hidden text-[9px] text-muted-foreground sm:block">
          PNG, JPG or WebP · up to 800 KB
        </span>

        <button
          type="submit"
          disabled={submitting}
          className="ml-auto flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-300 to-blue-500 px-3.5 py-2 text-[11px] font-semibold text-[#04101f] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Posting
            </>
          ) : (
            <>
              <Send className="size-3.5" />
              Post to the hub
            </>
          )}
        </button>
      </div>
    </form>
  );
}
