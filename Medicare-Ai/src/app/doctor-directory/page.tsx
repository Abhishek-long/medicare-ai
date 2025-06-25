"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useEffect, useState } from "react";

// Mocked doctor data with new Indian names, photos, and bios
const MOCK_DOCTORS = [
  { id: 1, name: "Dr. Sameer Joshi", speciality: "Cardiology", location: { city: "Gurgram", lat: 18.5204, lng: 73.8567 }, photo: "https://images.pexels.com/photos/5452291/pexels-photo-5452291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", bio: "Renowned cardiologist with a focus on preventive care." },
  { id: 2, name: "Dr. Meera Iyer", speciality: "Dermatology", location: { city: "Mandoli", lat: 23.0225, lng: 72.5714 }, photo: "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", bio: "Expert in clinical and aesthetic dermatology." },
  { id: 3, name: "Dr. Karan Malhotra", speciality: "Pediatrics", location: { city: "Ghaziabad", lat: 26.9124, lng: 75.7873 }, photo: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", bio: "Dedicated to providing the best care for children." },
  { id: 4, name: "Dr. Sunita Rao", speciality: "Orthopedics", location: { city: "Bhiwani", lat: 26.8467, lng: 80.9462 }, photo: "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", bio: "Specializing in joint replacement and sports injuries." },
  { id: 5, name: "Dr. Rajesh Nair", speciality: "Neurology", location: { city: "Dallupura", lat: 21.1458, lng: 79.0882 }, photo: "https://images.pexels.com/photos/5452268/pexels-photo-5452268.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", bio: "Leading neurologist with expertise in stroke and epilepsy." },
  { id: 6, name: "Dr. Fatima Ansari", speciality: "Cardiology", location: { city: "Deoli", lat: 22.7196, lng: 75.8577 }, photo: "https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", bio: "Compassionate heart specialist with a patient-first approach." },
];

const SPECIALTIES = [
  "All",
  ...Array.from(new Set(MOCK_DOCTORS.map(doc => doc.speciality)))
];

// Helper to calculate distance between two lat/lng points (Haversine formula)
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function DoctorDirectory() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [filteredDoctors, setFilteredDoctors] = useState(MOCK_DOCTORS);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Fallback: New York
          setUserLocation({ lat: 40.7128, lng: -74.006 });
          setLocationError("Location access denied. Showing doctors near Maharashtra.");
        }
      );
    } else {
      setUserLocation({ lat: 40.7128, lng: -74.006 });
      setLocationError("Geolocation not supported. Showing doctors near Maharashtra.");
    }
  }, []);

  useEffect(() => {
    let results = MOCK_DOCTORS;
    if (search.trim()) {
      results = results.filter(doc => doc.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (specialty !== "All") {
      results = results.filter(doc => doc.speciality === specialty);
    }
    setFilteredDoctors(results);
  }, [search, specialty]);

  // Nearby doctors: within 50km
  const nearbyDoctors = userLocation
    ? MOCK_DOCTORS.filter((doc) => getDistance(userLocation.lat, userLocation.lng, doc.location.lat, doc.location.lng) < 50)
    : [];

  // Group by speciality
  const groupedNearby = nearbyDoctors.reduce((acc: Record<string, typeof MOCK_DOCTORS>, doc) => {
    acc[doc.speciality] = acc[doc.speciality] || [];
    acc[doc.speciality].push(doc);
    return acc;
  }, {});

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-16">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Doctor Directory</h1>
            <p className="text-slate-500 dark:text-slate-400">Browse all doctors registered on Medicare-AI and find nearby specialists.</p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
            <Input
              type="text"
              placeholder="Search by doctor name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full md:w-1/3 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger className="w-full md:w-1/4">
                    <SelectValue placeholder="Select Speciality" />
                </SelectTrigger>
                <SelectContent>
                    {SPECIALTIES.map(spec => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>

          {/* All Doctors Section */}
          <Card className="bg-white dark:bg-slate-900 mt-8">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-50">All Doctors on Medicare-AI</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Speciality</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={doc.photo} />
                            <AvatarFallback>{doc.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-slate-900 dark:text-slate-50">{doc.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{doc.speciality}</TableCell>
                      <TableCell>{doc.location.city}</TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline">Book Appointment</Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto">
                            <div className="flex flex-col space-y-2">
                              <Button variant="ghost">Book on Call</Button>
                              <Button variant="ghost">Book Physical Meetup</Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Nearby Doctors Section */}
          <Card className="bg-white dark:bg-slate-900 mt-8">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-50">Nearby Doctors by Speciality</CardTitle>
            </CardHeader>
            <CardContent>
              {locationError && (
                <div className="mb-4 text-sm text-yellow-600 dark:text-yellow-400">{locationError}</div>
              )}
              {Object.keys(groupedNearby).length === 0 ? (
                <div className="text-slate-600 dark:text-slate-300">No nearby doctors found.</div>
              ) : (
                Object.entries(groupedNearby).map(([speciality, docs]) => (
                  <div key={speciality} className="mb-6">
                    <h3 className="font-semibold text-lg text-indigo-700 dark:text-indigo-300 mb-2">{speciality}</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Doctor</TableHead>
                          <TableHead>City</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {docs.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarImage src={doc.photo} />
                                  <AvatarFallback>{doc.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-slate-900 dark:text-slate-50">{doc.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{doc.location.city}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Doctor Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredDoctors.length === 0 ? (
              <div className="col-span-full text-center text-slate-500 dark:text-slate-400">No doctors found.</div>
            ) : (
              filteredDoctors.map(doc => (
                <div key={doc.id} className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 flex flex-col items-center text-center">
                  <img src={doc.photo} alt={doc.name} className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-blue-200" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-1">{doc.name}</h3>
                  <div className="text-blue-600 font-semibold mb-1">{doc.speciality}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-sm mb-2">{doc.location.city}</div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">{doc.bio}</p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">Book Appointment</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto">
                      <div className="flex flex-col space-y-2">
                        <Button variant="ghost">Book on Call</Button>
                        <Button variant="ghost">Book Physical Meetup</Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 