export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  authorId: string;
  authorName?: string;
  authorEmail?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featuredImage?: string;
  tags: string[];
  category: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  readTime: number; // in minutes
}

export interface CreateBlogPostData {
  title: string;
  content: string;
  excerpt?: string;
  status: 'DRAFT' | 'PUBLISHED';
  featuredImage?: string;
  tags: string[];
  category: string;
}

export interface UpdateBlogPostData {
  title?: string;
  content?: string;
  excerpt?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featuredImage?: string;
  tags?: string[];
  category?: string;
}

export interface BlogListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BlogFilters {
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  category?: string;
  authorId?: string;
  search?: string;
  page?: number;
  limit?: number;
}
