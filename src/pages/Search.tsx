import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { TutorGrid } from '@/components/tutors/TutorGrid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search as SearchIcon, Filter, Star, DollarSign, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [urlSearchParams] = useSearchParams();
  
  const [searchParams, setSearchParams] = useState({
    q: '',
    priceMin: '',
    priceMax: '',
    ratingMin: 'any',
    page: 1,
    limit: 20,
  });

  const [submittedParams, setSubmittedParams] = useState(searchParams);
  const [activeFilters, setActiveFilters] = useState<{subject?: string, level?: string}>({});

  // Initialize search params from URL
  useEffect(() => {
    const subject = urlSearchParams.get('subject');
    const level = urlSearchParams.get('level');
    
    if (subject || level) {
      const newParams = {
        ...searchParams,
        q: subject || searchParams.q,
      };
      setSearchParams(newParams);
      setSubmittedParams(newParams);
      setActiveFilters({ subject, level: level || undefined });
    }
  }, [urlSearchParams]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['search-tutors', submittedParams],
    queryFn: () => apiClient.searchTutors({
      q: submittedParams.q || undefined,
      priceMin: submittedParams.priceMin ? parseFloat(submittedParams.priceMin) : undefined,
      priceMax: submittedParams.priceMax ? parseFloat(submittedParams.priceMax) : undefined,
      ratingMin: submittedParams.ratingMin && submittedParams.ratingMin !== 'any' 
        ? parseFloat(submittedParams.ratingMin) 
        : undefined,
      page: submittedParams.page,
      limit: submittedParams.limit,
    }),
    enabled: true,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: {
      tutors: [],
      total: 0,
      page: 1,
      totalPages: 1,
    },
  });

  const handleSearch = () => {
    setSubmittedParams({ ...searchParams, page: 1 });
  };

  const handleReset = () => {
    const resetParams = {
      q: '',
      priceMin: '',
      priceMax: '',
      ratingMin: 'any',
      page: 1,
      limit: 20,
    };
    setSearchParams(resetParams);
    setSubmittedParams(resetParams);
    setActiveFilters({});
    // Clear URL parameters
    navigate('/search', { replace: true });
  };

  const clearFilter = (filterType: 'subject' | 'level') => {
    const newFilters = { ...activeFilters };
    delete newFilters[filterType];
    setActiveFilters(newFilters);
    
    // Update search query if subject was cleared
    if (filterType === 'subject') {
      const newParams = { ...searchParams, q: '' };
      setSearchParams(newParams);
      setSubmittedParams(newParams);
    }
  };

  const handleBookTutor = (tutorId: string) => {
    // Navigate to booking page with tutor ID
    navigate(`/booking?tutorId=${tutorId}`);
  };

  const handleViewProfile = (tutorId: string) => {
    // Navigate to tutor profile page
    navigate(`/tutor/${tutorId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Tutor
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover experienced tutors who can help you achieve your learning goals
          </p>
        </div>

        {/* Active Filters */}
        {(activeFilters.subject || activeFilters.level) && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-gray-700">Active Filters:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilters.subject && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Subject: {activeFilters.subject}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={() => clearFilter('subject')}
                  />
                </Badge>
              )}
              {activeFilters.level && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Level: {activeFilters.level}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={() => clearFilter('level')}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Search Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Search Filters</span>
            </CardTitle>
            <CardDescription>
              Use filters to find tutors that match your specific needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search Query */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search</label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, subject, or expertise..."
                    value={searchParams.q}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, q: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Min Price ($/hr)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={searchParams.priceMin}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, priceMin: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Max Price ($/hr)</label>
                <Input
                  type="number"
                  placeholder="100"
                  value={searchParams.priceMax}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, priceMax: e.target.value }))}
                />
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Min Rating</label>
                <Select
                  value={searchParams.ratingMin}
                  onValueChange={(value) => setSearchParams(prev => ({ ...prev, ratingMin: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any rating</SelectItem>
                    <SelectItem value="4">4+ stars</SelectItem>
                    <SelectItem value="4.5">4.5+ stars</SelectItem>
                    <SelectItem value="4.8">4.8+ stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button onClick={handleSearch} className="flex-1">
                <SearchIcon className="h-4 w-4 mr-2" />
                Search Tutors
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {/* Results Header */}
          {data && (
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {data.total} Tutor{data.total !== 1 ? 's' : ''} Found
                </h2>
                <p className="text-gray-600">
                  Showing {data.items?.length || data.tutors?.length || 0} of {data.total} results
                </p>
              </div>
              
              {/* Sort Options */}
              <Select defaultValue="rating">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="experience">Most Experienced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-red-600 mb-2">
                  <SearchIcon className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Search Error</h3>
                </div>
                <p className="text-gray-600">
                  We encountered an error while searching for tutors. Please try again.
                </p>
                <Button onClick={handleSearch} className="mt-4">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Searching for tutors...</p>
            </div>
          )}

          {/* Results Grid */}
          {data && !isLoading && !error && (
            <TutorGrid
              tutors={data.items || data.tutors || []}
              loading={isLoading}
              onBook={handleBookTutor}
              onViewProfile={handleViewProfile}
            />
          )}

          {/* Pagination */}
          {data && data.total > (data.limit || 20) && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                disabled={submittedParams.page === 1}
                onClick={() => setSubmittedParams(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              
              <span className="flex items-center px-4 py-2 text-sm text-gray-600">
                Page {submittedParams.page} of {Math.ceil(data.total / (data.limit || 20))}
              </span>
              
              <Button
                variant="outline"
                disabled={submittedParams.page >= Math.ceil(data.total / (data.limit || 20))}
                onClick={() => setSubmittedParams(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Search;