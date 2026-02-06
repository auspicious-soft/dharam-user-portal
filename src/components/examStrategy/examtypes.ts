// types.ts
export type ContentType = "video" | "pdf";

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  pdfUrl?: string;
  videoUrl?: string;
}

export interface Module {
  id: string;
  title: string;
  items: ContentItem[];
}

export interface SelectedContent {
  type: "slide" | "video";
  title: string;
  pdfUrl?: string;
  videoUrl?: string;
}