"use client";

// All necessary imports from both versions
import { Mic, Brain, MapPin, FileText, Users, Activity, ChevronRight, Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { TypeAnimation } from 'react-type-animation';

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Lazy-loaded sections
const Header = dynamic(() => import("@/components/Header"), { ssr: false, loading: () => <div className="h-20" /> });
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });

// =================================================================================
// REUSABLE COMPONENTS
// =================================================================================
const GridBackground = () => (
    <div className="absolute inset-0 -z-10 h-full w-full bg-slate-50 dark:bg-slate-950">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_36px] opacity-50"></div>
    </div>
);


// =================================================================================
// PAGE SECTIONS (FINALIZED VERSION)
// =================================================================================

const HeroSection = () => {
    const router = useRouter();
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-gray-900">
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(12,129,255,0.1),rgba(255,255,255,0))]"></div>
            </div>
            <div className="container mx-auto px-4 text-center z-10">
                <motion.div
                    animate={{ scale: [1, 1.05, 1], transition: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
                    className="relative inline-block mb-8 p-4 bg-white/50 dark:bg-blue-950/20 rounded-full shadow-lg"
                >
                     <div className="p-5 bg-primary/10 rounded-full">
                        <Brain className="w-12 h-12 text-primary" />
                     </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="max-w-4xl mx-auto">
                    <h1 className="leading-snug md:leading-tight text-4xl md:text-7xl font-extrabold tracking-tighter text-slate-900 dark:text-white pt-6 pb-6">
                        Your Health,<br />
                        <TypeAnimation sequence={['intelligent.', 2000, 'integrated.', 2000, 'always with you.', 2000]} wrapper="span" speed={50} className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-500 mt-2" repeat={Infinity} />
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300">
                        Experience the future of healthcare with our AI-powered platform designed to make medical care more accessible and efficient.
                    </p>
                    <motion.div whileHover={{ scale: 1.05, transition: { type: 'spring', stiffness: 300 } }} className="mt-10">
                        <Button size="lg" className="text-lg py-7 px-8 shadow-lg hover:shadow-xl transition-all" onClick={() => router.push('/speech-analysis')}>
                            Start AI Analysis <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

const FeaturesGridSection = () => {
    const router = useRouter();
    const features = [
        { icon: <Mic className="w-8 h-8 text-blue-500" />, title: "AI Medical Diagnosis", description: "Describe your symptoms using voice for instant AI analysis and insights.", path: "/speech-analysis", buttonLabel: "Try Now" },
        { icon: <Brain className="w-8 h-8 text-purple-500" />, title: "AI Report Analysis", description: "Upload medical reports to get intelligent summaries and explanations.", path: "/ai-analysis", buttonLabel: "Analyze Report" },
        { icon: <MapPin className="w-8 h-8 text-green-500" />, title: "Find Nearby Care", description: "Locate verified hospitals and doctors with ratings and reviews.", path: "/find-care", buttonLabel: "Find Now" },
        { icon: <FileText className="w-8 h-8 text-orange-500" />, title: "Digital Medical Records", description: "Securely store and manage your entire medical history in one place.", path: "/medical-records", buttonLabel: "View Records" },
        { icon: <Users className="w-8 h-8 text-red-500" />, title: "Doctor Directory", description: "Browse a directory of qualified healthcare professionals by specialty.", path: "/doctor-directory", buttonLabel: "Browse Doctors" },
        { icon: <Activity className="w-8 h-8 text-teal-500" />, title: "Health Monitoring", description: "Track your health metrics and receive personalized wellness insights.", path: "/health-monitoring", buttonLabel: "Start Tracking" },
    ];

    return (
        <section className="py-24 relative bg-white dark:bg-slate-900">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-foreground mb-4">Comprehensive Healthcare Solutions</h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        One platform for all your health needs. Powered by AI, designed for you.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="flex flex-col p-8 bg-background rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                        >
                            <div className="flex-shrink-0">{feature.icon}</div>
                            <h3 className="text-xl font-bold my-4">{feature.title}</h3>
                            <p className="text-muted-foreground flex-grow">{feature.description}</p>
                            <Button className="mt-6 w-full" variant="secondary" onClick={() => router.push(feature.path)}>
                                {feature.buttonLabel} <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const FaqSection = () => {
    const [openAccordion, setOpenAccordion] = useState<number | null>(0);
    const faqs = [
        { q: "How accurate is the AI medical diagnosis?", a: "Our AI provides preliminary analysis based on your symptoms and medical reports using advanced models. However, it is not a substitute for professional medical advice. Always consult a qualified healthcare provider for a definitive diagnosis and treatment." },
        { q: "Is my data secure and private?", a: "Yes, your data is end-to-end encrypted and stored securely. We follow strict HIPAA-compliant privacy protocols and do not share your information without your explicit consent." },
        { q: "Can I use the platform in my local language?", a: "Absolutely! Our platform supports multiple Indian languages for both voice and text input, making healthcare accessible to everyone." },
        { q: "How do I find nearby doctors or hospitals?", a: "Use the 'Find Nearby Care' feature to locate hospitals and doctors in your area, complete with ratings, reviews, and contact options." },
        { q: "Is this service free?", a: "Most features, like symptom analysis and record storage, are free. Some advanced services or premium consultations may have minimal charges, which will be clearly communicated beforehand." },
    ];

    return (
        <section className="py-24 relative bg-white dark:bg-slate-900">
            <div className="container mx-auto px-4 max-w-4xl">
                <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border-b dark:border-slate-800">
                            <button onClick={() => setOpenAccordion(openAccordion === index ? null : index)} className="flex justify-between items-center w-full py-5 text-left">
                                <span className="text-lg font-semibold">{faq.q}</span>
                                {openAccordion === index ? <Minus className="text-primary"/> : <Plus className="text-muted-foreground"/>}
                            </button>
                            <AnimatePresence>
                                {openAccordion === index && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                                        <p className="pb-5 pr-8 text-muted-foreground">{faq.a}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const TestimonialColumn = ({ testimonials, duration = "40s" }: { testimonials: any[], duration?: string }) => ( <div className="flex flex-col gap-4 animate-scroll" style={{ animationDuration: duration }}> {[...testimonials, ...testimonials].map((t, i) => ( <Card key={i} className="flex-shrink-0 w-80 p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50"> <p className="italic">"{t.quote}"</p> <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border"> <Avatar><AvatarImage src={t.avatar} alt={t.name} /><AvatarFallback>{t.name.charAt(0)}</AvatarFallback></Avatar> <div><p className="font-semibold">{t.name}</p><p className="text-sm text-muted-foreground">{t.role}</p></div> </div> </Card> ))} </div> );
const TestimonialsSection = () => {
    const testimonials1 = [ { name: "Priya S.", role: "Software Engineer", quote: "The AI symptom analysis gave me peace of mind and pointed me to the right specialist. A game-changer!", avatar: "https://i.pravatar.cc/150?u=Priya" }, { name: "Amit K.", role: "Marketing Manager", quote: "Managing my parents' medical records used to be a nightmare. This platform has made it incredibly simple.", avatar: "https://i.pravatar.cc/150?u=Amit" }, ];
    const testimonials2 = [ { name: "Sunita R.", role: "Teacher", quote: "Finding a reliable pediatrician nearby was so easy. The detailed information helped me make a confident choice.", avatar: "https://i.pravatar.cc/150?u=Sunita" }, { name: "Rajesh V.", role: "Accountant", quote: "The health monitoring feature is fantastic. It helps me keep track of my vitals and stay proactive about my health.", avatar: "https://i.pravatar.cc/150?u=Rajesh" }, ];
    const testimonials3 = [ { name: "Ananya G.", role: "Student", quote: "Uploading my lab reports and getting an easy-to-read summary saved me so much confusion. Highly recommend!", avatar: "https://i.pravatar.cc/150?u=Ananya" }, { name: "Vikram M.", role: "Architect", quote: "A beautifully designed and incredibly useful tool. It feels like the future of personal health management.", avatar: "https://i.pravatar.cc/150?u=Vikram" }, ];
    useEffect(() => { const styleEl = document.createElement("style"); styleEl.innerHTML = ` @keyframes scroll { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } } .animate-scroll { animation: scroll linear infinite; } `; document.head.appendChild(styleEl); return () => document.head.removeChild(styleEl); }, []);
    return ( <section className="py-24 relative overflow-hidden"> <GridBackground /> <div className="container mx-auto px-4 text-center mb-16"> <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Trusted by Patients Nationwide</h2> <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">See what our users are saying about their experience.</p> </div> <div className="relative flex justify-center gap-4 h-[600px] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]"> <TestimonialColumn testimonials={testimonials1} duration="30s" /> <TestimonialColumn testimonials={testimonials2} duration="45s" /> <TestimonialColumn testimonials={testimonials3} duration="35s" /> </div> </section> );
};

const CtaSection = () => (
    <section className="py-24 relative bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: 'easeOut' }} className="bg-gradient-to-br from-blue-600 to-indigo-700 text-primary-foreground p-12 rounded-3xl shadow-2xl shadow-blue-500/20">
                <h2 className="text-4xl font-bold">Ready to Take Control of Your Health?</h2>
                <p className="text-blue-200 mt-4 max-w-xl mx-auto">Create your free, secure account to access AI insights, manage your health records, and connect with trusted professionals today.</p>
                <motion.div whileHover={{ scale: 1.05, transition: { type: 'spring', stiffness: 300 } }} className="mt-8 inline-block">
                    <Button size="lg" variant="secondary" className="text-lg py-7 px-8 shadow-lg" onClick={() => (window.location.href = '/sign-up')}>
                        Sign Up for Free <ChevronRight className="w-5 h-5 ml-2"/>
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    </section>
);

// =================================================================================
// MAIN HOME PAGE COMPONENT
// =================================================================================
const Home = () => {
    return (
        <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
            <Suspense fallback={<div className="h-20" />}> <Header /> </Suspense>
            <main>
                <HeroSection />
                <FeaturesGridSection />
                <TestimonialsSection />
                <FaqSection />
                <CtaSection />
            </main>
            <Suspense fallback={<div />}> <Footer /> </Suspense>
        </div>
    );
};

export default Home;