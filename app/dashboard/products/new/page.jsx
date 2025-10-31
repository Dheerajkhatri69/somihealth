'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import UploadMediaLite from '@/components/UploadMediaLite';
import toast, { Toaster } from 'react-hot-toast';
import { slugifyId as slugify } from '@/lib/slugify';

// ---------- helpers (single definitions) ----------
// function toMenuOptions(result) {
//   if (!result) return [];
//   if (Array.isArray(result)) return result.map(m => ({ value: (m.name || '').toLowerCase().replace(/\s+/g, '-'), label: m.name }));
//   return Object.keys(result).map(k => ({ value: k.toLowerCase().replace(/\s+/g, '-'), label: k }));
// }
function toMenuOptions(result) {
  if (!result) return [];
  const arr = Array.isArray(result) ? result : Object.values(result || {});
  return arr.map(m => ({
    value: (m.slug && String(m.slug)) || slugify(String(m.name || '')),
    label: m.name || m.slug || ''
  }));
}
// function slugify(s = '') {
//   return s
//     .toString()
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9]+/g, '-')
//     .replace(/^-+|-+$/g, '')
//     .replace(/-+/g, '-');
// }

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

// ---------- component ----------
export default function NewProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(EMPTY());
  const [menus, setMenus] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const m = await fetch('/api/menus', { cache: 'no-store' }).then(r => r.json());
        setMenus(toMenuOptions(m?.result));
      } catch (e) {
        console.error(e);
        toast.error('Failed to load menus');
      }
    })();
  }, []);

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


  function handleImageUpload(_, url) {
    setFormData(p => ({ ...p, heroImage: url }));
  }

  async function save(e) {
    e?.preventDefault?.();
    if (!formData.label || !formData.shortLabel || !formData.category || !formData.heroImage || !formData.unit) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...formData, slug: slugify(formData.label) };
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!j?.success) throw new Error(j?.message || 'Create failed');
      toast.success('Product created');
      router.push('/dashboard/products');
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Error creating product');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full mx-auto p-6">
      <Toaster position="top-right" />
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
          <ArrowLeft size={16} /> Back to list
        </Link>
      </div>

      <form onSubmit={save} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Add New Product</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Category / Slug / Sort */}
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

          {/* Labels */}
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

          {/* Switches */}
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

          {/* Price / Unit / RatingLabel */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Price *</Label>
              <Input type="number" step="0.01" min="0" value={formData.price} onChange={(e) => handleInputChange('price', Number(e.target.value))} className="mt-1" required />
            </div>
            <div>
              <Label className="text-sm font-medium">Unit *</Label>
              <Input value={formData.unit} onChange={(e) => handleInputChange('unit', e.target.value)} className="mt-1" required />
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

          {/* Hero image */}
          <div>
            <Label className="text-sm font-medium">Hero Image *</Label>
            <div className="mt-1">
              <UploadMediaLite onUploadComplete={(url) => handleImageUpload('heroImage', url)} onDelete={() => handleInputChange('heroImage', '')} file={formData.heroImage} />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium">Description *</Label>
            <textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-2" rows={4} required />
          </div>

          {/* Trustpilot */}
          <div>
            <Label className="text-sm font-medium">Trustpilot URL</Label>
            <Input value={formData.trustpilot} onChange={(e) => handleInputChange('trustpilot', e.target.value)} className="mt-1" placeholder="https://trustpilot.com/reviews/..." />
          </div>

          {/* CTAs */}
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
                    />   </div>
                  <div>
                    <Label className="text-sm">Button Link</Label>
                    <Input
                      value={formData.ctas?.primary?.href || ''}
                      onChange={(e) => handleInputChange('ctas.primary.href', e.target.value)}
                    /> </div>
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

          {/* Product Details */}
          <div className="border-t pt-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Product Details Section</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <Input value={formData.productDetails?.title || ''} onChange={e => handleInputChange('productDetails.title', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium">Intro Title</Label>
                <Input value={formData.productDetails?.introTitle || ''} onChange={e => handleInputChange('productDetails.introTitle', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium">Introduction Text</Label>
                <textarea value={formData.productDetails?.intro || ''} onChange={e => handleInputChange('productDetails.intro', e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-2" rows={3} />
              </div>
              <div>
                <Label className="text-sm font-medium">Breakdown Heading</Label>
                <Input value={formData.productDetails?.breakdownHeading || ''} onChange={e => handleInputChange('productDetails.breakdownHeading', e.target.value)} className="mt-1" />
              </div>

              {/* Ingredients */}
              <div>
                <Label className="text-sm font-medium">Ingredients</Label>
                {(formData.productDetails?.ingredients || []).map((ingredient, i) => (
                  <div key={i} className="flex flex-col md:flex-row gap-2 mb-2">
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
                      className="flex-1 mt-1"
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
                      className="flex-1 mt-1"
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
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
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
                  className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
                >
                  Add Ingredient
                </button>
              </div>

              {/* Benefits */}
              <div>
                <Label className="text-sm font-medium">Benefits</Label>
                {(formData.productDetails?.benefits || []).map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <Input
                      value={benefit}
                      onChange={e => {
                        const newBenefits = [...(formData.productDetails.benefits || [])];
                        newBenefits[i] = e.target.value;
                        setFormData(prev => ({ ...prev, productDetails: { ...prev.productDetails, benefits: newBenefits } }));
                      }}
                      className="flex-1 mt-1"
                      placeholder="e.g., Improves health, Boosts energy"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newBenefits = [...(formData.productDetails.benefits || [])];
                        newBenefits.splice(i, 1);
                        setFormData(prev => ({ ...prev, productDetails: { ...prev.productDetails, benefits: newBenefits } }));
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      productDetails: {
                        ...prev.productDetails,
                        benefits: [...(prev.productDetails.benefits || []), '']
                      }
                    }));
                  }}
                  className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
                >
                  Add Benefit
                </button>
              </div>

              <div>
                <Label className="text-sm font-medium">Expectations Heading</Label>
                <Input value={formData.productDetails?.expectationsHeading || ''} onChange={e => handleInputChange('productDetails.expectationsHeading', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium">Expectations Text</Label>
                <textarea value={formData.productDetails?.expectations || ''} onChange={e => handleInputChange('productDetails.expectations', e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-2" rows={3} />
              </div>
              <div>
                <Label className="text-sm font-medium">Footnote</Label>
                <Input value={formData.productDetails?.footnote || ''} onChange={e => handleInputChange('productDetails.footnote', e.target.value)} className="mt-1" />
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="border-t pt-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">How It Works Section</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <Input value={formData.howItWorksSection?.title || ''} onChange={e => handleInputChange('howItWorksSection.title', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium">Steps</Label>
                {(formData.howItWorksSection?.steps || []).map((step, i) => (
                  <div key={i} className="flex flex-col md:flex-row gap-2 mb-2">
                    <Input
                      type="number"
                      min={1}
                      value={step.number ?? i + 1}
                      onChange={e => {
                        const newSteps = [...(formData.howItWorksSection.steps || [])];
                        newSteps[i] = { ...newSteps[i], number: Number(e.target.value) };
                        setFormData(prev => ({
                          ...prev,
                          howItWorksSection: { ...prev.howItWorksSection, steps: newSteps }
                        }));
                      }}
                      className="w-20 mt-1"
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
                      className="flex-1 mt-1"
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
                      className="flex-1 mt-1"
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
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
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
                  className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
                >
                  Add Step
                </button>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-2">
              <Switch id="is-active" checked={!!formData.isActive} onCheckedChange={(v) => handleInputChange('isActive', v)} />
              <Label htmlFor="is-active" className="text-sm">Product is Active</Label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <Link href="/dashboard/websitehome/products" className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-white hover:bg-secondary/90 disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
