export type PostTag = "update" | "announcement" | "question" | "resource";

export interface PostComment {
  id: string;
  authorName: string;
  authorInitials: string;
  authorAccent: string;
  body: string;
  createdAt: number;
}

export interface Post {
  id: string;
  authorName: string;
  authorInitials: string;
  authorAccent: string;
  title: string;
  body: string;
  tag: PostTag;
  imageUrl?: string;
  likes: number;
  likedByMe: boolean;
  comments: PostComment[];
  createdAt: number;
}

export type CatalogCategory =
  | "playbook"
  | "template"
  | "automation"
  | "equipment"
  | "research";

export interface CatalogItem {
  id: string;
  name: string;
  category: CatalogCategory;
  summary: string;
  description: string;
  owner: string;
  tags: string[];
  format: string;
  updatedAt: number;
}

export type BookingStatus = "confirmed" | "cancelled";

export interface Booking {
  id: string;
  title: string;
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  organizer: string;
  attendees: number;
  note?: string;
  status: BookingStatus;
  createdAt: number;
}

export interface HubSnapshot {
  posts: Post[];
  catalog: CatalogItem[];
  bookings: Booking[];
  updatedAt: number;
}

export interface Author {
  name: string;
  initials: string;
  accent: string;
}

export interface NewPostInput {
  title: string;
  body: string;
  tag: PostTag;
  imageUrl?: string;
  author: Author;
}

export interface NewBookingInput {
  title: string;
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  organizer: string;
  attendees: number;
  note?: string;
}

export interface NewCatalogItemInput {
  name: string;
  category: CatalogCategory;
  summary: string;
  description: string;
  owner: string;
  tags: string[];
  format: string;
}
