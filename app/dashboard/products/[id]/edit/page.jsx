'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import UploadMediaLite from '@/components/UploadMediaLite';
import * as LucideIcons from "lucide-react";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const routeId = decodeURIComponent(String(Array.isArray(params?.id) ? params.id[0] : params?.id || ''));

  const [formData, setFormData] = useState(EMPTY());
  const [menus, setMenus] = useState([]);
  const [recordId, setRecordId] = useState(null); // actual DB id if available
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [routeId]);

  async function load() {
    setLoading(true);
    try {
      // menus for categories
      const m = await fetch('/api/menus', { cache: 'no-store' }).then(r => r.json());
      setMenus(toMenuOptions(m?.result));

      // product
      const p = await resolveProductByAnyKey(routeId);
      if (!p) throw new Error('Not found');

      setRecordId(p._id ?? p.id ?? null);
      setFormData(hydrate(p));
    } catch (e) {
      console.error(e);
      router.push('/dashboard/products');
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(field, value) {
    setFormData(prev => {
      // auto-slug when label changes and slug is empty
      if (field === 'label' && (!prev.slug || prev.slug.trim() === '')) {
        const next = setDeep(prev, field, value);
        return { ...next, slug: slugify(value) };
      }
      // deep update for dot paths (e.g., "ctas.primary.label")
      if (field.includes('.')) {
        return setDeep(prev, field, value);
      }
      // shallow update
      return { ...prev, [field]: value };
    });
  }

  function handleBulletChange(index, field, value) {
    const draft = [...(formData.bullets || [])];
    draft[index] = { ...draft[index], [field]: value };
    setFormData((p) => ({ ...p, bullets: draft }));
  }
  function addBullet() {
    setFormData((p) => ({ ...p, bullets: [...(p.bullets || []), { icon: '', text: '' }] }));
  }
  function removeBullet(i) {
    setFormData((p) => ({ ...p, bullets: (p.bullets || []).filter((_, idx) => idx !== i) }));
  }
  function handleImageUpload(_, url) { setFormData((p) => ({ ...p, heroImage: url })); }

  async function save(e) {
    e?.preventDefault?.();
    setSaving(true);
    try {
      const payload = { ...formData, slug: slugify(formData.label) };
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: recordId ?? routeId, ...payload }),
      });
      const j = await res.json();
      if (!j?.success) throw new Error(j?.message || 'Save failed');
      router.push(`/dashboard/products/${encodeURIComponent(routeId)}`);
    } catch (e) {
      console.error(e);
      alert('Error saving product.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="w-full mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <Link href={`/dashboard/products/${encodeURIComponent(routeId)}`} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
          <ArrowLeft size={16} /> Back to details
        </Link>
      </div>

      <form onSubmit={save} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Edit Product</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Row 1 */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Category *</Label>
              <Select value={formData.category} onValueChange={(v) => handleInputChange('category', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {menus.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Slug *</Label>
              <Input value={slugify(formData.label)} readOnly className="mt-1 bg-gray-50" required />
            </div>
            <div>
              <Label className="text-sm font-medium">Sort Order</Label>
              <Input type="number" value={formData.sortOrder} onChange={(e) => handleInputChange('sortOrder', Number(e.target.value))} className="mt-1" />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Product Label *</Label>
              <Input value={formData.label} onChange={(e) => handleInputChange('label', e.target.value)} className="mt-1" required />
            </div>
            <div>
              <Label className="text-sm font-medium">Short Label *</Label>
              <Input value={formData.shortLabel} onChange={(e) => handleInputChange('shortLabel', e.target.value)} className="mt-1" required />
            </div>
          </div>

          {/* Toggles */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Switch id="show-in-plans" checked={!!formData.showInPlans} onCheckedChange={(v) => handleInputChange('showInPlans', v)} />
              <Label htmlFor="show-in-plans" className="text-sm">Show in Plans</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="in-stock" checked={!!formData.inStock} onCheckedChange={(v) => handleInputChange('inStock', v)} />
              <Label htmlFor="in-stock" className="text-sm">In Stock</Label>
            </div>
          </div>

          {/* Price */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Price *</Label>
              <Input type="number" step="0.01" min="0" value={formData.price} onChange={(e) => handleInputChange('price', Number(e.target.value))} className="mt-1" required />
            </div>
            <div>
              <Label className="text-sm font-medium">Unit *</Label>
              <Input value={formData.unit} onChange={(e) => handleInputChange('unit', e.target.value)} placeholder="/mo, /visit…" className="mt-1" required />
            </div>
            <div>
              <Label className="text-sm font-medium">Rating Label</Label>
              <Input value={formData.ratingLabel} onChange={(e) => handleInputChange('ratingLabel', e.target.value)} className="mt-1" />
            </div>
          </div>
          {/* Plans Note (text that shows above buttons in Plans card) */}
          <div className="border-t pt-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Plans Note (shown above buttons)</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label className="text-sm font-medium">Text</Label>
                <Input
                  value={formData.plansNote || ''}
                  onChange={(e) => handleInputChange('plansNote', e.target.value)}
                  className="mt-1"
                  placeholder="Price for purchase of 3 month supply"
                />
                <p className="mt-1 text-xs text-gray-500">This appears under the product image and above the buttons on the plans carousel/grid.</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div>
            <Label className="text-sm font-medium">Hero Image *</Label>
            <div className="mt-1">
              <UploadMediaLite onUploadComplete={(url) => handleImageUpload('heroImage', url)} onDelete={() => handleInputChange('heroImage', '')} file={formData.heroImage} />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium">Description *</Label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              rows={4}
              required
            />
          </div>

          {/* Trustpilot */}
          <div>
            <Label className="text-sm font-medium">Trustpilot URL</Label>
            <Input value={formData.trustpilot} onChange={(e) => handleInputChange('trustpilot', e.target.value)} className="mt-1" placeholder="https://trustpilot.com/reviews/..." />
          </div>

          {/* CTAs Section */}
          <div className="border-t pt-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Call to Action Buttons</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Primary CTA</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Button Text</Label>
                    <Input
                      value={formData.ctas?.primary?.label || ''}
                      onChange={(e) => handleInputChange('ctas.primary.label', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Button Link</Label>
                    <Input
                      value={formData.ctas?.primary?.href || ''}
                      onChange={(e) => handleInputChange('ctas.primary.href', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Secondary CTA</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Button Text</Label>
                    <Input
                      value={formData.ctas?.secondary?.label || ''}
                      onChange={(e) => handleInputChange('ctas.secondary.label', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Button Link</Label>
                    <Input
                      value={formData.ctas?.secondary?.href || ''}
                      onChange={(e) => handleInputChange('ctas.secondary.href', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="border-t pt-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">How It Works</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Heading</Label>
                <Input value={formData.howItWorks?.heading || ''} onChange={(e) => handleInputChange('howItWorks.heading', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium">Introduction Text</Label>
                <textarea value={formData.howItWorks?.intro || ''} onChange={(e) => handleInputChange('howItWorks.intro', e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-2" rows={3} />
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="border-t pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Key Features</h3>
              <button
                type="button"
                onClick={addBullet}
                className="rounded-md bg-secondary px-3 py-1.5 text-sm text-white hover:bg-secondary/90"
              >
                Add Feature
              </button>
            </div>
            {(formData.bullets || []).map((b, i) => (
              <div key={i} className="mb-3 rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-medium">Feature {i + 1}</h4>
                  <button type="button" onClick={() => removeBullet(i)} className="text-red-600 hover:text-red-800">
                    <X size={18} />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Icon</Label>
                    <Select
                      value={b.icon || ""}
                      onValueChange={(value) => handleBulletChange(i, "icon", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select an icon" />
                      </SelectTrigger>
                      <SelectContent>
                        {ICON_OPTIONS.map((option) => {
                          const Icon = LucideIcons[option.value]; // pick component dynamically
                          return (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                {Icon && <Icon className="h-4 w-4" />}
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Text</Label>
                    <Input value={b.text || ''} onChange={(e) => handleBulletChange(i, 'text', e.target.value)} className="mt-1" placeholder="e.g., Fast shipping" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Product Details Section */}
          <div className="border-t pt-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Product Details</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <Input value={formData.productDetails?.title || ''} onChange={(e) => handleInputChange('productDetails.title', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium">Introductory Text</Label>
                <textarea
                  value={formData.productDetails?.intro || ''}
                  onChange={(e) => handleInputChange('productDetails.intro', e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 p-2"
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Breakdown Heading</Label>
                <Input value={formData.productDetails?.breakdownHeading || ''} onChange={(e) => handleInputChange('productDetails.breakdownHeading', e.target.value)} className="mt-1" />
              </div>

              {/* Ingredients List */}
              <div>
                <Label className="text-sm font-medium">Ingredients</Label>
                <div className="mt-1 space-y-2">
                  {(formData.productDetails?.ingredients || []).map((ingredient, i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-2">
                      <Input
                        value={ingredient.name || ''}
                        onChange={e => {
                          const newIngredients = [...(formData.productDetails.ingredients || [])];
                          newIngredients[i] = { ...newIngredients[i], name: e.target.value };
                          setFormData(prev => ({
                            ...prev,
                            productDetails: { ...prev.productDetails, ingredients: newIngredients }
                          }));
                        }}
                        className="flex-1"
                        placeholder="Name (e.g., Methionine)"
                      />
                      <Input
                        value={ingredient.desc || ''}
                        onChange={e => {
                          const newIngredients = [...(formData.productDetails.ingredients || [])];
                          newIngredients[i] = { ...newIngredients[i], desc: e.target.value };
                          setFormData(prev => ({
                            ...prev,
                            productDetails: { ...prev.productDetails, ingredients: newIngredients }
                          }));
                        }}
                        className="flex-1"
                        placeholder="Description"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newIngredients = [...(formData.productDetails.ingredients || [])];
                          newIngredients.splice(i, 1);
                          setFormData(prev => ({
                            ...prev,
                            productDetails: { ...prev.productDetails, ingredients: newIngredients }
                          }));
                        }}
                        className="rounded-md bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      productDetails: {
                        ...prev.productDetails,
                        ingredients: [...(prev.productDetails.ingredients || []), { name: '', desc: '' }]
                      }
                    }));
                  }}
                  className="mt-2 rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
                >
                  Add Ingredient
                </button>
              </div>

              <div>
                <Label className="text-sm font-medium">Benefits</Label>
                <textarea
                  value={formData.productDetails?.benefits?.join('\n') || ''}
                  onChange={(e) => handleInputChange('productDetails.benefits', e.target.value.split('\n'))}
                  className="mt-1 w-full rounded-md border border-gray-300 p-2"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Expectations</Label>
                <textarea
                  value={formData.productDetails?.expectations || ''}
                  onChange={(e) => handleInputChange('productDetails.expectations', e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 p-2"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Footnote</Label>
                <Input value={formData.productDetails?.footnote || ''} onChange={(e) => handleInputChange('productDetails.footnote', e.target.value)} className="mt-1" />
              </div>

              {/* Product Details Image */}
              <div>
                <Label className="text-sm font-medium">Image</Label>
                <div className="mt-1">
                  <UploadMediaLite
                    file={formData.productDetails?.image?.src}
                    onUploadComplete={(url) => {
                      setFormData((prev) => ({ ...prev, productDetails: { ...prev.productDetails, image: { ...prev.productDetails.image, src: url } } }));
                    }}
                    onDelete={() => {
                      setFormData((prev) => ({ ...prev, productDetails: { ...prev.productDetails, image: { ...prev.productDetails.image, src: '' } } }));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="border-t pt-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">How It Works</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <Input value={formData.howItWorksSection?.title || ''} onChange={(e) => handleInputChange('howItWorksSection.title', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium">Steps</Label>
                <div className="mt-1 space-y-2">
                  {(formData.howItWorksSection?.steps || []).map((step, i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-2">
                      <Input
                        type="number"
                        min={1}
                        value={step.number || i + 1}
                        onChange={e => {
                          const newSteps = [...(formData.howItWorksSection.steps || [])];
                          newSteps[i] = { ...newSteps[i], number: Number(e.target.value) };
                          setFormData(prev => ({
                            ...prev,
                            howItWorksSection: { ...prev.howItWorksSection, steps: newSteps }
                          }));
                        }}
                        className="w-20"
                        placeholder="Step #"
                      />
                      <Input
                        value={step.title || ''}
                        onChange={e => {
                          const newSteps = [...(formData.howItWorksSection.steps || [])];
                          newSteps[i] = { ...newSteps[i], title: e.target.value };
                          setFormData(prev => ({
                            ...prev,
                            howItWorksSection: { ...prev.howItWorksSection, steps: newSteps }
                          }));
                        }}
                        className="flex-1"
                        placeholder="Step Title"
                      />
                      <Input
                        value={step.description || ''}
                        onChange={e => {
                          const newSteps = [...(formData.howItWorksSection.steps || [])];
                          newSteps[i] = { ...newSteps[i], description: e.target.value };
                          setFormData(prev => ({
                            ...prev,
                            howItWorksSection: { ...prev.howItWorksSection, steps: newSteps }
                          }));
                        }}
                        className="flex-1"
                        placeholder="Step Description"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newSteps = [...(formData.howItWorksSection.steps || [])];
                          newSteps.splice(i, 1);
                          setFormData(prev => ({
                            ...prev,
                            howItWorksSection: { ...prev.howItWorksSection, steps: newSteps }
                          }));
                        }}
                        className="rounded-md bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      howItWorksSection: {
                        ...prev.howItWorksSection,
                        steps: [...(prev.howItWorksSection.steps || []), { number: (prev.howItWorksSection.steps?.length || 0) + 1, title: '', description: '' }]
                      }
                    }));
                  }}
                  className="mt-2 rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
                >
                  Add Step
                </button>
              </div>
              <div>
                <Label className="text-sm font-medium">CTA Text</Label>
                <Input value={formData.howItWorksSection?.cta?.text || ''} onChange={(e) => handleInputChange('howItWorksSection.cta.text', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium">CTA Link</Label>
                <Input value={formData.howItWorksSection?.cta?.href || ''} onChange={(e) => handleInputChange('howItWorksSection.cta.href', e.target.value)} className="mt-1" />
              </div>

              {/* How It Works Image */}
              <div>
                <Label className="text-sm font-medium">Image</Label>
                <div className="mt-1">
                  <UploadMediaLite
                    file={formData.howItWorksSection?.image?.src}
                    onUploadComplete={(url) => {
                      setFormData((prev) => ({ ...prev, howItWorksSection: { ...prev.howItWorksSection, image: { ...prev.howItWorksSection.image, src: url } } }));
                    }}
                    onDelete={() => {
                      setFormData((prev) => ({ ...prev, howItWorksSection: { ...prev.howItWorksSection, image: { ...prev.howItWorksSection.image, src: '' } } }));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-2">
              <Switch id="is-active" checked={!!formData.isActive} onCheckedChange={(v) => handleInputChange('isActive', v)} />
              <Label htmlFor="is-active" className="text-sm">Product is Active</Label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <Link href={`/dashboard/products/${encodeURIComponent(routeId)}`} className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-white hover:bg-secondary/90 disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- helpers & defaults ---------- */
const EMPTY = () => ({
  category: '',
  slug: '',
  showInPlans: true,
  label: '',
  shortLabel: '',
  heroImage: '',
  price: 0,
  unit: '',
  inStock: true,
  ratingLabel: '',
  trustpilot: '',
  // NEW:
  plansNote: 'Price for purchase of 3 month supply',

  bullets: [],
  description: '',
  ctas: {
    primary: { label: 'Get Started', href: '/getstarted' },
    secondary: { label: 'Learn More', href: '/learn-more' }
  },
  productDetails: {
    title: '',
    introTitle: '',
    intro: '',
    breakdownHeading: '',
    ingredients: [],
    benefitsHeading: '',
    benefits: [],
    expectationsHeading: '',
    expectations: '',
    footnote: '',
    image: { src: '', alt: '' }
  },
  howItWorksSection: {
    title: '',
    steps: [],
    cta: { text: '', href: '' },
    image: { src: '', alt: '' }
  },
  isActive: true,
  sortOrder: 0,
});
function setDeep(obj, path, value) {
  const keys = path.split('.');
  const next = { ...obj };
  let cur = next;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const prevVal = cur[k];
    // ensure each level is an object we can clone into
    cur[k] = (prevVal && typeof prevVal === 'object') ? { ...prevVal } : {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return next;
}

// Icon options for selection
const ICON_OPTIONS = [
  { value: 'Check', label: 'Check' },
  { value: 'Star', label: 'Star' },
  { value: 'Heart', label: 'Heart' },
  { value: 'Shield', label: 'Shield' },
  { value: 'Zap', label: 'Zap' },
  { value: 'Award', label: 'Award' },
  { value: 'Clock', label: 'Clock' },
  { value: 'Users', label: 'Users' },
  { value: 'TrendingUp', label: 'Trending Up' },
  { value: 'Target', label: 'Target' },
  { value: 'Rocket', label: 'Rocket' },
  { value: 'Lock', label: 'Lock' },
  { value: 'Globe', label: 'Globe' },
  { value: 'Gift', label: 'Gift' },
  { value: 'DollarSign', label: 'Dollar Sign' },
  { value: 'Calendar', label: 'Calendar' },
  { value: 'Bell', label: 'Bell' },
  { value: 'Bookmark', label: 'Bookmark' },
  { value: 'Camera', label: 'Camera' },
  { value: 'Code', label: 'Code' }
];
function hydrate(p) {
  return {
    ...EMPTY(),
    ...p,
    bullets: Array.isArray(p.bullets) ? p.bullets : [],
    productDetails: p?.productDetails || EMPTY().productDetails,
    howItWorksSection: p?.howItWorksSection || EMPTY().howItWorksSection,
    ctas: p?.ctas || EMPTY().ctas,
    howItWorks: p?.howItWorks || { heading: '', intro: '' },
  };
}
function toMenuOptions(result) {
  if (!result) return [];
  if (Array.isArray(result)) return result.map(m => ({ value: (m.name || '').toLowerCase().replace(/\s+/g, '-'), label: m.name }));
  return Object.keys(result).map(k => ({ value: k.toLowerCase().replace(/\s+/g, '-'), label: k }));
}

/* ------- same resolver utils as details page ------- */
async function resolveProductByAnyKey(param) {
  const id = decodeURIComponent(String(param || ''));

  // 1) Try direct by id
  try {
    const r = await fetch(`/api/products?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
    const j = await r.json();
    if (j?.success && j?.result) {
      const found = pickFromResult(j.result, id);
      if (found) return found;
    }
  } catch { }

  // 2) If param looks like category::slug, search by those
  if (id.includes('::')) {
    const [category, slug] = id.split('::');
    const p = await findInAll((x) => x.category === category && x.slug === slug);
    if (p) return p;
  }

  // 3) Fallback: scan all and match by _id | id | slug
  return findInAll((x) => x._id === id || x.id === id || x.slug === id);
}
async function findInAll(predicate) {
  try {
    const all = await fetch('/api/products', { cache: 'no-store' }).then((r) => r.json());
    const flat = toFlatArray(all?.result);
    return flat.find(predicate) || null;
  } catch {
    return null;
  }
}
function toFlatArray(result) {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  const out = [];
  Object.entries(result).forEach(([category, group]) => {
    Object.entries(group || {}).forEach(([slug, product]) => {
      out.push({ _id: product?._id, id: product?.id, category, slug, ...product });
    });
  });
  return out;
}
function pickFromResult(result, wantedId) {
  if (result && typeof result === 'object' && !Array.isArray(result) && (result._id || result.id)) return result;
  if (Array.isArray(result)) {
    return result.find((p) => p._id === wantedId || p.id === wantedId || p.slug === wantedId) || null;
  }
  if (typeof result === 'object' && result) {
    for (const [category, group] of Object.entries(result)) {
      for (const [slug, product] of Object.entries(group || {})) {
        if (product?._id === wantedId || product?.id === wantedId || slug === wantedId) {
          return { category, slug, ...product };
        }
      }
    }
  }
  return null;
}

function slugify(s = '') {
  return s
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}
