import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BriefcaseMedical, Mail, Phone, GraduationCap } from "lucide-react";

export default async function CollaboratorDetailPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch doctor data based on the id
  const doctor = {
    id: params.id,
    name: "Dr. Sarah Johnson",
    specialty: "Pediatrics",
    email: "sarah.j@medicare.com",
    phone: "111-222-3333",
    avatar: "/placeholder.svg",
    bio: "Dr. Sarah Johnson is a board-certified pediatrician with over 15 years of experience in children's health. She is passionate about providing comprehensive care and building long-term relationships with families.",
    credentials: [
        "MD, Stanford University School of Medicine",
        "Residency in Pediatrics, UCSF Medical Center",
        "Fellowship in Pediatric Pulmonology, Boston Children's Hospital"
    ]
  };

  return (
    <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="h-28 w-28">
                <AvatarImage src={doctor.avatar} alt={doctor.name} />
                <AvatarFallback className="text-4xl">{doctor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">{doctor.name}</h1>
                <p className="text-xl text-indigo-600 font-semibold">{doctor.specialty}</p>
                <div className="flex space-x-4 mt-2 text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4"/>
                        <span>{doctor.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Phone className="w-4 h-4"/>
                        <span>{doctor.phone}</span>
                    </div>
                </div>
            </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Card className="bg-white dark:bg-slate-900">
                <CardHeader><CardTitle className="text-slate-900 dark:text-slate-50">Professional Summary</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-slate-700 dark:text-slate-300">{doctor.bio}</p>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-slate-900">
                <CardHeader><CardTitle className="text-slate-900 dark:text-slate-50">Credentials</CardTitle></CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                    {doctor.credentials.map((cred, index) => (
                        <li key={index} className="flex items-start">
                            <GraduationCap className="w-5 h-5 mr-3 mt-1 text-indigo-500"/>
                            <span className="text-slate-700 dark:text-slate-300">{cred}</span>
                        </li>
                    ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
} 