import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { dataManager } from '../dataManager';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Validation schemas
const createBlogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  featuredImage: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().min(1, 'Category is required'),
});

const updateBlogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  excerpt: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  featuredImage: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().min(1, 'Category is required').optional(),
});

// Helper function to generate slug
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Helper function to calculate read time
const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Helper function to generate excerpt
const generateExcerpt = (content: string, maxLength: number = 160): string => {
  const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
};

/**
 * GET /api/blog
 * Get all published blog posts (public)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '10', 
      category, 
      search,
      status = 'PUBLISHED' 
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    let posts = dataManager.getAllBlogPosts();

    // Filter by status
    if (status) {
      posts = posts.filter(post => post.status === status);
    }

    // Filter by category
    if (category) {
      posts = posts.filter(post => post.category === category);
    }

    // Search in title and content
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by published date (newest first)
    posts.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());

    const total = posts.length;
    const paginatedPosts = posts.slice(offset, offset + limitNum);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      posts: paginatedPosts,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    });
  } catch (error) {
    console.error('Blog fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

/**
 * GET /api/blog/admin
 * Get all blog posts for admin (includes drafts)
 */
router.get('/admin', authenticateToken, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '10', 
      status,
      category,
      search 
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    let posts = dataManager.getAllBlogPosts();

    // Filter by status
    if (status) {
      posts = posts.filter(post => post.status === status);
    }

    // Filter by category
    if (category) {
      posts = posts.filter(post => post.category === category);
    }

    // Search
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by created date (newest first)
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = posts.length;
    const paginatedPosts = posts.slice(offset, offset + limitNum);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      posts: paginatedPosts,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    });
  } catch (error) {
    console.error('Admin blog fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

/**
 * GET /api/blog/:id
 * Get single blog post by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = dataManager.getBlogPostById(id);

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Increment view count for published posts
    if (post.status === 'PUBLISHED') {
      dataManager.incrementBlogPostViewCount(id);
    }

    res.json(post);
  } catch (error) {
    console.error('Blog post fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

/**
 * GET /api/blog/slug/:slug
 * Get single blog post by slug
 */
router.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const post = dataManager.getBlogPostBySlug(slug);

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Only return published posts to public
    if (post.status !== 'PUBLISHED') {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Increment view count
    dataManager.incrementBlogPostViewCount(post.id);

    res.json(post);
  } catch (error) {
    console.error('Blog post fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

/**
 * POST /api/blog
 * Create new blog post (admin only)
 */
router.post('/', authenticateToken, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    const validatedData = createBlogSchema.parse(req.body);
    const userId = req.user!.userId;

    const user = dataManager.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const slug = generateSlug(validatedData.title);
    const excerpt = validatedData.excerpt || generateExcerpt(validatedData.content);
    const readTime = calculateReadTime(validatedData.content);

    const blogPost = {
      id: `blog-${Date.now()}`,
      title: validatedData.title,
      slug,
      content: validatedData.content,
      excerpt,
      authorId: userId,
      authorName: user.name || 'Admin',
      authorEmail: user.email || '',
      status: validatedData.status,
      featuredImage: validatedData.featuredImage,
      tags: validatedData.tags,
      category: validatedData.category,
      publishedAt: validatedData.status === 'PUBLISHED' ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0,
      readTime,
    };

    const createdPost = dataManager.addBlogPost(blogPost);
    res.status(201).json(createdPost);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Blog post creation error:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

/**
 * PUT /api/blog/:id
 * Update blog post (admin only)
 */
router.put('/:id', authenticateToken, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateBlogSchema.parse(req.body);

    const existingPost = dataManager.getBlogPostById(id);
    if (!existingPost) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    const updates: any = {
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    // Generate new slug if title changed
    if (validatedData.title && validatedData.title !== existingPost.title) {
      updates.slug = generateSlug(validatedData.title);
    }

    // Generate new excerpt if content changed
    if (validatedData.content && validatedData.content !== existingPost.content) {
      updates.excerpt = validatedData.excerpt || generateExcerpt(validatedData.content);
      updates.readTime = calculateReadTime(validatedData.content);
    }

    // Set published date if status changed to published
    if (validatedData.status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED') {
      updates.publishedAt = new Date().toISOString();
    }

    const updatedPost = dataManager.updateBlogPost(id, updates);
    res.json(updatedPost);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Blog post update error:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

/**
 * DELETE /api/blog/:id
 * Delete blog post (admin only)
 */
router.delete('/:id', authenticateToken, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingPost = dataManager.getBlogPostById(id);
    if (!existingPost) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    dataManager.deleteBlogPost(id);
    res.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Blog post deletion error:', error);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

/**
 * GET /api/blog/categories
 * Get all blog categories
 */
router.get('/meta/categories', async (req: Request, res: Response) => {
  try {
    const categories = dataManager.getBlogCategories();
    res.json({ categories });
  } catch (error) {
    console.error('Blog categories fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
