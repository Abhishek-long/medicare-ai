"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Hospital, MapPin, Volume2, AlertCircle } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import Header from "@/components/Header"
import AuthModal from "@/components/AuthModal"

interface Provider {
  name: string
  address: string
  phone: string
  specialty: string
}

const FindCarePage = () => {
  const { data: session, status } = useSession()
  const [providers, setProviders] = useState<Provider[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFindProviders = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/find-providers")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to find providers.")
      }

      setProviders(data.providers)
      if (data.providers.length === 0) {
        toast.info("No providers found for your location.")
      }
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      handleFindProviders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">
            You must be signed in to find nearby care providers.
          </p>
          <AuthModal>
            <Button>Sign In</Button>
          </AuthModal>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Care Near You
          </h1>
          <p className="text-xl text-gray-600">
            Get a list of healthcare providers based on your registered
            location.
          </p>
        </div>

        {error && (
          <div className="text-center text-red-600 bg-red-100 p-4 rounded-md">
            <p>{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {providers.length > 0 && (
          <div>
            <div className="flex flex-col gap-6">
              {providers.map((provider, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Hospital className="w-6 h-6 mr-2 text-blue-600" />
                      {provider.name}
                    </CardTitle>
                    <CardDescription>{provider.specialty}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="flex items-start">
                      <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                      {provider.address}
                    </p>
                    {provider.phone && (
                      <p className="flex items-center mt-2">
                        <Volume2 className="w-4 h-4 mr-2" />
                        {provider.phone}
                      </p>
                    )}
                    <div className="flex gap-4 mt-4">
                      <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => {
                          const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                            provider.address
                          )}`
                          window.open(mapsUrl, "_blank")
                        }}
                      >
                        Direction
                      </Button>
                      <Button variant="outline" className="flex-1" asChild>
                        <a href={`tel:${provider.phone}`}>Call</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FindCarePage
