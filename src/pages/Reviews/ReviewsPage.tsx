import React, { useState, useEffect } from "react";
import { Button, Card, Badge, Input, Select } from "abolaji-ux-kit";
import {
  Star,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
} from "lucide-react";
import { useReviews, useApplications } from "../../hooks/useApi";
import type { Review } from "../../services/api";

const ReviewsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [applicationFilter, setApplicationFilter] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [currentReviews, setCurrentReviews] = useState<Review[]>([]);
  const [reviewCounts, setReviewCounts] = useState({
    total: 0,
    five: 0,
    four: 0,
    three: 0,
    two: 0,
    one: 0,
    averageRating: 0,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch applications for filter dropdown
  const { data: applicationsData } = useApplications();
  const applications = applicationsData || [];

  // Fetch reviews with filters and pagination
  const { data: reviewsData, isLoading } = useReviews({
    ...(searchTerm && { search: searchTerm }),
    ...(ratingFilter !== "all" && { rating: ratingFilter }),
    ...(applicationFilter && { appId: applicationFilter }),
    page: pagination.page,
    limit: pagination.pageSize,
  });

  // Update current reviews when new data arrives
  useEffect(() => {
    if (reviewsData) {
      // Handle nested data structure from API response - reviewsData is ReviewsResponse
      const reviews = (reviewsData as any).data || [];
      const paginationData = (reviewsData as any).pagination;
      const ratingStatsData = (reviewsData as any).ratingStats;

      setCurrentReviews(Array.isArray(reviews) ? reviews : []);

      // Update review counts from API response using ratingStats
      if (ratingStatsData) {
        const distribution = ratingStatsData.distribution || {};
        const summary = ratingStatsData.summary || {};

        setReviewCounts({
          total: summary.totalReviews || 0,
          five: distribution["5"] || 0,
          four: distribution["4"] || 0,
          three: distribution["3"] || 0,
          two: distribution["2"] || 0,
          one: distribution["1"] || 0,
          averageRating: summary.averageRating || 0,
        });
      }

      // Update pagination with actual API response data
      if (paginationData) {
        setPagination({
          page: paginationData.page,
          pageSize: paginationData.limit,
          total: paginationData.total,
          totalPages: paginationData.totalPages,
          hasNext: paginationData.page < paginationData.totalPages,
          hasPrev: paginationData.page > 1,
        });
      }
    }
  }, [reviewsData, pagination.page, pagination.pageSize]);

  // Track initial load completion
  useEffect(() => {
    if (reviewsData && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [reviewsData, isInitialLoad]);

  const reviews = currentReviews;

  // Handle application filter change
  const handleApplicationFilterChange = (event: {
    target: { value: string | number };
  }) => {
    const appId = String(event.target.value);
    setApplicationFilter(appId);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page when filtering
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setRatingFilter("all");
    setApplicationFilter("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const getAverageRating = () => {
    return reviewCounts.averageRating.toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Star className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
            <p className="text-gray-600">Monitor user feedback and ratings</p>
          </div>
        </div>
        <Button variant="primary" className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4" />
          <span>Respond to Reviews</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {isInitialLoad ? (
          // Loading skeleton cards
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                    </div>
                    <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </Card>
            ))}
          </>
        ) : (
          // Actual stats cards
          <>
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Reviews
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reviewCounts.total}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Average Rating
                    </p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {getAverageRating()}
                    </p>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      5 Star Reviews
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {reviewCounts.five}
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ThumbsUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      1-2 Star Reviews
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {reviewCounts.one + reviewCounts.two}
                    </p>
                  </div>
                  <div className="p-2 bg-red-100 rounded-lg">
                    <ThumbsDown className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Rating Distribution */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rating Distribution
          </h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count =
                rating === 5
                  ? reviewCounts.five
                  : rating === 4
                  ? reviewCounts.four
                  : rating === 3
                  ? reviewCounts.three
                  : rating === 2
                  ? reviewCounts.two
                  : reviewCounts.one;
              const percentage =
                reviewCounts.total > 0 ? (count / reviewCounts.total) * 100 : 0;

              return (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-12 text-right">
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                  <div className="w-12 text-right">
                    <span className="text-sm text-gray-500">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              User Reviews
            </h3>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 h-10"
                />
              </div>
              <div className="h-10">
                <Select
                  placeholder="All Applications"
                  options={[
                    { label: "All Applications", value: "" },
                    ...applications.map((app) => ({
                      label: app.name,
                      value: app.appId.toString(),
                    })),
                  ]}
                  value={applicationFilter}
                  onChange={handleApplicationFilterChange}
                  className="h-10"
                />
              </div>
              <div className="h-10">
                <Select
                  placeholder="All Ratings"
                  options={[
                    { label: "All Ratings", value: "all" },
                    { label: "5 Stars", value: "5" },
                    { label: "4 Stars", value: "4" },
                    { label: "3 Stars", value: "3" },
                    { label: "2 Stars", value: "2" },
                    { label: "1 Star", value: "1" },
                  ]}
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(String(e.target.value))}
                  className="h-10"
                />
              </div>
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 h-10"
              >
                <Filter className="w-4 h-4" />
                <span>Clear</span>
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: Review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {review.reviewer
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">
                            {review.reviewer}
                          </p>
                          {review.verified && (
                            <Badge variant="success" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {review.appName} •{" "}
                          {new Date(review.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{review.comment}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700">
                        <ThumbsUp className="w-4 h-4" />
                        <span>Helpful ({review.helpful})</span>
                      </button>
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        Reply
                      </button>
                    </div>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      Report
                    </button>
                  </div>
                </div>
              ))}

              {reviews.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reviews found.</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-700">
                Showing page {pagination.page} of {pagination.totalPages} (
                {pagination.total} total reviews)
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ReviewsPage;
