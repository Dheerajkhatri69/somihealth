'use client';

import { useEffect, useMemo, useState } from 'react';
import { Save, ArrowLeft, Trash, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import UploadMediaLite from '@/components/UploadMediaLite';
import Image from 'next/image';

/* ================= schema-aligned defaults (with legacy fallback in mergeDefaults) ================= */
// <<< NEW: fully align to mongoose schema
const EMPTY_FORM = {
  name: '',
  slug: '',
  showInNavbar: true,
  type: 'simple',
  discover: { label: '', href: '' },
  treatments: [],
  categories: [],
  cta: { title: '', button: { label: 'Get Started', href: '/getstarted' }, img: '' },
  mainPanelImg: '',
  proTypeHero: {
    eyebrow: '',
    headingLine1: '',
    lines: [],                 // array of strings
    body: '',
    ctaText: '',
    heroImage: '',
    heroAlt: '',
    disclaimer: '',
  },
  expectSection: {
    title: '',
    image: { src: '', alt: '', ratio: '' },
    items: [],                 // [{heading:'', description:''}]
  },
  banner: {
    image: { src: '', alt: '' },
    headline: { line1: '', line2: '' },
    cta: { text: '', href: '' },
    footnote: '',
  },
  sortOrder: 0,
  isActive: true,
};

export default function MenuDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const menuKey = decodeURIComponent(String(rawId ?? ''));
  const isNew = menuKey === 'new';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [recordId, setRecordId] = useState(null);

  const isValidObjectId = (v) => /^[a-f0-9]{24}$/i.test(String(v || ''));

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const m = await loadMenuByAnyKey(menuKey);
        if (!m) throw new Error('Menu not found');
        setRecordId(isValidObjectId(m?._id) ? m._id : null);
        setFormData(mergeDefaults(EMPTY_FORM, m)); // <<< NEW: robust, schema-aligned merge + legacy mapping
      } catch (e) {
        console.error(e);
        alert('Failed to load menu.');
        router.push('/dashboard/websitehome');
      } finally {
        setLoading(false);
      }
    })();
  }, [isNew, menuKey, router]);

  const title = isNew ? 'Create Menu' : 'Edit Menu';
  const headerSubtitle = useMemo(
    () => (isNew ? 'Fill in details and click Save to create it.' : 'View and edit full details for this menu.'),
    [isNew]
  );

  /* ---------- helpers (local) ---------- */
  function handleInputChange(field, value) {
    if (field.includes('.')) {
      const path = field.split('.');
      setFormData((prev) => {
        const draft = { ...prev };
        let cur = draft;
        for (let i = 0; i < path.length - 1; i++) {
          const key = path[i];
          cur[key] = cur[key] ?? {};
          cur = cur[key];
        }
        cur[path[path.length - 1]] = value;
        return draft;
      });
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  }

  function handleTreatmentChange(index, field, value) {
    const draft = [...(formData.treatments || [])];
    draft[index] = { ...draft[index], [field]: value };
    setFormData((prev) => ({ ...prev, treatments: draft }));
  }
  function addTreatment() {
    setFormData((p) => ({
      ...p,
      treatments: [...(p.treatments || []), { label: '', href: '', img: '', badge: '' }],
    }));
  }
  function removeTreatment(i) {
    setFormData((p) => ({ ...p, treatments: (p.treatments || []).filter((_, idx) => idx !== i) }));
  }

  function handleCategoryChange(categoryIndex, field, value) {
    const cats = [...(formData.categories || [])];
    if (field === 'title') {
      cats[categoryIndex] = { ...cats[categoryIndex], title: value };
    } else if (field.startsWith('item.')) {
      const [, itemIndexStr, key] = field.split('.');
      const itemIndex = parseInt(itemIndexStr);
      const items = [...(cats[categoryIndex].items || [])];
      items[itemIndex] = { ...items[itemIndex], [key]: value };
      cats[categoryIndex] = { ...cats[categoryIndex], items };
    }
    setFormData((p) => ({ ...p, categories: cats }));
  }
  function addCategory() {
    setFormData((p) => ({
      ...p,
      categories: [...(p.categories || []), { title: '', items: [{ label: '', href: '', isLink: false }] }],
    }));
  }
  function removeCategory(categoryIndex) {
    setFormData((p) => ({ ...p, categories: (p.categories || []).filter((_, i) => i !== categoryIndex) }));
  }
  function addCategoryItem(categoryIndex) {
    const cats = [...(formData.categories || [])];
    cats[categoryIndex] = {
      ...cats[categoryIndex],
      items: [...(cats[categoryIndex].items || []), { label: '', href: '', isLink: false }],
    };
    setFormData((p) => ({ ...p, categories: cats }));
  }
  function removeCategoryItem(categoryIndex, itemIndex) {
    const cats = [...(formData.categories || [])];
    cats[categoryIndex].items = (cats[categoryIndex].items || []).filter((_, i) => i !== itemIndex);
    setFormData((p) => ({ ...p, categories: cats }));
  }

  // <<< NEW: hero/expect/banner image handling per schema fields
  function handleImageUpload(field, imageUrl) {
    if (field === 'cta.img') {
      setFormData((prev) => ({ ...prev, cta: { ...prev.cta, img: imageUrl } }));
    } else if (field === 'mainPanelImg') {
      setFormData((prev) => ({ ...prev, mainPanelImg: imageUrl }));
    } else if (field.startsWith('treatment.')) {
      const idx = parseInt(field.split('.')[1]);
      const draft = [...(formData.treatments || [])];
      draft[idx] = { ...draft[idx], img: imageUrl };
      setFormData((prev) => ({ ...prev, treatments: draft }));
    } else if (field === 'proTypeHero.heroImage') {
      setFormData((prev) => ({ ...prev, proTypeHero: { ...prev.proTypeHero, heroImage: imageUrl } }));
    } else if (field === 'expectSection.image.src') {
      setFormData((prev) => ({
        ...prev,
        expectSection: { ...prev.expectSection, image: { ...(prev.expectSection?.image || {}), src: imageUrl } },
      }));
    } else if (field === 'banner.image.src') {
      setFormData((prev) => ({
        ...prev,
        banner: { ...prev.banner, image: { ...(prev.banner?.image || {}), src: imageUrl } },
      }));
    }
  }

  // <<< NEW: lines array helpers
  function addHeroLine() {
    setFormData((p) => ({ ...p, proTypeHero: { ...p.proTypeHero, lines: [...(p.proTypeHero?.lines || []), ''] } }));
  }
  function updateHeroLine(i, value) {
    const lines = [...(formData.proTypeHero?.lines || [])];
    lines[i] = value;
    setFormData((p) => ({ ...p, proTypeHero: { ...p.proTypeHero, lines } }));
  }
  function removeHeroLine(i) {
    setFormData((p) => ({ ...p, proTypeHero: { ...p.proTypeHero, lines: (p.proTypeHero?.lines || []).filter((_, idx) => idx !== i) } }));
  }

  async function saveMenu(e) {
    e?.preventDefault?.();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        slug: slugify(formData.name),
        // For simple menus ensure discover href defaulting (API also guards)
        discover:
          formData.type === 'categorized'
            ? { label: '', href: '' }
            : {
              label: formData.discover?.label || '',
              href: `/underdevelopmentmainpage/${slugify(formData.name)}`,
            },
      };

      const hasId = isValidObjectId(recordId);
      const selector = hasId
        ? { _id: recordId }
        : formData.slug
          ? { slug: formData.slug }
          : formData.name
            ? { name: formData.name }
            : null;

      const method = isNew ? 'POST' : selector ? 'PUT' : 'POST';
      const body = method === 'PUT' ? { selector, update: payload } : payload;

      const res = await fetch('/api/menus', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        cache: 'no-store',
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.message || 'Save failed');

      router.push('/dashboard/websitehome');
    } catch (e) {
      console.error(e);
      alert('Error saving menu.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteMenu() {
    if (isNew) return router.push('/dashboard/websitehome');
    if (!confirm('Delete this menu?')) return;

    try {
      const selector = isValidObjectId(recordId)
        ? { _id: recordId }
        : formData.slug
          ? { slug: formData.slug }
          : formData.name
            ? { name: formData.name }
            : null;

      await fetch(`/api/menus`, {
        method: 'DELETE',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selector }),
      });
      router.push('/dashboard/websitehome');
    } catch (e) {
      console.error(e);
      router.push('/dashboard/websitehome');
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="w-full mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/dashboard/websitehome" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
            <ArrowLeft size={16} />
            Back to Website Home
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">{headerSubtitle}</p>
        </div>
        {!isNew && (
          <button
            onClick={deleteMenu}
            className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100"
          >
            <Trash size={16} />
            Delete
          </button>
        )}
      </div>

      <form onSubmit={saveMenu} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Basic Information</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* --- top row --- */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Label className="text-sm font-medium">Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div className="md:col-span-1">
              <Label className="text-sm font-medium">Slug</Label>
              <Input value={slugify(formData.name)} readOnly placeholder="Auto from name" className="mt-1 bg-gray-50" />
            </div>
            <div className="md:col-span-1">
              <Label className="text-sm font-medium">Sort Order</Label>
              <Input
                type="number"
                value={Number.isFinite(formData.sortOrder) ? formData.sortOrder : 0}
                onChange={(e) => handleInputChange('sortOrder', Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="show-in-navbar"
                checked={!!formData.showInNavbar}
                onCheckedChange={(checked) => handleInputChange('showInNavbar', checked)}
              />
              <Label htmlFor="show-in-navbar" className="text-sm">Show in Navbar</Label>
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm font-medium">Type</Label>
              <Select value={formData.type} onValueChange={(v) => handleInputChange('type', v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Choose type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="categorized">Categorized</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Main Panel Image */}
          <div className="border-t pt-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Main Panel Image</h3>
            <div>
              <Label className="text-sm font-medium">Panel Image</Label>
              <div className="mt-1">
                <UploadMediaLite
                  onUploadComplete={(url) => handleImageUpload('mainPanelImg', url)}
                  onDelete={() => handleInputChange('mainPanelImg', '')}
                  file={formData.mainPanelImg || ''}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">This image will be displayed in the main panel for this menu.</p>
            </div>
          </div>

          {/* ================= Pro Type Hero (schema-aligned) ================= */}
          <div className="border-t pt-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Pro Type Hero</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Eyebrow</Label>
                <Input value={formData.proTypeHero.eyebrow} onChange={(e) => handleInputChange('proTypeHero.eyebrow', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm">Heading (Line 1)</Label>
                <Input value={formData.proTypeHero.headingLine1} onChange={(e) => handleInputChange('proTypeHero.headingLine1', e.target.value)} className="mt-1" />
              </div>

              {/* Lines array */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Additional Heading Lines</Label>
                  <button type="button" onClick={addHeroLine} className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-white hover:bg-secondary/80">
                    <Plus size={16} /> Add Line
                  </button>
                </div>
                <div className="space-y-2">
                  {(formData.proTypeHero.lines || []).map((ln, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={ln} onChange={(e) => updateHeroLine(i, e.target.value)} placeholder={`Line ${i + 1}`} />
                      <button type="button" onClick={() => removeHeroLine(i)} className="rounded-md border px-2 text-red-600 hover:bg-red-50">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <Label className="text-sm">Body</Label>
                <textarea rows={3} value={formData.proTypeHero.body} onChange={(e) => handleInputChange('proTypeHero.body', e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-2" />
              </div>

              <div>
                <Label className="text-sm">CTA Text</Label>
                <Input value={formData.proTypeHero.ctaText} onChange={(e) => handleInputChange('proTypeHero.ctaText', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm">Hero Alt</Label>
                <Input value={formData.proTypeHero.heroAlt} onChange={(e) => handleInputChange('proTypeHero.heroAlt', e.target.value)} className="mt-1" />
              </div>

              <div className="md:col-span-2">
                <Label className="text-sm">Hero Image</Label>
                <div className="mt-1">
                  <UploadMediaLite
                    onUploadComplete={(url) => handleImageUpload('proTypeHero.heroImage', url)}
                    onDelete={() => handleInputChange('proTypeHero.heroImage', '')}
                    file={formData.proTypeHero.heroImage || ''}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <Label className="text-sm">Disclaimer</Label>
                <textarea rows={2} value={formData.proTypeHero.disclaimer} onChange={(e) => handleInputChange('proTypeHero.disclaimer', e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-2" />
              </div>
            </div>
          </div>

          {/* ================= Expect Section (schema-aligned) ================= */}
          <div className="border-t pt-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Expect Section</h3>
                <p className="text-sm text-gray-500">Manage title, image (src/alt/ratio) and items (heading + description).</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    expectSection: {
                      ...prev.expectSection,
                      items: [...(prev.expectSection?.items || []), { heading: '', description: '' }],
                    },
                  }))
                }
                className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-white hover:bg-secondary/80"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>

            <div className="mb-3">
              <Label className="text-sm">Section Title</Label>
              <Input value={formData.expectSection.title} onChange={(e) => handleInputChange('expectSection.title', e.target.value)} className="mt-1" />
            </div>

            <div className="grid md:grid-cols-3 gap-3 mb-4">
              <div className="md:col-span-2">
                <Label className="text-sm">Section Image</Label>
                <div className="mt-1">
                  <UploadMediaLite
                    onUploadComplete={(url) => handleImageUpload('expectSection.image.src', url)}
                    onDelete={() => handleInputChange('expectSection.image.src', '')}
                    file={formData.expectSection.image?.src || ''}
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm">Image Alt</Label>
                <Input value={formData.expectSection.image?.alt || ''} onChange={(e) => handleInputChange('expectSection.image.alt', e.target.value)} className="mt-1" />
                <Label className="text-sm mt-3 block">Image Ratio (e.g., 16/9)</Label>
                <Input value={formData.expectSection.image?.ratio || ''} onChange={(e) => handleInputChange('expectSection.image.ratio', e.target.value)} className="mt-1" />
              </div>
            </div>

            <div className="space-y-3">
              {(formData.expectSection.items || []).map((it, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Item {i + 1}</h4>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          expectSection: { ...prev.expectSection, items: (prev.expectSection.items || []).filter((_, idx) => idx !== i) },
                        }))
                      }
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Heading</Label>
                      <Input
                        value={it.heading || ''}
                        onChange={(e) => {
                          const items = [...(formData.expectSection?.items || [])];
                          items[i] = { ...items[i], heading: e.target.value };
                          setFormData((prev) => ({ ...prev, expectSection: { ...prev.expectSection, items } }));
                        }}
                        className="mt-1 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={it.description || ''}
                        onChange={(e) => {
                          const items = [...(formData.expectSection?.items || [])];
                          items[i] = { ...items[i], description: e.target.value };
                          setFormData((prev) => ({ ...prev, expectSection: { ...prev.expectSection, items } }));
                        }}
                        className="mt-1 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= Banner (schema-aligned) ================= */}
          <div className="border-t pt-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Banner</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label className="text-sm">Banner Image</Label>
                <div className="mt-1">
                  <UploadMediaLite
                    onUploadComplete={(url) => handleImageUpload('banner.image.src', url)}
                    onDelete={() => handleInputChange('banner.image.src', '')}
                    file={formData.banner.image?.src || ''}
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm">Image Alt</Label>
                <Input value={formData.banner.image?.alt || ''} onChange={(e) => handleInputChange('banner.image.alt', e.target.value)} className="mt-1" />
              </div>

              <div>
                <Label className="text-sm">Headline Line 1</Label>
                <Input value={formData.banner.headline?.line1 || ''} onChange={(e) => handleInputChange('banner.headline.line1', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm">Headline Line 2</Label>
                <Input value={formData.banner.headline?.line2 || ''} onChange={(e) => handleInputChange('banner.headline.line2', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm">CTA Text</Label>
                <Input value={formData.banner.cta?.text || ''} onChange={(e) => handleInputChange('banner.cta.text', e.target.value)} className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm">CTA Link</Label>
                <Input value={formData.banner.cta?.href || ''} onChange={(e) => handleInputChange('banner.cta.href', e.target.value)} className="mt-1" />
              </div>

              <div className="md:col-span-3">
                <Label className="text-sm">Footnote</Label>
                <textarea rows={2} value={formData.banner.footnote || ''} onChange={(e) => handleInputChange('banner.footnote', e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-2" />
              </div>
            </div>
          </div>

          {/* Discover for simple menus */}
          {formData.type !== 'categorized' && (
            <div className="border-t pt-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Discover</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Label *</Label>
                  <Input
                    value={formData.discover.label}
                    onChange={(e) => handleInputChange('discover.label', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Href *</Label>
                  <Input
                    value={`/underdevelopmentmainpage/${slugify(formData.name)}`}
                    readOnly
                    required
                    className="mt-1 bg-gray-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Auto Treatments (unchanged render; editing not exposed) */}
          <div className="border-t pt-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-900">Auto Treatments</h3>
              <p className="text-sm text-gray-500 mt-1">Treatments are automatically synced from products with matching category.</p>
            </div>

            {(formData.treatments || []).length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
                No treatments found. Create products with category {formData.name || 'this menu'} to see them here.
              </div>
            ) : (
              <div className="space-y-3">
                {(formData.treatments || []).map((t, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-2">
                      {t.img && (
                        <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-white">
                          <Image
                            src={t.img}
                            alt={t.label}
                            fill
                            sizes="40px"
                            className="object-contain"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div>
                          <h4 className="font-medium text-gray-900 truncate">{t.label}</h4>
                          {t.badge && (
                            <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                              {t.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{t.href}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Categories (unchanged UI shape; aligns to schema) */}
          {formData.type === 'categorized' && (
            <div className="border-t pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Categories</h3>
                <button
                  type="button"
                  onClick={addCategory}
                  className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
                >
                  <Plus size={16} /> Add Category
                </button>
              </div>

              {(formData.categories || []).map((cat, cIdx) => (
                <div key={cIdx} className="mb-4 rounded-xl border border-gray-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Category {cIdx + 1}</h4>
                    <button type="button" onClick={() => removeCategory(cIdx)} className="text-red-600 hover:text-red-800">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="mb-3">
                    <Label className="text-sm">Title</Label>
                    <Input value={cat.title || ''} onChange={(e) => handleCategoryChange(cIdx, 'title', e.target.value)} className="mt-1" />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800">Items</span>
                      <button
                        type="button"
                        onClick={() => addCategoryItem(cIdx)}
                        className="rounded-md bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                      >
                        Add Item
                      </button>
                    </div>

                    {(cat.items || []).map((it, iIdx) => (
                      <div key={iIdx} className="mb-2 rounded-lg border border-gray-200 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium">Item {iIdx + 1}</span>
                          <button type="button" onClick={() => removeCategoryItem(cIdx, iIdx)} className="text-red-600 hover:text-red-800">
                            <X size={16} />
                          </button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Label</Label>
                            <Input value={it.label || ''} onChange={(e) => handleCategoryChange(cIdx, `item.${iIdx}.label`, e.target.value)} className="mt-1 text-sm" />
                          </div>
                          <div>
                            <Label className="text-xs">Href</Label>
                            <Input value={it.href || ''} onChange={(e) => handleCategoryChange(cIdx, `item.${iIdx}.href`, e.target.value)} className="mt-1 text-sm" />
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Switch
                            id={`item-link-${cIdx}-${iIdx}`}
                            checked={!!it.isLink}
                            onCheckedChange={(checked) => handleCategoryChange(cIdx, `item.${iIdx}.isLink`, checked)}
                          />
                          <Label htmlFor={`item-link-${cIdx}-${iIdx}`} className="text-xs text-gray-700">
                            External Link
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA (unchanged) */}
          <div className="border-t pt-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Call to Action</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Title</Label>
                <textarea
                  rows={2}
                  value={formData.cta.title}
                  onChange={(e) => handleInputChange('cta.title', e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 p-2"
                  placeholder="Use \n for line breaks"
                />
              </div>
              <div>
                <Label className="text-sm">Image</Label>
                <div className="mt-1">
                  <UploadMediaLite
                    onUploadComplete={(url) => handleImageUpload('cta.img', url)}
                    onDelete={() => handleInputChange('cta.img', '')}
                    file={formData.cta.img || ''}
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
              <strong>Default Button:</strong> “{formData.cta.button?.label || 'Get Started'}” → {formData.cta.button?.href || '/getstarted'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <Link href="/menus" className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ================= utilities ================= */

function slugify(s = '') {
  return s
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

/** Safely merge defaults into possibly sparse/legacy API object */
// <<< NEW: map legacy fields -> schema fields for backward compatibility
function mergeDefaults(defaults, data) {
  const legacyPro = (data && data.proTypeHero) || {};
  const legacyBanner = (data && data.banner) || {};
  const legacyExpect = (data && data.expectSection) || {};

  // Legacy → New mapping (no TS types in .jsx)
  const mappedPro = {
    eyebrow: legacyPro.eyebrow ?? '',
    headingLine1: legacyPro.headingLine1 ?? legacyPro.title ?? '',
    lines: Array.isArray(legacyPro.lines) ? legacyPro.lines : [],
    body: legacyPro.body ?? legacyPro.subtitle ?? '',
    ctaText: legacyPro.ctaText ?? (legacyPro.cta && legacyPro.cta.label) ?? '',
    heroImage: legacyPro.heroImage ?? legacyPro.image ?? '',
    heroAlt: legacyPro.heroAlt ?? '',
    disclaimer: legacyPro.disclaimer ?? '',
  };

  const mappedExpect = {
    title: legacyExpect.title ?? '',
    image: {
      src: (legacyExpect.image && legacyExpect.image.src) ?? '',
      alt: (legacyExpect.image && legacyExpect.image.alt) ?? '',
      ratio: (legacyExpect.image && legacyExpect.image.ratio) ?? '',
    },
    items: Array.isArray(legacyExpect.items)
      ? legacyExpect.items.map((it) => ({
        heading: (it && (it.heading ?? it.title)) || '',
        description: (it && it.description) || '',
      }))
      : [],
  };

  const mappedBanner = {
    image: {
      src:
        (legacyBanner.image && legacyBanner.image.src) ??
        legacyBanner.image ??
        '',
      alt: (legacyBanner.image && legacyBanner.image.alt) ?? '',
    },
    headline: {
      line1:
        (legacyBanner.headline && legacyBanner.headline.line1) ??
        legacyBanner.title ??
        '',
      line2:
        (legacyBanner.headline && legacyBanner.headline.line2) ??
        legacyBanner.description ??
        '',
    },
    cta: {
      text:
        (legacyBanner.cta && legacyBanner.cta.text) ??
        (legacyBanner.cta && legacyBanner.cta.label) ??
        '',
      href: (legacyBanner.cta && legacyBanner.cta.href) ?? '',
    },
    footnote: legacyBanner.footnote ?? '',
  };

  return {
    ...defaults,
    ...data,
    discover: { ...defaults.discover, ...((data && data.discover) || {}) },
    cta: {
      ...defaults.cta,
      ...((data && data.cta) || {}),
      button: {
        ...defaults.cta.button,
        ...(((data && data.cta) && data.cta.button) || {}),
      },
    },
    treatments: Array.isArray(data && data.treatments) ? data.treatments : [],
    categories: Array.isArray(data && data.categories) ? data.categories : [],
    mainPanelImg: (data && data.mainPanelImg) || '',
    proTypeHero: mappedPro,
    expectSection: mappedExpect,
    banner: mappedBanner,
    sortOrder:
      Number.isFinite(data && data.sortOrder) ? data.sortOrder : defaults.sortOrder,
    isActive:
      typeof (data && data.isActive) === 'boolean'
        ? data.isActive
        : defaults.isActive,
  };
}

/** Load by id/name/slug, handling multiple API shapes & cache (unchanged) */
async function loadMenuByAnyKey(key) {
  const idOrName = key;

  try {
    const r = await fetch(`/api/menus?id=${encodeURIComponent(idOrName)}`, { cache: 'no-store' });
    const j = await r.json();
    if (j?.success && j?.result) {
      const single = pickFromResult(j.result, idOrName);
      if (single) return single;
    }
  } catch { }

  try {
    const rAll = await fetch('/api/menus', { cache: 'no-store' });
    const jAll = await rAll.json();
    const arr = toArray(jAll?.result);
    const found =
      arr.find((m) => m._id === idOrName) ||
      arr.find((m) => m.name === idOrName) ||
      arr.find((m) => m.slug === idOrName);
    if (found) return found;
  } catch { }

  return null;
}

function toArray(result) {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (typeof result === 'object') {
    return Object.entries(result).map(([key, menu]) => ({ _id: menu?._id || key, name: menu?.name || key, ...menu }));
  }
  return [];
}

function pickFromResult(result, wantedKey) {
  if (!result) return null;

  if (
    typeof result === 'object' &&
    !Array.isArray(result) &&
    (result.name || result.slug || result.type || result.discover || result.treatments || result.categories)
  ) {
    return result;
  }

  if (typeof result === 'object' && !Array.isArray(result)) {
    if (result[wantedKey]) {
      const m = result[wantedKey];
      return { _id: m?._id || wantedKey, name: m?.name || wantedKey, ...m };
    }
    const byId = Object.values(result).find((m) => m && m._id === wantedKey);
    if (byId) return byId;
  }

  if (Array.isArray(result)) {
    return result.find((m) => m._id === wantedKey || m.name === wantedKey || m.slug === wantedKey) || null;
  }

  return null;
}
