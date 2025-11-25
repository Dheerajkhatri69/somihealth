'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Save, X, Trash2, Eye, Mail, Phone, Calendar, Search, Filter, Settings, Image as ImageIcon, Globe } from 'lucide-react';
import UploadMediaLite from '@/components/UploadMediaLite';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ContactFormsDashboard() {
  // State for form submissions
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State for form settings
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editingSettings, setEditingSettings] = useState({});

  // State for submission management
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState('new');

  // State for contact page content
  const [pageContent, setPageContent] = useState(null);
  const [pageContentLoading, setPageContentLoading] = useState(true);
  const [isEditingPageContent, setIsEditingPageContent] = useState(false);
  const [editingPageContent, setEditingPageContent] = useState({});
  const [newlySeenIds, setNewlySeenIds] = useState([]);
  const [newCount, setNewCount] = useState(0);

  const fetchSubmissions = async () => {
    setSubmissionsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        status: statusFilter,
        search: searchTerm,
      });

      const res = await fetch(`/api/contact?${params}`);
      const data = await res.json();

      if (data.success) {
        setSubmissions(data.result);
        setTotalPages(data.pagination.pages);

        // IMPORTANT FIX: convert both IDs to string
        const newOnes = data.result.filter((item) => item.seen === true);
        const newIds = newOnes.map((item) => String(item._id));

        console.log("New IDs found:", newIds);
        setNewlySeenIds(newIds);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setSubmissionsLoading(false);
    }
  };
  // AFTER page loads, mark all seen fields = false
  useEffect(() => {
    (async () => {
      try {
        await fetch("/api/contact/mark-seen", {
          method: "POST",
        });
      } catch (err) {
        console.error("Error marking contact forms as seen:", err);
      } finally {
        window.dispatchEvent(new Event("refreshSidebarCounts"));
      }
    })();
  }, []);


  // Fetch settings
  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch('/api/contact-form-settings');
      const data = await res.json();

      if (data.success) {
        setSettings(data.result);
        setEditingSettings(data.result);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Update submission status
  const updateSubmissionStatus = async (id, status, notes = '') => {
    try {
      const res = await fetch('/api/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, notes })
      });

      const data = await res.json();
      if (data.success) {
        fetchSubmissions();
        setSelectedSubmission(null);
        setSubmissionNotes('');
      }
    } catch (error) {
      console.error('Error updating submission:', error);
    }
  };

  // Delete submission
  const deleteSubmission = async (id) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const res = await fetch(`/api/contact?id=${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (data.success) {
        fetchSubmissions();
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
    }
  };

  // Save settings
  const saveSettings = async () => {
    try {
      const res = await fetch('/api/contact-form-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSettings)
      });

      const data = await res.json();
      if (data.success) {
        setSettings(data.result);
        setIsEditingSettings(false);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Fetch contact page content
  const fetchPageContent = async () => {
    setPageContentLoading(true);
    try {
      const res = await fetch('/api/contact-page-content');
      const data = await res.json();

      if (data.success) {
        setPageContent(data.result);
        setEditingPageContent(data.result);
      }
    } catch (error) {
      console.error('Error fetching page content:', error);
    } finally {
      setPageContentLoading(false);
    }
  };

  // Save contact page content
  const savePageContent = async () => {
    try {
      const res = await fetch('/api/contact-page-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPageContent)
      });

      const data = await res.json();
      if (data.success) {
        setPageContent(data.result);
        setIsEditingPageContent(false);
      }
    } catch (error) {
      console.error('Error saving page content:', error);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchSubmissions();
    fetchSettings();
    fetchPageContent();
  }, [currentPage, statusFilter, searchTerm]);

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-orange-100 text-orange-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="p-6 w-full mx-auto">

      <div className="flex flex-col gap-6">
        {/* Submissions List */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Form Submissions</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search submissions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="p-6">
              {submissionsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No submissions found
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div
                      key={submission._id}
                      className={`border rounded-lg p-4 hover:bg-gray-50 relative ${newlySeenIds.includes(String(submission._id))
                        ? "bg-green-100 border-green-500"
                        : ""
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">
                              {submission.firstName} {submission.lastName}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[submission.status]}`}>
                              {submission.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {submission.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {submission.phone}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Interested in: <span className="font-medium">{submission.interestedIn}</span>
                          </p>
                          {submission.comments && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {submission.comments}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => setSelectedSubmission(submission)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteSubmission(submission._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete submission"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-2 rounded ${currentPage === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Contact Page Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-l-4 border-gray-200 border-l-secondary">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Contact Page Content</h2>
                <button
                  onClick={() => setIsEditingPageContent(!isEditingPageContent)}
                  className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Globe className="w-4 h-4" />
                  {isEditingPageContent ? 'Cancel' : 'Edit'}
                </button>
              </div>
            </div>

            <div className="p-6">
              {pageContentLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ) : isEditingPageContent ? (
                <div className="space-y-6">
                  {/* Hero Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Hero Section</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={editingPageContent.hero?.title || ''}
                          onChange={(e) => setEditingPageContent(prev => ({
                            ...prev,
                            hero: { ...prev.hero, title: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Background Image
                        </label>
                        <UploadMediaLite
                          file={editingPageContent.hero?.backgroundImage}
                          onUploadComplete={(url) => setEditingPageContent(prev => ({
                            ...prev,
                            hero: { ...prev.hero, backgroundImage: url }
                          }))}
                          onDelete={() => setEditingPageContent(prev => ({
                            ...prev,
                            hero: { ...prev.hero, backgroundImage: '' }
                          }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subtitle
                      </label>
                      <textarea
                        value={editingPageContent.hero?.subtitle || ''}
                        onChange={(e) => setEditingPageContent(prev => ({
                          ...prev,
                          hero: { ...prev.hero, subtitle: e.target.value }
                        }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Copy Image
                      </label>
                      <UploadMediaLite
                        file={editingPageContent.hero?.copyImage}
                        onUploadComplete={(url) => setEditingPageContent(prev => ({
                          ...prev,
                          hero: { ...prev.hero, copyImage: url }
                        }))}
                        onDelete={() => setEditingPageContent(prev => ({
                          ...prev,
                          hero: { ...prev.hero, copyImage: '' }
                        }))}
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={editingPageContent.contactInfo?.phone?.display || ''}
                          onChange={(e) => setEditingPageContent(prev => ({
                            ...prev,
                            contactInfo: {
                              ...prev.contactInfo,
                              phone: { ...prev.contactInfo?.phone, display: e.target.value }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={editingPageContent.contactInfo?.email?.display || ''}
                          onChange={(e) => setEditingPageContent(prev => ({
                            ...prev,
                            contactInfo: {
                              ...prev.contactInfo,
                              email: { ...prev.contactInfo?.email, display: e.target.value }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          value={editingPageContent.contactInfo?.address?.display || ''}
                          onChange={(e) => setEditingPageContent(prev => ({
                            ...prev,
                            contactInfo: {
                              ...prev.contactInfo,
                              address: { ...prev.contactInfo?.address, display: e.target.value }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hours
                        </label>
                        <input
                          type="text"
                          value={editingPageContent.contactInfo?.hours?.display || ''}
                          onChange={(e) => setEditingPageContent(prev => ({
                            ...prev,
                            contactInfo: {
                              ...prev.contactInfo,
                              hours: { ...prev.contactInfo?.hours, display: e.target.value }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Content */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Sidebar Content</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sidebar Title
                      </label>
                      <input
                        type="text"
                        value={editingPageContent.sidebar?.title || ''}
                        onChange={(e) => setEditingPageContent(prev => ({
                          ...prev,
                          sidebar: { ...prev.sidebar, title: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expectations (one per line)
                      </label>
                      <textarea
                        value={editingPageContent.sidebar?.expectations?.map(item => item.text).join('\n') || ''}
                        onChange={(e) => {
                          const expectations = e.target.value.split('\n').filter(line => line.trim()).map(text => ({ text: text.trim() }));
                          setEditingPageContent(prev => ({
                            ...prev,
                            sidebar: { ...prev.sidebar, expectations }
                          }));
                        }}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Replies within one business day.&#10;Care from licensed clinicians.&#10;No spam—just help when you need it."
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={savePageContent}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Save className="w-4 h-4" />
                      Save Page Content
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingPageContent(false);
                        setEditingPageContent(pageContent);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Page Title</h3>
                    <p className="text-sm text-gray-600">{pageContent?.hero?.title || 'Contact Somi Health'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Phone</h3>
                    <p className="text-sm text-gray-600">{pageContent?.contactInfo?.phone?.display || '(704) 386-6871'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <p className="text-sm text-gray-600">{pageContent?.contactInfo?.email?.display || 'info@joinsomi.com'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-l-4 border-gray-200 border-l-secondary">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Form Settings</h2>
                <button
                  onClick={() => setIsEditingSettings(!isEditingSettings)}
                  className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Settings className="w-4 h-4" />
                  {isEditingSettings ? 'Cancel' : 'Edit'}
                </button>
              </div>
            </div>

            <div className="p-6">
              {settingsLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ) : isEditingSettings ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Form Title
                    </label>
                    <input
                      type="text"
                      value={editingSettings.title || ''}
                      onChange={(e) => setEditingSettings(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Image
                    </label>
                    <UploadMediaLite
                      file={editingSettings.backgroundImage}
                      onUploadComplete={(url) => setEditingSettings(prev => ({ ...prev, backgroundImage: url }))}
                      onDelete={() => setEditingSettings(prev => ({ ...prev, backgroundImage: '' }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Color
                      </label>
                      <input
                        type="color"
                        value={editingSettings.styling?.primaryColor || '#3b82f6'}
                        onChange={(e) => setEditingSettings(prev => ({
                          ...prev,
                          styling: { ...prev.styling, primaryColor: e.target.value }
                        }))}
                        className="w-full h-10 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Background Color
                      </label>
                      <input
                        type="color"
                        value={editingSettings.styling?.backgroundColor || '#ffffff'}
                        onChange={(e) => setEditingSettings(prev => ({
                          ...prev,
                          styling: { ...prev.styling, backgroundColor: e.target.value }
                        }))}
                        className="w-full h-10 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={saveSettings}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Save className="w-4 h-4" />
                      Save Settings
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingSettings(false);
                        setEditingSettings(settings);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Form Title</h3>
                    <p className="text-sm text-gray-600">{settings?.title || 'Contact Us Form'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Status</h3>
                    <p className="text-sm text-gray-600">
                      {settings?.config?.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Total Submissions</h3>
                    <p className="text-sm text-gray-600">{submissions.length}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Submission Details</h2>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-sm text-gray-900">
                    {selectedSubmission.firstName} {selectedSubmission.lastName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedSubmission.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-sm text-gray-900">{selectedSubmission.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Interested In</label>
                  <p className="text-sm text-gray-900">{selectedSubmission.interestedIn}</p>
                </div>
              </div>

              {selectedSubmission.comments && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Comments</label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedSubmission.comments}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={submissionStatus}
                  onChange={(e) => setSubmissionStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add internal notes..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => updateSubmissionStatus(selectedSubmission._id, submissionStatus, submissionNotes)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  Update Status
                </button>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
