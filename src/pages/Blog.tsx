import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, User, Clock, Eye, Tag, ArrowRight } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { blogApi } from '@/lib/api';
import { mockBlogPosts, mockCategories, filterBlogPosts } from '@/lib/mockData';

const apiClient = {
  async getBlogPosts(filters: any = {}) {
    try {
      console.log('[Blog] Fetching blog posts with filters:', filters);
      const response = await blogApi.getPublicPosts(filters);
      console.log('[Blog] Received blog posts:', response);
      return response;
    } catch (error) {
      console.error('[Blog] Error fetching blog posts:', error);
      console.warn('[Blog] API unavailable, using mock data');
      // Return mock data if API fails
      const mockData = filterBlogPosts(mockBlogPosts, {
        search: filters.search,
        category: filters.category,
        page: filters.page,
        limit: filters.limit,
      });
      console.log('[Blog] Using mock data:', mockData);
      return mockData;
    }
  },

  async getBlogCategories() {
    try {
      console.log('[Blog] Fetching categories');
      const response = await blogApi.getCategories();
      console.log('[Blog] Received categories:', response);
      return response;
    } catch (error) {
      console.error('[Blog] Error fetching categories:', error);
      console.warn('[Blog] API unavailable, using mock categories');
      return { categories: mockCategories };
    }
  },
};

const Blog: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch blog posts
  const { data: blogData, isLoading, error } = useQuery({
    queryKey: ['blog-posts', searchTerm, categoryFilter, currentPage],
    queryFn: () => apiClient.getBlogPosts({
      search: searchTerm || undefined,
      category: categoryFilter || undefined,
      page: currentPage,
      limit: 12,
    }),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: {
      posts: [],
      total: 0,
      page: 1,
      totalPages: 1,
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: apiClient.getBlogCategories,
    retry: 1,
    staleTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: {
      categories: ['Education', 'Study Tips', 'Career Advice', 'Technology', 'Exam Prep'],
    },
  });

  const handleSearch = () => {
    setCurrentPage(1);
    // Query will automatically refetch due to dependency array
  };

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading blog posts...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <div className="text-lg text-red-600 mb-4">Unable to load blog posts</div>
              <p className="text-gray-600 mb-6">
                We're experiencing technical difficulties. Please try again later.
              </p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              TutorsPool Blog
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Insights, tips, and stories about education and learning
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search blog posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 h-12 bg-white text-gray-900"
                  />
                </div>
                <Button onClick={handleSearch} size="lg" className="h-12 px-8">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={categoryFilter === '' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => handleCategoryChange('')}
                >
                  All Categories
                </Button>
                {categoriesData?.categories?.map((category: string) => (
                  <Button
                    key={category}
                    variant={categoryFilter === category ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {blogData?.posts && blogData.posts.length > 0 ? (
                    blogData.posts
                      .flatMap((post: BlogPost) => post.tags || [])
                      .filter((tag, index, self) => tag && self.indexOf(tag) === index)
                      .slice(0, 10)
                      .map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-blue-100">
                          {tag}
                        </Badge>
                      ))
                  ) : (
                    <p className="text-sm text-gray-500">No tags available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {blogData?.posts && blogData.posts.length > 0 ? (
              <>
                {/* Results Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {searchTerm || categoryFilter
                        ? `Found ${blogData.total} posts`
                        : 'Latest Posts'
                      }
                    </h2>
                    {(searchTerm || categoryFilter) && (
                      <p className="text-gray-600 mt-1">
                        {searchTerm && `Searching for: "${searchTerm}"`}
                        {searchTerm && categoryFilter && ' • '}
                        {categoryFilter && `Category: ${categoryFilter}`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Blog Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {blogData.posts.map((post: BlogPost) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                      <div onClick={() => navigate(`/blog/${post.slug}`)}>
                        {post.featuredImage && (
                          <div className="aspect-video overflow-hidden rounded-t-lg">
                            <img
                              src={post.featuredImage}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        
                        <CardHeader>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{post.category}</Badge>
                            <span className="text-sm text-gray-500">
                              {getRelativeTime(post.publishedAt || post.createdAt)}
                            </span>
                          </div>
                          
                          <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {post.title}
                          </CardTitle>
                          
                          <CardDescription className="line-clamp-3">
                            {post.excerpt}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-4">
                              {post.authorName && (
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {post.authorName}
                                </div>
                              )}
                              
                              {post.readTime && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {post.readTime} min read
                                </div>
                              )}
                              
                              {post.viewCount !== undefined && (
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {post.viewCount}
                                </div>
                              )}
                            </div>
                            
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                          
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {post.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                              {post.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{post.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {blogData.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-12">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, blogData.totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(blogData.totalPages, prev + 1))}
                      disabled={currentPage === blogData.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500 text-lg">No blog posts found</p>
                  <p className="text-gray-400 mt-2">
                    {searchTerm || categoryFilter
                      ? 'Try adjusting your search or filters'
                      : 'Check back later for new posts'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Blog;
