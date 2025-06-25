import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default async function PatientDetailPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch patient data based on the id
  const patient = {
    id: params.id,
    name: "John Doe",
    age: 45,
    gender: "Male",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    avatar: "/placeholder.svg",
    medicalHistory: "Has a history of hypertension and is allergic to penicillin.",
    recentAppointments: [
      { date: "2024-07-20", reason: "Annual Check-up" },
      { date: "2024-05-10", reason: "Follow-up on hypertension" },
    ],
    notes: "Patient is responding well to current medication.",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={patient.avatar} alt={patient.name} />
          <AvatarFallback className="text-3xl">{patient.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">{patient.name}</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400">Patient ID: {patient.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 bg-white dark:bg-slate-900">
          <CardHeader><CardTitle className="text-slate-900 dark:text-slate-50">Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-slate-700 dark:text-slate-300">
            <p><strong>Age:</strong> {patient.age}</p>
            <p><strong>Gender:</strong> {patient.gender}</p>
            <p><strong>Email:</strong> {patient.email}</p>
            <p><strong>Phone:</strong> {patient.phone}</p>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-8">
            <Card className="bg-white dark:bg-slate-900">
                <CardHeader><CardTitle className="text-slate-900 dark:text-slate-50">Medical History</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-slate-700 dark:text-slate-300">{patient.medicalHistory}</p>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900">
                <CardHeader><CardTitle className="text-slate-900 dark:text-slate-50">Recent Appointments</CardTitle></CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                    {patient.recentAppointments.map((appt, index) => (
                        <li key={index} className="text-slate-700 dark:text-slate-300">
                            <strong className="font-medium text-slate-800 dark:text-slate-200">{appt.date}:</strong> {appt.reason}
                        </li>
                    ))}
                    </ul>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900">
                <CardHeader><CardTitle className="text-slate-900 dark:text-slate-50">Doctor's Notes</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-slate-700 dark:text-slate-300">{patient.notes}</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
} 