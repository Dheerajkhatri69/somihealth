"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/hero/Navbar";
import SomiFooter from "@/components/hero/SomiFooter";
import { Skeleton } from "@/components/ui/skeleton"; // ⬅ shadcn skeleton import

// Renderer stays same
function Block({ block }) {
  switch (block.type) {
    case "heading":
      return (
        <h1 className="text-3xl text-secondary my-4 font-SofiaSans font-bold">
          {block.text}
        </h1>
      );

    case "subheading":
      return (
        <h2 className="mt-6 text-xl font-SofiaSans font-semibold">
          {block.text}
        </h2>
      );

    case "paragraph": {
      const html = block.text.replace(
        /\*\*(.+?)\*\*/g,
        (_, boldText) => `<strong>${boldText}</strong>`
      );
      return (
        <p
          className="mt-4 leading-relaxed text-gray-500 font-SofiaSans"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    case "list":
      return (
        <ul className="mt-4 list-disc space-y-1 pl-6 text-gray-500 font-SofiaSans">
          {block.items?.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      );

    default:
      return null;
  }
}

// 🟦 Skeleton Loader Component
function FooterSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 space-y-6">
      {/* Skeleton Heading */}
      <Skeleton className="h-8 w-1/3" />

      {/* Skeleton Paragraph */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      {/* Skeleton Subheading */}
      <Skeleton className="h-6 w-1/4 mt-10" />

      {/* Skeleton Paragraph #2 */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-4 w-3/6" />
      </div>

      {/* Skeleton List */}
      <div className="mt-6 space-y-2 pl-6">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export default function FooterPage({ params }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const res = await fetch(`/api/footer/${params.name}`);
      const data = await res.json();

      if (data.success) setPage(data.result);
    } catch (error) {
      console.error("Error fetching footer page content:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [params.name]);

  return (
    <>
      <Navbar />

      {/* 🟦 Use Skeleton instead of normal loading */}
      {loading && <FooterSkeleton />}

      {/* When data loaded */}
      {!loading && page && (
        <main className="mx-auto max-w-7xl px-4 py-12">
          {page.blocks?.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </main>
      )}

      {!loading && !page && (
        <p className="p-8 text-center text-gray-500">Page not found.</p>
      )}

      <SomiFooter />
    </>
  );
}
