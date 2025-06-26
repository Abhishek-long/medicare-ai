"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// =================================================================================
// DATA & TYPES
// =================================================================================

interface Scheme {
    title: string;
    category: "General" | "Medicines" | "Children" | "Digital" | "Women";
    icon: string;
    description: string;
    link: string;
}

const schemes: Scheme[] = [
  { title: "Ayushman Bharat (PM-JAY)", category: "General", icon: "🏥", description: "Provides health coverage of ₹5 lakh per family per year for poor and vulnerable families.", link: "https://pmjay.gov.in" },
  { title: "Jan Aushadhi Yojana (PMBJP)", category: "Medicines", icon: "💊", description: "Offers quality generic medicines at affordable prices through Jan Aushadhi Kendras.", link: "https://janaushadhi.gov.in" },
  { title: "Mission Indradhanush", category: "Children", icon: "🧒", description: "Aims to immunize all children under 2 years and pregnant women against preventable diseases.", link: "https://nhm.gov.in" },
  { title: "Ayushman Bharat Digital Mission", category: "Digital", icon: "💻", description: "Creating a digital health ecosystem with unique health IDs and interoperable records.", link: "https://ndhm.gov.in" },
  { title: "Rashtriya Bal Swasthya Karyakram", category: "Children", icon: "👶", description: "Early identification and intervention for defects, diseases, and deficiencies in children.", link: "https://rbsk.gov.in" },
  { title: "Pradhan Mantri Surakshit Matritva Abhiyan", category: "Women", icon: "👩‍⚕️", description: "Provides free, comprehensive antenatal care to all pregnant women on the 9th of every month.", link: "https://pmsma.nhp.gov.in" },
  { title: "Mera Aspataal (My Hospital)", category: "General", icon: "📣", description: "A patient feedback platform to capture experiences in public health facilities.", link: "https://meraaspataal.gov.in" }
];

const categories = ["All", "General", "Women", "Children", "Medicines", "Digital"] as const;
type Category = typeof categories[number];

// Custom hook to debounce user input
function useDebounce(value: string, delay: number): string {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

// =================================================================================
// UI COMPONENTS
// =================================================================================

const SchemeCard = ({ scheme }: { scheme: Scheme }) => {
    const [rotate, setRotate] = useState({ x: 0, y: 0 });
    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY, currentTarget } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const x = (clientX - left) / width - 0.5;
        const y = (clientY - top) / height - 0.5;
        setRotate({ x: -y * 15, y: x * 15 });
    };
    const onMouseLeave = () => setRotate({ x: 0, y: 0 });

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="h-full"
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
        >
            <motion.div
                style={{ transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)` }}
                className="transition-transform duration-300 ease-out h-full"
            >
                <Card className="h-full flex flex-col bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-800/50 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <span className="text-4xl">{scheme.icon}</span>
                            <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">{scheme.title}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow">
                        <CardDescription className="flex-grow text-base">{scheme.description}</CardDescription>
                        <Button
                            asChild
                            variant="secondary"
                            className="mt-6 w-full group transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                        >
                            <a href={scheme.link} target="_blank" rel="noopener noreferrer">
                                Learn More <ChevronRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};

// =================================================================================
// MAIN PAGE COMPONENT
// =================================================================================

const MedicalSchemesPage = () => {
    const [selectedCategory, setSelectedCategory] = useState<Category>("All");
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filteredSchemes = useMemo(() => {
        return schemes.filter((s) => {
            const matchesCategory = selectedCategory === "All" || s.category === selectedCategory;
            const matchesSearch =
                s.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                s.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, debouncedSearchTerm]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] -z-10" />
            <Header />

            <main className="max-w-6xl mx-auto px-4 py-12 md:py-20">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-slate-600 dark:to-slate-400">
                        Government Health Schemes
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                        An overview of key healthcare initiatives by the Government of India to make quality care accessible and affordable for all citizens.
                    </p>
                </motion.div>

                {/* Filter & Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="sticky top-20 z-30"
                >
                    <Card className="p-4 bg-background/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl shadow-slate-300/10 dark:shadow-black/20">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative w-full md:w-1/3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search schemes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-12 text-base"
                                />
                            </div>
                            <div className="flex-grow flex flex-wrap justify-center gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className="relative px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300"
                                    >
                                        {selectedCategory === cat && (
                                            <motion.div
                                                layoutId="activeCategory"
                                                className="absolute inset-0 bg-primary rounded-full"
                                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                            />
                                        )}
                                        <span className={`relative z-10 ${selectedCategory === cat ? 'text-primary-foreground' : 'text-foreground'}`}>
                                            {cat}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Scheme cards */}
                <div className="mt-12">
                    <AnimatePresence>
                        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredSchemes.length > 0 ? (
                                filteredSchemes.map((scheme) => (
                                    <SchemeCard key={scheme.title} scheme={scheme} />
                                ))
                            ) : (
                                <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-20 px-6 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                                    <h3 className="text-2xl font-semibold">No Schemes Found</h3>
                                    <p className="text-muted-foreground mt-2">Try adjusting your search or filter criteria.</p>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default MedicalSchemesPage;