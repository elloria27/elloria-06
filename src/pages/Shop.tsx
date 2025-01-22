import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ShopHero } from "@/components/shop/ShopHero";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { useState } from "react";
import { products } from "@/components/ProductCarousel";
import { CartProvider } from "@/contexts/CartContext";

export type SortOption = "featured" | "price-low" | "price-high" | "newest";
export type FilterOption = "all" | "ultra-thin" | "maxi" | "overnight";

export default function Shop() {
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  
  const filteredProducts = products.filter(product => {
    if (filterBy === "all") return true;
    return (
      product.features.some(feature => 
        feature.toLowerCase().includes(filterBy)
      ) ||
      product.specifications.features.toLowerCase().includes(filterBy)
    );
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "newest":
        return new Date(b.id).getTime() - new Date(a.id).getTime();
      default:
        return 0;
    }
  });

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <Header />
        <ShopHero />
        
        <main className="container mx-auto px-4 py-12">
          <ShopFilters 
            sortBy={sortBy}
            filterBy={filterBy}
            onSortChange={setSortBy}
            onFilterChange={setFilterBy}
          />
          <ProductGrid products={sortedProducts} />
        </main>
        
        <Footer />
      </div>
    </CartProvider>
  );
}