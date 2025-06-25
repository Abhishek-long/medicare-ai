"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // if you don't have this, replace with <input />

const schemes = [
  {
    title: "Ayushman Bharat (PM-JAY)",
    category: "General",
    icon: "🏥",
    description:
      "Provides health coverage of ₹5 lakh per family per year for poor and vulnerable families.",
    link: "https://pmjay.gov.in"
  },
  {
    title: "Pradhan Mantri Jan Aushadhi Yojana",
    category: "Medicines",
    icon: "💊",
    description:
      "Offers quality generic medicines at affordable prices through Jan Aushadhi Kendras.",
    link: "https://janaushadhi.gov.in"
  },
  {
    title: "Mission Indradhanush",
    category: "Children",
    icon: "🧒",
    description:
      "Immunization program for children under 2 years and pregnant women.",
    link: "https://nhm.gov.in"
  },
  {
    title: "National Digital Health Mission (NDHM)",
    category: "Digital",
    icon: "💻",
    description:
      "Digital health IDs and medical records for seamless healthcare access.",
    link: "https://ndhm.gov.in"
  },
  {
    title: "Rashtriya Bal Swasthya Karyakram (RBSK)",
    category: "Children",
    icon: "🧒",
    description:
      "Free detection and treatment of defects and diseases in children.",
    link: "https://rbsk.gov.in"
  },
  {
    title: "PMSMA (Safe Motherhood Program)",
    category: "Women",
    icon: "👩‍⚕️",
    description:
      "Free antenatal care for pregnant women on the 9th of every month.",
    link: "https://pmsma.nhp.gov.in"
  },
  {
    title: "Mera Aspataal (My Hospital)",
    category: "General",
    icon: "📣",
    description:
      "A platform for citizens to share feedback on hospital services.",
    link: "https://meraaspataal.gov.in"
  }
];

const categories = [
  { label: "All", emoji: "🌐" },
  { label: "General", emoji: "🏥" },
  { label: "Women", emoji: "👩" },
  { label: "Children", emoji: "🧒" },
  { label: "Medicines", emoji: "💊" },
  { label: "Digital", emoji: "💻" }
];

const MedicalSchemesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSchemes = schemes.filter((s) => {
    const matchesCategory =
      selectedCategory === "All" || s.category === selectedCategory;
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold text-center mb-8">
          Government Health Schemes in Bharat
        </h1>

        {/* Search input */}
        <div className="mb-6 text-center">
          <input
            type="text"
            placeholder="Search schemes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md mx-auto px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        {/* Category filter buttons */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(cat.label)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedCategory === cat.label
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-blue-100"
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Scheme cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSchemes.length === 0 ? (
            <p className="text-center col-span-2 text-gray-500">
              No schemes found for your search.
            </p>
          ) : (
            filteredSchemes.map((scheme, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {scheme.icon} {scheme.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm">{scheme.description}</p>
                  <a
                    href={scheme.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    Learn more →
                  </a>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MedicalSchemesPage;
