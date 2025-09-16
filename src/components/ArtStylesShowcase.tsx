import React, { useState } from "react";
// FIX: lucide-react does not include a Pinterest brand icon on some versions/CDN builds.
// Replace { Pinterest } with the generic { Pin } icon to avoid build failures.
import { Facebook, Twitter, Linkedin, Link2, Pin } from "lucide-react";

// Using images from the Home page First Row
// const IMAGE_SETS: Record<string, string[]> = {
//   Illustration: [
//     "/lovable-uploads/ac8c5174-2398-43ea-8ede-9298108eb6cc.png",
//     "/lovable-uploads/414772d4-1bcb-4d32-a2a1-79efdc45cdca.png",
//     "/lovable-uploads/3019963f-d795-4f70-a8a6-9e8a0f85c0ef.png",
//     "/lovable-uploads/9b776cf4-fad8-4955-a4a2-ccbbd1ce7a96.png",
//   ],
//   "Concept Art": [
//     "/lovable-uploads/ac8c5174-2398-43ea-8ede-9298108eb6cc.png",
//     "/lovable-uploads/414772d4-1bcb-4d32-a2a1-79efdc45cdca.png",
//     "/lovable-uploads/3019963f-d795-4f70-a8a6-9e8a0f85c0ef.png",
//     "/lovable-uploads/9b776cf4-fad8-4955-a4a2-ccbbd1ce7a96.png",
//   ],
//   "3D": [
//     "/lovable-uploads/ac8c5174-2398-43ea-8ede-9298108eb6cc.png",
//     "/lovable-uploads/414772d4-1bcb-4d32-a2a1-79efdc45cdca.png",
//     "/lovable-uploads/3019963f-d795-4f70-a8a6-9e8a0f85c0ef.png",
//     "/lovable-uploads/9b776cf4-fad8-4955-a4a2-ccbbd1ce7a96.png",
//   ],
//   "Cartoon": [
//     "/lovable-uploads/ac8c5174-2398-43ea-8ede-9298108eb6cc.png",
//     "/lovable-uploads/414772d4-1bcb-4d32-a2a1-79efdc45cdca.png",
//     "/lovable-uploads/3019963f-d795-4f70-a8a6-9e8a0f85c0ef.png",
//     "/lovable-uploads/9b776cf4-fad8-4955-a4a2-ccbbd1ce7a96.png",
//   ],
//   "Cyberpunk": [
//     "/lovable-uploads/ac8c5174-2398-43ea-8ede-9298108eb6cc.png",
//     "/lovable-uploads/414772d4-1bcb-4d32-a2a1-79efdc45cdca.png",
//     "/lovable-uploads/3019963f-d795-4f70-a8a6-9e8a0f85c0ef.png",
//     "/lovable-uploads/9b776cf4-fad8-4955-a4a2-ccbbd1ce7a96.png",
//   ],
//   "Oil Painting": [
//     "/lovable-uploads/ac8c5174-2398-43ea-8ede-9298108eb6cc.png",
//     "/lovable-uploads/414772d4-1bcb-4d32-a2a1-79efdc45cdca.png",
//     "/lovable-uploads/3019963f-d795-4f70-a8a6-9e8a0f85c0ef.png",
//     "/lovable-uploads/9b776cf4-fad8-4955-a4a2-ccbbd1ce7a96.png",
//   ],
// };

// Replace IMAGE_SETS with this:
const IMAGE_SETS: Record<string, string[]> = {
    "Pizza & Italian": [
      "/lovable-uploads/ac8c5174-2398-43ea-8ede-9298108eb6cc.png", // margherita
      "/lovable-uploads/414772d4-1bcb-4d32-a2a1-79efdc45cdca.png", // pasta
      "https://images.unsplash.com/photo-1516685018646-549198525c1b?q=80&w=1400&auto=format&fit=crop", // lasagna
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1400&auto=format&fit=crop"  // tiramisu
    ],
    "Seafood Rolls": [
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1400&auto=format&fit=crop", // lobster roll
      "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=1400&auto=format&fit=crop", // shrimp roll
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1400&auto=format&fit=crop", // dup OK until replaced
      "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=1400&auto=format&fit=crop"  // fish & chips
    ],
    "Ramen & Noodles": [
      "/lovable-uploads/3019963f-d795-4f70-a8a6-9e8a0f85c0ef.png", // ramen bowl
      "/lovable-uploads/9b776cf4-fad8-4955-a4a2-ccbbd1ce7a96.png", // udon
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1400&auto=format&fit=crop", // pho
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1400&auto=format&fit=crop"  // soba
    ],
    "Bowls & Salads": [
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=1400&auto=format&fit=crop", // poke
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1400&auto=format&fit=crop", // grain bowl
      "https://images.unsplash.com/photo-1551183053-8b5f5f1f9b04?q=80&w=1400&auto=format&fit=crop", // caesar
      "https://images.unsplash.com/photo-1522184216315-dc2f3f3b9f98?q=80&w=1400&auto=format&fit=crop"  // avocado salad
    ],
    "Desserts & Bakes": [
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1400&auto=format&fit=crop", // cookies
      "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=1400&auto=format&fit=crop", // cheesecake
      "https://images.unsplash.com/photo-1540126034813-121bf29033c8?q=80&w=1400&auto=format&fit=crop", // brownie
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1400&auto=format&fit=crop"  // cupcakes
    ],
    "Tacos & Wings": [
      "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?q=80&w=1400&auto=format&fit=crop", // tacos
      "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1400&auto=format&fit=crop", // wings
      "https://images.unsplash.com/photo-1541542684-4a1a72e1c8a3?q=80&w=1400&auto=format&fit=crop", // nachos
      "https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?q=80&w=1400&auto=format&fit=crop"  // quesadilla
    ]
  };
  

const TABS = Object.keys(IMAGE_SETS);

export default function ArtStylesShowcase() {
  const [tab, setTab] = useState<string>(TABS[0]);
  const images = IMAGE_SETS[tab] ?? [];
  

  return (
    <section className="relative w-full text-gray-900">
      <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Tabs */}
        <div className="flex items-center gap-6 overflow-x-auto pb-4 justify-center">
          {TABS.map((t) => {
            const active = t === tab;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={[
                  "whitespace-nowrap rounded-full px-4 sm:px-5 py-2 text-sm font-medium",
                  "transition-colors border",
                  active
                    ? "bg-primary/10 border-primary text-primary shadow-[0_0_0_2px_rgba(var(--primary),0.35)]"
                    : "border-gray-300 hover:text-primary text-gray-600 hover:bg-primary/5",
                ].join(" ")}
              >
                {t}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {images.map((src, i) => (
            <figure
              key={i}
              className="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200 shadow-lg"
            >
              <img
                src={src}
                alt={`${tab} example ${i + 1}`}
                className="h-[280px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
                decoding="async"
              />
              {/* Soft corner highlight like the reference */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-gray-200" />
            </figure>
          ))}
        </div>
      </div>

    </section>
  );
}