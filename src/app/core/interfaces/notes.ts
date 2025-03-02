export interface NoteCreate {
  name: string;
  content: string;
  isPublic: boolean;
  lastModifiedTimestampSec: number;
}

export interface Note
  extends NoteCreate {
  id: number;
  ownerId: number;
}

export interface NotePaginatedResponse {
  items: Note[];
  totalItemsCount: number;
}

export interface NotePaginationRequest {
  page: number;
  pageSize: number;
}

// TODO: Radek sent info how pagination should work, follow it.
