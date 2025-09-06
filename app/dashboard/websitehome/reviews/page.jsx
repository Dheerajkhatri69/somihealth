'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Save, X, Trash2, ArrowLeft } from 'lucide-react';

export default function ReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingReview, setEditingReview] = useState({
        quote: '',
        author: ''
    });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchReviews();
    }, []);

    async function fetchReviews() {
        setLoading(true);
        try {
            const res = await fetch('/api/reviews', { cache: 'no-store' });
            const data = await res.json();

            if (data?.success) {
                setReviews(data.result);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    }

    function startEditing(review = null) {
        if (review) {
            setEditingReview({
                _id: review._id,
                quote: review.quote || '',
                author: review.author || ''
            });
        } else {
            setEditingReview({
                quote: '',
                author: ''
            });
        }
        setIsEditing(true);
    }

    function cancelEditing() {
        setIsEditing(false);
        setEditingReview({
            quote: '',
            author: ''
        });
    }

    async function saveReview() {
        try {
            const method = editingReview._id ? 'PUT' : 'POST';
            const body = {
                ...editingReview,
                ...(editingReview._id && { id: editingReview._id })
            };

            const res = await fetch('/api/reviews', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (data.success) {
                setReviews(prev => {
                    if (editingReview._id) {
                        return prev.map(r => r._id === editingReview._id ? data.result : r);
                    } else {
                        return [...prev, data.result];
                    }
                });
                setIsEditing(false);
                setEditingReview({
                    quote: '',
                    author: ''
                });
            } else {
                alert('Error saving review: ' + data.message);
            }
        } catch (error) {
            console.error('Error saving review:', error);
            alert('Error saving review');
        }
    }

    async function deleteReview(reviewId) {
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            const res = await fetch(`/api/reviews?id=${reviewId}`, {
                method: 'DELETE',
            });

            const data = await res.json();
            if (data.success) {
                setReviews(prev => prev.filter(r => r._id !== reviewId));
            } else {
                alert('Error deleting review: ' + data.message);
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Error deleting review');
        }
    }

    const filteredReviews = reviews.filter(review =>
        review.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4">
            {/* Header */}
            <Link
                href="/dashboard/websitehome"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
                <ArrowLeft size={20} />
                Back to Dashboard
            </Link>
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">

                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Manage Reviews</h1>
                        <p className="text-sm text-gray-500">Add, edit, and manage customer reviews and testimonials.</p>
                    </div>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => startEditing()}
                        className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-white hover:bg-secondary/80"
                    >
                        <Plus size={18} />
                        Add Review
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search reviews..."
                    className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Edit Form */}
            {isEditing && (
                <div className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-md">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            {editingReview._id ? 'Edit Review' : 'Add New Review'}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quote
                                </label>
                                <textarea
                                    value={editingReview.quote}
                                    onChange={(e) => setEditingReview(prev => ({ ...prev, quote: e.target.value }))}
                                    rows={4}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter customer review quote..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Author
                                </label>
                                <input
                                    type="text"
                                    value={editingReview.author}
                                    onChange={(e) => setEditingReview(prev => ({ ...prev, author: e.target.value }))}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter customer name..."
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={saveReview}
                                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                >
                                    <Save size={16} />
                                    Save Review
                                </button>
                                <button
                                    onClick={cancelEditing}
                                    className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews List */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-md">
                {loading ? (
                    <div className="p-6">
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="p-4 border border-gray-200 rounded-lg">
                                    <div className="space-y-2">
                                        <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                                        <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
                                        <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse" />
                                    </div>
                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
                                        <div className="flex gap-2">
                                            <div className="h-8 w-8 rounded bg-gray-200 animate-pulse" />
                                            <div className="h-8 w-8 rounded bg-gray-200 animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <div className="p-6 text-center">
                        <div className="text-gray-500">
                            {searchQuery ? 'No reviews match your search.' : 'No reviews found. Add your first review.'}
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredReviews.map((review) => (
                            <div key={review._id} className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 font-semibold">
                                                {review.author.charAt(0)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-800 leading-relaxed mb-3">
                                            {review.quote}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900">
                                                    {review.author}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <svg key={i} viewBox="0 0 24 24" className="h-4 w-4 fill-yellow-400">
                                                            <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.168L12 18.896 4.665 23.165l1.401-8.168L.132 9.21l8.2-1.192L12 .587z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => startEditing(review)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Edit review"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => deleteReview(review._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                    title="Delete review"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
