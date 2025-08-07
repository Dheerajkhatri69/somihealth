// app/underdevelopmentmainpage/footer/[name]/page.jsx
import Navbar from "@/components/hero/Navbar";
import SomiFooter from "@/components/hero/SomiFooter";
import { footerPages } from "@/lib/footerContent";
import { notFound } from "next/navigation";

// 1️ Tell Next which pages to pre-generate
export async function generateStaticParams() {
    return footerPages.map((p) => ({ name: p.name }));
}

// 2 Very small renderer for our block format
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
      // Replace **something** with <strong>something</strong>
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
          {block.items.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      );

    default:
      return null;
  }
}
export default function FooterPage({ params }) {
    const page = footerPages.find((p) => p.name === params.name);
    if (!page) return notFound();

    return (
        <>
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-12">
                {page.blocks.map((b, i) => (
                    <Block key={i} block={b} />
                ))}
            </main>
            <SomiFooter />
        </>
    );
}
