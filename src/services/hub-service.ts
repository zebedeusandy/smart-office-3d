import { seedBookings, seedCatalog, seedPosts } from "@/data/hub";
import { roomsSeed } from "@/data/office";
import type {
  Author,
  Booking,
  CatalogItem,
  HubSnapshot,
  NewBookingInput,
  NewCatalogItemInput,
  NewPostInput,
  Post,
  PostComment,
} from "@/types/hub";

/**
 * Data boundary for the team hub.
 *
 * Content is persisted in localStorage for the prototype. Every method is async
 * and returns plain data, so the same interface can be backed by Convex or
 * Firestore without changing the feed, catalog, booking or admin screens.
 */

const STORAGE_KEY = "hub-agent-net:workspace:v2";
const HUB_EVENT = "hub:updated";

interface HubStore {
  posts: Post[];
  catalog: CatalogItem[];
  bookings: Booking[];
  likedPostIds: string[];
}

let store: HubStore | null = null;

const makeId = (prefix: string) => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
};

const createSeedStore = (): HubStore => ({
  posts: seedPosts.map((post) => ({
    ...post,
    comments: post.comments.map((comment) => ({ ...comment })),
  })),
  catalog: seedCatalog.map((item) => ({ ...item, tags: [...item.tags] })),
  bookings: seedBookings.map((booking) => ({ ...booking })),
  likedPostIds: seedPosts
    .filter((post) => post.likedByMe)
    .map((post) => post.id),
});

const persist = () => {
  if (typeof window === "undefined" || !store) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.warn("[hub] Could not persist workspace data:", error);
  }
};

const notify = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(HUB_EVENT));
  }
};

const loadStore = (): HubStore => {
  if (store) return store;

  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<HubStore>;
        if (
          Array.isArray(parsed.posts) &&
          Array.isArray(parsed.catalog) &&
          Array.isArray(parsed.bookings) &&
          Array.isArray(parsed.likedPostIds)
        ) {
          store = parsed as HubStore;
          return store;
        }
      }
    } catch (error) {
      console.warn("[hub] Could not read stored workspace data:", error);
    }
  }

  store = createSeedStore();
  persist();
  return store;
};

const snapshot = (): HubSnapshot => {
  const current = loadStore();
  return {
    posts: [...current.posts]
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((post) => ({
        ...post,
        likedByMe: current.likedPostIds.includes(post.id),
        comments: [...post.comments].sort((a, b) => a.createdAt - b.createdAt),
      })),
    catalog: [...current.catalog]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((item) => ({ ...item, tags: [...item.tags] })),
    bookings: [...current.bookings]
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
      .map((booking) => ({ ...booking })),
    updatedAt: Date.now(),
  };
};

const wait = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export const hubService = {
  async fetchSnapshot(): Promise<HubSnapshot> {
    await wait();
    return snapshot();
  },

  async createPost(input: NewPostInput): Promise<Post> {
    const current = loadStore();
    if (!input.title.trim()) throw new Error("Add a title before posting.");
    if (!input.body.trim()) throw new Error("Add a message before posting.");

    const post: Post = {
      id: makeId("post"),
      authorName: input.author.name,
      authorInitials: input.author.initials,
      authorAccent: input.author.accent,
      title: input.title.trim(),
      body: input.body.trim(),
      tag: input.tag,
      imageUrl: input.imageUrl,
      likes: 0,
      likedByMe: false,
      comments: [],
      createdAt: Date.now(),
    };

    current.posts.unshift(post);
    persist();
    notify();
    return { ...post };
  },

  async toggleLike(postId: string): Promise<void> {
    const current = loadStore();
    const post = current.posts.find((item) => item.id === postId);
    if (!post) throw new Error("That post no longer exists.");

    const liked = current.likedPostIds.includes(postId);
    if (liked) {
      current.likedPostIds = current.likedPostIds.filter((id) => id !== postId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      current.likedPostIds.push(postId);
      post.likes += 1;
    }
    persist();
    notify();
  },

  async addComment(
    postId: string,
    body: string,
    author: Author,
  ): Promise<PostComment> {
    const current = loadStore();
    const post = current.posts.find((item) => item.id === postId);
    if (!post) throw new Error("That post no longer exists.");
    if (!body.trim()) throw new Error("Write a comment first.");

    const comment: PostComment = {
      id: makeId("comment"),
      authorName: author.name,
      authorInitials: author.initials,
      authorAccent: author.accent,
      body: body.trim(),
      createdAt: Date.now(),
    };
    post.comments.push(comment);
    persist();
    notify();
    return comment;
  },

  async deletePost(postId: string): Promise<void> {
    const current = loadStore();
    current.posts = current.posts.filter((post) => post.id !== postId);
    current.likedPostIds = current.likedPostIds.filter((id) => id !== postId);
    persist();
    notify();
  },

  async createBooking(input: NewBookingInput): Promise<Booking> {
    const current = loadStore();
    const room = roomsSeed.find((item) => item.id === input.roomId);
    if (!room) throw new Error("Choose a room for the booking.");
    if (!input.title.trim()) throw new Error("Give the booking a title.");
    if (!input.date) throw new Error("Choose a date for the booking.");
    if (input.endTime <= input.startTime) {
      throw new Error("The end time needs to be after the start time.");
    }

    const today = new Date().toISOString().slice(0, 10);
    if (input.date < today) {
      throw new Error("Choose today or a future date.");
    }

    const conflict = current.bookings.find(
      (booking) =>
        booking.status === "confirmed" &&
        booking.roomId === input.roomId &&
        booking.date === input.date &&
        input.startTime < booking.endTime &&
        input.endTime > booking.startTime,
    );
    if (conflict) {
      throw new Error(
        `${room.name} is already booked from ${conflict.startTime} to ${conflict.endTime}.`,
      );
    }

    const booking: Booking = {
      id: makeId("booking"),
      title: input.title.trim(),
      roomId: input.roomId,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      organizer: input.organizer,
      attendees: Math.max(1, input.attendees || 1),
      note: input.note?.trim() || undefined,
      status: "confirmed",
      createdAt: Date.now(),
    };
    current.bookings.push(booking);
    persist();
    notify();
    return { ...booking };
  },

  async cancelBooking(bookingId: string): Promise<void> {
    const current = loadStore();
    const booking = current.bookings.find((item) => item.id === bookingId);
    if (!booking) throw new Error("That booking no longer exists.");
    booking.status = "cancelled";
    persist();
    notify();
  },

  async addCatalogItem(input: NewCatalogItemInput): Promise<CatalogItem> {
    const current = loadStore();
    if (!input.name.trim()) throw new Error("Give the catalog item a name.");
    if (!input.summary.trim()) throw new Error("Add a short summary.");

    const item: CatalogItem = {
      id: makeId("catalog"),
      name: input.name.trim(),
      category: input.category,
      summary: input.summary.trim(),
      description:
        input.description.trim() ||
        input.summary.trim(),
      owner: input.owner,
      tags: input.tags.map((tag) => tag.trim()).filter(Boolean),
      format: input.format.trim() || "Internal resource",
      updatedAt: Date.now(),
    };
    current.catalog.unshift(item);
    persist();
    notify();
    return { ...item, tags: [...item.tags] };
  },

  async deleteCatalogItem(itemId: string): Promise<void> {
    const current = loadStore();
    current.catalog = current.catalog.filter((item) => item.id !== itemId);
    persist();
    notify();
  },

  async resetWorkspace(): Promise<void> {
    store = createSeedStore();
    persist();
    notify();
  },
};
