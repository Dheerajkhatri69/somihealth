'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, GripVertical } from 'lucide-react';

export default function MenusIndexPage() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [dragIndex, setDragIndex] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => { fetchMenus(); }, []);

  async function fetchMenus() {
    setLoading(true);
    try {
      const res = await fetch('/api/menus', { cache: 'no-store' });
      const data = await res.json();

      if (data?.success) {
        // Data is now returned as an array from API, already sorted by sortOrder
        const arr = Array.isArray(data.result) ? data.result : [];
        setMenus(arr);
      } else {
        setMenus([]);
      }
    } catch {
      setMenus([]);
    } finally {
      setLoading(false);
    }
  }

  function onDragStart(e, index) {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }
  function onDragOver(e, index) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }
  async function onDrop(e, index) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const next = [...menus];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setMenus(next);
    setDragIndex(null);
    await persistOrder(next);
  }
  function onDragEnd() {
    setDragIndex(null);
  }

  async function persistOrder(arr) {
    try {
      setSavingOrder(true);
      const updates = arr.map((m, i) => ({ _id: m._id, slug: m.slug, name: m.name, sortOrder: i }));
      
      const res = await fetch('/api/menus', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      
      const j = await res.json().catch(() => ({}));
      
      if (!res.ok || j?.success === false) throw new Error(j?.message || 'Failed to save order');
      
      // Refresh the menus list to get updated sort orders
      await fetchMenus();
    } catch (err) {
      console.error(err);
      alert('Failed to save new order.');
    } finally {
      setSavingOrder(false);
    }
  }

  const filtered = useMemo(() => {
    if (!q.trim()) return menus;
    const needle = q.trim().toLowerCase();
    return menus.filter((m) => (m.name || '').toLowerCase().includes(needle));
  }, [menus, q]);

  return (
    <div className="p-4">
      <section className="w-full md:pr-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Menus</h1>
            <p className="text-sm text-gray-500">Pick a menu to view full details or create a new one.</p>
          </div>
          <Link
            href="/dashboard/websitehome/menus/new"
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-white hover:bg-secondary/80"
          >
            <Plus size={18} />
            New
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border-l-4 border border-gray-200 border-l-secondary bg-white shadow-md">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">All Menus</span>
            <span className="ml-auto text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
              {filtered.length}
            </span>
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name…"
                className="h-9 w-48 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* search icon */}
              <svg
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path d="M21 21l-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* List (drag to reorder) */}
          {loading ? (
            <ul className="divide-y divide-gray-100">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="px-5 py-3">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
                </li>
              ))}
            </ul>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">
              {q ? 'No menus match your search.' : 'No menus found. Create your first one.'}
            </div>
          ) : (
            <>
              {savingOrder && (
                <div className="px-5 py-2 text-xs text-gray-500">Saving order…</div>
              )}
              <ul className="divide-y divide-gray-100">
                {filtered.map((m, idx) => {
                  const id = m._id || m.name;
                  return (
                    <li
                      key={id}
                      onDragOver={(e) => onDragOver(e, idx)}
                      onDrop={(e) => onDrop(e, idx)}
                    >
                      <div className="group flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                        <div
                          draggable
                          onDragStart={(e) => onDragStart(e, idx)}
                          onDragEnd={onDragEnd}
                          className="mr-3 -ml-1 flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                          title="Drag to reorder"
                          aria-label="Drag handle"
                        >
                          <GripVertical size={16} />
                        </div>
                        <Link
                          href={`/dashboard/websitehome/menus/${encodeURIComponent(id)}`}
                          className="flex-1 min-w-0 group flex items-center justify-between"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-medium text-gray-900">{m.name}</span>
                              {m.showInNavbar ? (
                                <span className="rounded-md bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700 ring-1 ring-inset ring-green-200">Navbar</span>
                              ) : (
                                <span className="rounded-md bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 ring-1 ring-inset ring-gray-200">Hidden</span>
                              )}
                              {m.type && (
                                <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-inset ring-blue-200">{m.type}</span>
                              )}
                            </div>
                            {m.discover?.label && m.discover?.href && (
                              <p className="mt-0.5 truncate text-xs text-gray-500">Discover: {m.discover.label} → {m.discover.href}</p>
                            )}
                          </div>
                          <span className="inline-flex items-center gap-1 text-sm text-gray-500 group-hover:text-gray-700">
                            <Eye size={16} />
                            Details
                          </span>
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
