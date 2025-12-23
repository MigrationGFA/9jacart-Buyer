import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button, Modal, Loading } from '../UI';
import { cn } from '../../lib/utils';
import { orderApi } from '../../api/order';
import type { OrderDetailItem } from '../../api/order';
import type { VendorRating } from '../../types';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderItems: OrderDetailItem[];
  onRatingSubmitted?: () => void;
}

interface ItemRating {
  vendorId: string;
  vendorName: string;
  rating: number;
  comment: string;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderItems,
  onRatingSubmitted,
}) => {
  // Group items by vendor
  const vendorGroups = orderItems.reduce((acc, item) => {
    const vendorId = item.vendor || 'unknown';
    if (!acc[vendorId]) {
      acc[vendorId] = {
        vendorId,
        vendorName: item.vendor || 'Unknown Vendor',
        items: [],
      };
    }
    acc[vendorId].items.push(item);
    return acc;
  }, {} as Record<string, { vendorId: string; vendorName: string; items: OrderDetailItem[] }>);

  const vendors = Object.values(vendorGroups);

  // Initialize ratings state
  const [ratings, setRatings] = useState<Record<string, ItemRating>>(
    vendors.reduce((acc, vendor) => {
      acc[vendor.vendorId] = {
        vendorId: vendor.vendorId,
        vendorName: vendor.vendorName,
        rating: 0,
        comment: '',
      };
      return acc;
    }, {} as Record<string, ItemRating>)
  );

  const [hoveredRating, setHoveredRating] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRatingChange = (vendorId: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [vendorId]: {
        ...prev[vendorId],
        rating,
      },
    }));
  };

  const handleCommentChange = (vendorId: string, comment: string) => {
    setRatings(prev => ({
      ...prev,
      [vendorId]: {
        ...prev[vendorId],
        comment,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validate that all vendors have ratings
      const unratedVendors = Object.values(ratings).filter(r => r.rating === 0);
      if (unratedVendors.length > 0) {
        setError('Please rate all vendors before submitting');
        setSubmitting(false);
        return;
      }

      // Prepare rating data
      const vendorRatings: VendorRating[] = Object.values(ratings).map(r => ({
        vendorId: r.vendorId,
        rating: r.rating,
        comment: r.comment || `Rating: ${r.rating} stars`,
      }));

      // Submit ratings
      await orderApi.rateOrder({
        orderId,
        ratings: vendorRatings,
      });

      setSuccess(true);
      
      // Wait a bit to show success message
      setTimeout(() => {
        onRatingSubmitted?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to submit rating:', err);
      setError(err.message || 'Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (vendorId: string, currentRating: number) => {
    const hovered = hoveredRating[vendorId] || 0;
    const displayRating = hovered || currentRating;

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(vendorId, star)}
            onMouseEnter={() => setHoveredRating(prev => ({ ...prev, [vendorId]: star }))}
            onMouseLeave={() => setHoveredRating(prev => ({ ...prev, [vendorId]: 0 }))}
            className="transition-transform hover:scale-110 focus:outline-none"
            disabled={submitting || success}
          >
            <Star
              className={cn(
                'w-8 h-8 transition-colors',
                star <= displayRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              )}
            />
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rate Your Order"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {success ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Thank you for your feedback!
            </h3>
            <p className="text-gray-600">
              Your rating has been submitted successfully.
            </p>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-600 mb-4">
              Please rate your experience with each vendor
            </div>

            {vendors.map((vendor) => (
              <div key={vendor.vendorId} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {vendor.vendorName}
                  </h4>
                  <div className="text-sm text-gray-600 mb-3">
                    {vendor.items.length} item{vendor.items.length > 1 ? 's' : ''}
                  </div>
                  
                  {/* Product list */}
                  <div className="space-y-2 mb-4">
                    {vendor.items.map((item) => (
                      <div key={item.productId} className="text-sm text-gray-700">
                        • {item.productName}
                      </div>
                    ))}
                  </div>

                  {/* Star rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-gray-700">Rating:</span>
                    {renderStars(vendor.vendorId, ratings[vendor.vendorId]?.rating || 0)}
                    {ratings[vendor.vendorId]?.rating > 0 && (
                      <span className="text-sm text-gray-600 ml-2">
                        {ratings[vendor.vendorId].rating} star{ratings[vendor.vendorId].rating > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Comment */}
                  <div>
                    <label
                      htmlFor={`comment-${vendor.vendorId}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Comment (optional)
                    </label>
                    <textarea
                      id={`comment-${vendor.vendorId}`}
                      value={ratings[vendor.vendorId]?.comment || ''}
                      onChange={(e) => handleCommentChange(vendor.vendorId, e.target.value)}
                      placeholder="Share your experience with this vendor..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      disabled={submitting || success}
                    />
                  </div>
                </div>
              </div>
            ))}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="min-w-[120px]"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loading size="sm" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Rating'
                )}
              </Button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};

