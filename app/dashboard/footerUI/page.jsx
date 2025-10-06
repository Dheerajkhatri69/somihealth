"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import UploadMediaLite from "@/components/UploadMediaLite";
import toast from "react-hot-toast";

const FooterUIManagementPage = () => {
  const [footerData, setFooterData] = useState({
    _id: "",
    ctaTitle: "",
    ctaDescription: "",
    ctaBenefits: [],
    ctaLearnMoreText: "",
    ctaLearnMoreLink: "",
    ctaStartJourneyText: "",
    ctaStartJourneyLink: "",
    ctaImage: "",
    brandName: "",
    brandTagline: "",
    socialLinks: [],
    contactInfo: { phone: "", address: "", email: "" },
    badges: [],
    navigationLinks: [],
    legalLinks: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const response = await fetch("/api/footer", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          setFooterData((prev) => ({ ...prev, ...data })); // keep shape and include _id
        }
      } catch (error) {
        console.error("Error fetching footer data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFooterData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const hasId = Boolean(footerData?._id);
      const method = hasId ? "PUT" : "POST";
      const response = await fetch("/api/footer", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(footerData),
      });
      if (response.ok) {
        const saved = await response.json();
        setFooterData((prev) => ({ ...prev, ...saved }));
        toast.success(hasId ? "Footer updated!" : "Footer created!");
      } else {
        toast.error("Failed to save footer data");
      }
    } catch (error) {
      console.error("Error saving footer data:", error);
      toast.error("Error saving footer data");
    } finally {
      setSaving(false);
    }
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
        <h1 className="text-3xl font-bold">Footer Management</h1>
        <Button onClick={handleSave} disabled={saving || loading} className="bg-secondary text-white hover:bg-secondary/90">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* CTA Section */}
          <Card className="border-l-4 border-gray-200 border-l-secondary">
            <CardHeader>
              <CardTitle>CTA Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">CTA Title</label>
                <Input
                  value={footerData.ctaTitle}
                  onChange={(e) => setFooterData((p) => ({ ...p, ctaTitle: e.target.value }))}
                  placeholder="Enter CTA title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">CTA Description</label>
                <Textarea
                  value={footerData.ctaDescription}
                  onChange={(e) => setFooterData((p) => ({ ...p, ctaDescription: e.target.value }))}
                  placeholder="Enter CTA description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">CTA Image</label>
                <div className="mt-2">
                  <UploadMediaLite
                    file={footerData.ctaImage}
                    onUploadComplete={(url) => setFooterData((p) => ({ ...p, ctaImage: url }))}
                    onDelete={() => setFooterData((p) => ({ ...p, ctaImage: "" }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Learn More Text</label>
                  <Input
                    value={footerData.ctaLearnMoreText}
                    onChange={(e) => setFooterData((p) => ({ ...p, ctaLearnMoreText: e.target.value }))}
                    placeholder="Learn More"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Learn More Link</label>
                  <Input
                    value={footerData.ctaLearnMoreLink}
                    onChange={(e) => setFooterData((p) => ({ ...p, ctaLearnMoreLink: e.target.value }))}
                    placeholder="/learn-more"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Journey Text</label>
                  <Input
                    value={footerData.ctaStartJourneyText}
                    onChange={(e) => setFooterData((p) => ({ ...p, ctaStartJourneyText: e.target.value }))}
                    placeholder="Start Your Journey"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Start Journey Link</label>
                  <Input
                    value={footerData.ctaStartJourneyLink}
                    onChange={(e) => setFooterData((p) => ({ ...p, ctaStartJourneyLink: e.target.value }))}
                    placeholder="/getstarted"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Brand Section */}
          <Card className="border-l-4 border-gray-200 border-l-secondary">
            <CardHeader>
              <CardTitle>Brand Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Brand Name</label>
                <Input
                  value={footerData.brandName}
                  onChange={(e) => setFooterData((p) => ({ ...p, brandName: e.target.value }))}
                  placeholder="somi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Brand Tagline</label>
                <Input
                  value={footerData.brandTagline}
                  onChange={(e) => setFooterData((p) => ({ ...p, brandTagline: e.target.value }))}
                  placeholder="Look Better, Feel Better, Live Better."
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-l-4 border-gray-200 border-l-secondary">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <Input
                  value={footerData.contactInfo.phone}
                  onChange={(e) =>
                    setFooterData((p) => ({ ...p, contactInfo: { ...p.contactInfo, phone: e.target.value } }))
                  }
                  placeholder="(704) 386-6871"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <Textarea
                  value={footerData.contactInfo.address}
                  onChange={(e) =>
                    setFooterData((p) => ({ ...p, contactInfo: { ...p.contactInfo, address: e.target.value } }))
                  }
                  placeholder="4111 E. Rose Lake Dr. Charlotte, NC 28217"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  value={footerData.contactInfo.email}
                  onChange={(e) =>
                    setFooterData((p) => ({ ...p, contactInfo: { ...p.contactInfo, email: e.target.value } }))
                  }
                  placeholder="info@joinsomi.com"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* CTA Benefits */}
          <Card className="border-l-4 border-gray-200 border-l-secondary">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>CTA Benefits</CardTitle>
                <Button
                  onClick={() =>
                    setFooterData((p) => ({
                      ...p,
                      ctaBenefits: [...(p.ctaBenefits || []), { text: "", sortOrder: p.ctaBenefits?.length || 0 }],
                    }))
                  }
                  size="sm"
                  className="bg-secondary text-white hover:bg-secondary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Benefit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {footerData?.ctaBenefits?.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={benefit.text}
                    onChange={(e) =>
                      setFooterData((p) => ({
                        ...p,
                        ctaBenefits: p.ctaBenefits.map((item, i) => (i === index ? { ...item, text: e.target.value } : item)),
                      }))
                    }
                    placeholder="Enter benefit text"
                  />
                  <Button
                    onClick={() =>
                      setFooterData((p) => ({
                        ...p,
                        ctaBenefits: p.ctaBenefits.filter((_, i) => i !== index),
                      }))
                    }
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="border-l-4 border-gray-200 border-l-secondary">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Social Links</CardTitle>
                <Button
                  onClick={() =>
                    setFooterData((p) => ({
                      ...p,
                      socialLinks: [...(p.socialLinks || []), { platform: "instagram", url: "", ariaLabel: "" }],
                    }))
                  }
                  size="sm"
                  className="bg-secondary text-white hover:bg-secondary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Social Link
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {footerData?.socialLinks?.map((social, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Social Link {index + 1}</h4>
                    <Button
                      onClick={() =>
                        setFooterData((p) => ({
                          ...p,
                          socialLinks: p.socialLinks.filter((_, i) => i !== index),
                        }))
                      }
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Platform</label>
                    <select
                      value={social.platform}
                      onChange={(e) =>
                        setFooterData((p) => ({
                          ...p,
                          socialLinks: p.socialLinks.map((item, i) => (i === index ? { ...item, platform: e.target.value } : item)),
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="tiktok">TikTok</option>
                      <option value="indeed">Indeed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">URL</label>
                    <Input
                      value={social.url}
                      onChange={(e) =>
                        setFooterData((p) => ({
                          ...p,
                          socialLinks: p.socialLinks.map((item, i) => (i === index ? { ...item, url: e.target.value } : item)),
                        }))
                      }
                      placeholder="https://instagram.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Aria Label</label>
                    <Input
                      value={social.ariaLabel}
                      onChange={(e) =>
                        setFooterData((p) => ({
                          ...p,
                          socialLinks: p.socialLinks.map((item, i) => (i === index ? { ...item, ariaLabel: e.target.value } : item)),
                        }))
                      }
                      placeholder="Instagram"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="border-l-4 border-gray-200 border-l-secondary">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Badges</CardTitle>
                <Button
                  onClick={() =>
                    setFooterData((p) => ({
                      ...p,
                      badges: [...(p.badges || []), { name: "", image: "", alt: "", sortOrder: p.badges?.length || 0 }],
                    }))
                  }
                  size="sm"
                  className="bg-secondary text-white hover:bg-secondary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Badge
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {footerData?.badges?.map((badge, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Badge {index + 1}</h4>
                    <Button
                      onClick={() =>
                        setFooterData((p) => ({
                          ...p,
                          badges: p.badges.filter((_, i) => i !== index),
                        }))
                      }
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input
                      value={badge.name}
                      onChange={(e) =>
                        setFooterData((p) => ({
                          ...p,
                          badges: p.badges.map((item, i) => (i === index ? { ...item, name: e.target.value } : item)),
                        }))
                      }
                      placeholder="LegitScript"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Badge Image</label>
                    <div className="mt-2">
                      <UploadMediaLite
                        file={badge.image}
                        onUploadComplete={(url) =>
                          setFooterData((p) => ({
                            ...p,
                            badges: p.badges.map((item, i) => (i === index ? { ...item, image: url } : item)),
                          }))
                        }
                        onDelete={() =>
                          setFooterData((p) => ({
                            ...p,
                            badges: p.badges.map((item, i) => (i === index ? { ...item, image: "" } : item)),
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Alt Text</label>
                    <Input
                      value={badge.alt}
                      onChange={(e) =>
                        setFooterData((p) => ({
                          ...p,
                          badges: p.badges.map((item, i) => (i === index ? { ...item, alt: e.target.value } : item)),
                        }))
                      }
                      placeholder="LegitScript Certified"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Navigation Links */}
          <Card className="border-l-4 border-gray-200 border-l-secondary">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Navigation Links</CardTitle>
                <Button
                  onClick={() =>
                    setFooterData((p) => ({
                      ...p,
                      navigationLinks: [
                        ...(
                          p.navigationLinks || []
                        ),
                        { text: "", href: "", target: "_self", rel: "", sortOrder: p.navigationLinks?.length || 0 },
                      ],
                    }))
                  }
                  size="sm"
                  className="bg-secondary text-white hover:bg-secondary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {footerData?.navigationLinks?.map((link, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Link {index + 1}</h4>
                    <Button
                      onClick={() =>
                        setFooterData((p) => ({
                          ...p,
                          navigationLinks: p.navigationLinks.filter((_, i) => i !== index),
                        }))
                      }
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Text</label>
                    <Input
                      value={link.text}
                      onChange={(e) =>
                        setFooterData((p) => ({
                          ...p,
                          navigationLinks: p.navigationLinks.map((item, i) => (i === index ? { ...item, text: e.target.value } : item)),
                        }))
                      }
                      placeholder="Referrals"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">URL</label>
                    <Input
                      value={link.href}
                      onChange={(e) =>
                        setFooterData((p) => ({
                          ...p,
                          navigationLinks: p.navigationLinks.map((item, i) => (i === index ? { ...item, href: e.target.value } : item)),
                        }))
                      }
                      placeholder="/referrals"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">Target</label>
                      <select
                        value={link.target}
                        onChange={(e) =>
                          setFooterData((p) => ({
                            ...p,
                            navigationLinks: p.navigationLinks.map((item, i) => (i === index ? { ...item, target: e.target.value } : item)),
                          }))
                        }
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="_self">Same Tab</option>
                        <option value="_blank">New Tab</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Rel</label>
                      <Input
                        value={link.rel}
                        onChange={(e) =>
                          setFooterData((p) => ({
                            ...p,
                            navigationLinks: p.navigationLinks.map((item, i) => (i === index ? { ...item, rel: e.target.value } : item)),
                          }))
                        }
                        placeholder="noopener noreferrer"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Legal Links */}
          <Card className="border-l-4 border-gray-200 border-l-secondary">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Legal Links</CardTitle>
                <Button
                  onClick={() =>
                    setFooterData((p) => ({
                      ...p,
                      legalLinks: [...(p.legalLinks || []), { text: "", href: "", sortOrder: p.legalLinks?.length || 0 }],
                    }))
                  }
                  size="sm"
                  className="bg-secondary text-white hover:bg-secondary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Legal Link
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {footerData?.legalLinks?.map((link, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={link.text}
                    onChange={(e) =>
                      setFooterData((p) => ({
                        ...p,
                        legalLinks: p.legalLinks.map((item, i) => (i === index ? { ...item, text: e.target.value } : item)),
                      }))
                    }
                    placeholder="HIPAA Privacy"
                    className="flex-1"
                  />
                  <Input
                    value={link.href}
                    onChange={(e) =>
                      setFooterData((p) => ({
                        ...p,
                        legalLinks: p.legalLinks.map((item, i) => (i === index ? { ...item, href: e.target.value } : item)),
                      }))
                    }
                    placeholder="/footer/hipaa"
                    className="flex-1"
                  />
                  <Button
                    onClick={() =>
                      setFooterData((p) => ({
                        ...p,
                        legalLinks: p.legalLinks.filter((_, i) => i !== index),
                      }))
                    }
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FooterUIManagementPage;