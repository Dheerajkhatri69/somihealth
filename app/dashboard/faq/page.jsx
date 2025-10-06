'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const FAQManagementPage = () => {
  const [faqData, setFaqData] = useState({
    _id: '',
    heading: '',
    subheading: '',
    faqs: [],
    benefits: [],
    footerTitle: '',
    footerDescription: '',
    footerButtonText: '',
    footerButtonLink: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch FAQ data
  useEffect(() => {
    const fetchFAQData = async () => {
      try {
        const response = await fetch('/api/faq', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setFaqData((prev) => ({ ...prev, ...data })); // keep shape, include _id
        }
      } catch (error) {
        console.error('Error fetching FAQ data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQData();
  }, []);

  // Save FAQ data (POST first time, PUT afterwards)
  const handleSave = async () => {
    setSaving(true);
    try {
      const hasId = Boolean(faqData?._id);
      const method = hasId ? 'PUT' : 'POST';
      const response = await fetch('/api/faq', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faqData),
      });

      if (response.ok) {
        const saved = await response.json();
        setFaqData((prev) => ({ ...prev, ...saved })); // sync with server
        toast.success(hasId ? 'FAQ updated!' : 'FAQ created!');
      } else {
        toast.error('Failed to save FAQ data');
      }
    } catch (error) {
      console.error('Error saving FAQ data:', error);
      toast.error('Error saving FAQ data');
    } finally {
      setSaving(false);
    }
  };

  // Add new FAQ item
  const addFAQ = () => {
    setFaqData((prev) => ({
      ...prev,
      faqs: [...(prev.faqs || []), { question: '', answer: '', sortOrder: prev.faqs?.length || 0 }],
    }));
  };

  // Remove FAQ item
  const removeFAQ = (index) => {
    setFaqData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  // Update FAQ item
  const updateFAQ = (index, field, value) => {
    setFaqData((prev) => ({
      ...prev,
      faqs: prev.faqs.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  // Add new benefit
  const addBenefit = () => {
    setFaqData((prev) => ({
      ...prev,
      benefits: [...(prev.benefits || []), { text: '', sortOrder: prev.benefits?.length || 0 }],
    }));
  };

  // Remove benefit
  const removeBenefit = (index) => {
    setFaqData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  // Update benefit
  const updateBenefit = (index, value) => {
    setFaqData((prev) => ({
      ...prev,
      benefits: prev.benefits.map((item, i) => (i === index ? { ...item, text: value } : item)),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">FAQ Management</h1>
        <Button onClick={handleSave} disabled={saving || loading} className="bg-secondary text-white hover:bg-secondary/90">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Main Content */}
        <div className="space-y-6">
          <Card className="border-l-4 border-gray-200 border-l-secondary">
            <CardHeader>
              <CardTitle>Main Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Heading</label>
                <Input
                  value={faqData.heading}
                  onChange={(e) => setFaqData((prev) => ({ ...prev, heading: e.target.value }))}
                  placeholder="Enter main heading"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subheading</label>
                <Input
                  value={faqData.subheading}
                  onChange={(e) => setFaqData((prev) => ({ ...prev, subheading: e.target.value }))}
                  placeholder="Enter subheading"
                />
              </div>
            </CardContent>
          </Card>

          {/* FAQ Items */}
          <Card className="border-l-4 border-gray-200 border-l-secondary">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>FAQ Items</CardTitle>
                <Button onClick={addFAQ} size="sm" className="bg-secondary text-white hover:bg-secondary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add FAQ
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqData.faqs.map((faq, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">FAQ Item {index + 1}</h4>
                    <Button onClick={() => removeFAQ(index)} variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Question</label>
                    <Textarea
                      value={faq.question}
                      onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                      placeholder="Enter question"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Answer</label>
                    <Textarea
                      value={faq.answer}
                      onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                      placeholder="Enter answer"
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="border-l-4 border-gray-200 border-l-secondary">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Benefits List</CardTitle>
                <Button onClick={addBenefit} size="sm" className="bg-secondary text-white hover:bg-secondary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Benefit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqData.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input value={benefit.text} onChange={(e) => updateBenefit(index, e.target.value)} placeholder="Enter benefit text" />
                  <Button onClick={() => removeBenefit(index)} variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Footer Content */}
        <div className="space-y-6">
          <Card className="border-l-4 border-gray-200 border-l-secondary">
            <CardHeader>
              <CardTitle>Footer Callout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Footer Title</label>
                <Input
                  value={faqData.footerTitle}
                  onChange={(e) => setFaqData((prev) => ({ ...prev, footerTitle: e.target.value }))}
                  placeholder="Enter footer title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Footer Description</label>
                <Textarea
                  value={faqData.footerDescription}
                  onChange={(e) => setFaqData((prev) => ({ ...prev, footerDescription: e.target.value }))}
                  placeholder="Enter footer description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Button Text</label>
                <Input
                  value={faqData.footerButtonText}
                  onChange={(e) => setFaqData((prev) => ({ ...prev, footerButtonText: e.target.value }))}
                  placeholder="Enter button text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Button Link</label>
                <Input
                  value={faqData.footerButtonLink}
                  onChange={(e) => setFaqData((prev) => ({ ...prev, footerButtonLink: e.target.value }))}
                  placeholder="Enter button link"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FAQManagementPage;