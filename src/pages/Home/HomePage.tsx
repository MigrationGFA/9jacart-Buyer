import FlashSales from "@/components/HomePage/FlashSales";
import HeroSection from "@/components/HomePage/HeroSection";
import FeaturedProducts from "@/components/HomePage/FeaturedProducts";
import LiveProducts from "@/components/HomePage/LiveProducts";
import CategoryShowcase from "@/components/HomePage/CategoryShowcase";
// import Newsletter from "@/components/HomePage/Newsletter";
import React from "react";

const HomePage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Flash Sales Section */}
      <FlashSales />

      {/* Category Showcase */}
      <CategoryShowcase />

      {/* Featured Products (Mock Data) */}
      <FeaturedProducts />

      {/* Live Products (Real API Data) */}
      <LiveProducts />

      {/* Newsletter Subscription */}
      {/* <Newsletter /> */}
    </div>
  );
};

export default HomePage;
