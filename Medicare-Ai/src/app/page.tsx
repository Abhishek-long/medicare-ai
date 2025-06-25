"use client"
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Brain, MapPin, FileText, Users, Activity } from "lucide-react"
import FeatureCard from "@/components/FeatureCard"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import Hero from "@/components/Hero"
import React from "react"
import Footer from "@/components/Footer"

const Home = () => {
  const navigate = useRouter()
  const features = [
    {
      icon: <Mic className="w-8 h-8 text-blue-600" />,
      title: "AI Based Medical Diagnose",
      description:
        "Describe your symptoms using voice commands for instant AI analysis",
      path: "/speech-analysis",
      buttonLabel: "Get Started",
    },
    {
      icon: <Brain className="w-8 h-8 text-purple-600" />,
      title: "AI Medical Reeport Analysis",
      description:
        "Get intelligent health insights and preliminary assessments",
      path: "/ai-analysis",
      buttonLabel: "Start",
    },
    {
      icon: <MapPin className="w-8 h-8 text-green-600" />,
      title: "Find Nearby Care",
      description:
        "Locate hospitals and doctors in your area with ratings and reviews",
      path: "/find-care",
      buttonLabel: "Find Now",
    },
    {
      icon: <FileText className="w-8 h-8 text-orange-600" />,
      title: "Medical Records",
      description:
        "Securely store and manage your medical history and documents",
      path: "/medical-records",
      buttonLabel: "Check",
    },
    {
      icon: <Users className="w-8 h-8 text-red-600" />,
      title: "Doctor Directory",
      description: "Browse qualified healthcare professionals by specialty",
      path: "/doctor-directory",
      buttonLabel: "Check",
    },
    {
      icon: <Activity className="w-8 h-8 text-teal-600" />,
      title: "Health Monitoring",
      description:
        "Track your health metrics and receive personalized insights",
      path: "/health-monitoring",
      buttonLabel: "Start",
    },
  ]

  return (
    <div>
      <Header />
      <Hero />

      {/* feature section  */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Comprehensive Healthcare Solutions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of healthcare with our AI-powered platform
            designed to make medical care more accessible and efficient.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              onClick={() => navigate.push(feature.path)}
              buttonLabel={feature.buttonLabel}
            />
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div className="bg-card rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg text-blue-700 mb-2">
              How accurate is the AI medical diagnosis?
            </h3>
            <p className="text-muted-foreground">
              Our AI provides preliminary analysis based on your symptoms and
              medical reports using advanced models. However, it is not a
              substitute for professional medical advice. Always consult a
              qualified healthcare provider for a definitive diagnosis and
              treatment.
            </p>
          </div>
          <div className="bg-card rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg text-blue-700 mb-2">
              Is my data secure and private?
            </h3>
            <p className="text-muted-foreground">
              Yes, your data is encrypted and stored securely. We follow strict
              privacy protocols and do not share your information with third
              parties without your consent.
            </p>
          </div>
          <div className="bg-card rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg text-blue-700 mb-2">
              Can I use the platform in my local language?
            </h3>
            <p className="text-muted-foreground">
              Absolutely! Our platform supports multiple Indian languages for
              both voice and text input, making healthcare accessible to
              everyone.
            </p>
          </div>
          <div className="bg-card rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg text-blue-700 mb-2">
              How do I find nearby doctors or hospitals?
            </h3>
            <p className="text-muted-foreground">
              Use the "Find Nearby Care" feature to locate hospitals and doctors
              in your area, complete with ratings, reviews, and contact options.
            </p>
          </div>
          <div className="bg-card rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg text-blue-700 mb-2">
              Can I store and manage my medical records?
            </h3>
            <p className="text-muted-foreground">
              Yes, you can securely upload, store, and manage your medical
              documents and history for easy access anytime.
            </p>
          </div>
          <div className="bg-card rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg text-blue-700 mb-2">
              Is this service free?
            </h3>
            <p className="text-muted-foreground">
              Most features are free to use. Some advanced services or
              consultations may have minimal charges, which will be clearly
              communicated.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home
