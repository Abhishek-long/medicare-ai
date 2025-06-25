import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowUpRight, DollarSign, Users, Star } from "lucide-react";

export default function DoctorDashboard() {
  const doctorData = {
    patientsTreated: 125,
    rating: 4.8,
    earnings: 75000,
    recentPatients: [
      { id: 1, name: "John Doe", lastVisit: "2024-07-20", avatar: "/placeholder.svg" },
      { id: 2, name: "Jane Smith", lastVisit: "2024-07-18", avatar: "/placeholder.svg" },
      { id: 3, name: "Sam Wilson", lastVisit: "2024-07-15", avatar: "/placeholder.svg" },
    ],
    upcomingAppointments: [
        { id: 7, patientName: "Michael Brown", time: "Tomorrow at 10:00 AM", reason: "Follow-up" },
        { id: 8, patientName: "Linda Green", time: "Tomorrow at 2:30 PM", reason: "New patient consultation" },
    ]
  };

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Welcome, Dr. Alex Reeves!</h1>
            <p className="text-slate-500 dark:text-slate-400">Here's a summary of your activity today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white dark:bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Earnings</CardTitle>
                    <DollarSign className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">${doctorData.earnings.toLocaleString()}</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">+10.2% from last month</p>
                </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Patients Treated</CardTitle>
                    <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">+{doctorData.patientsTreated}</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">+5 since last week</p>
                </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Average Rating</CardTitle>
                    <Star className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">{doctorData.rating} / 5</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Based on 80 reviews</p>
                </CardContent>
            </Card>
        </div>
      
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white dark:bg-slate-900">
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-slate-50">Recent Patients</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patient</TableHead>
                                <TableHead>Last Visit</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {doctorData.recentPatients.map((patient) => (
                            <TableRow key={patient.id}>
                                <TableCell>
                                    <div className="flex items-center space-x-3">
                                        <Avatar>
                                            <AvatarImage src={patient.avatar} />
                                            <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium text-slate-900 dark:text-slate-50">{patient.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-600 dark:text-slate-300">{patient.lastVisit}</TableCell>
                                <TableCell className="text-right">
                                <Link href={`/doctor/patients/${patient.id}`} className="text-indigo-600 hover:underline text-sm">
                                    View Record
                                </Link>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-900">
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-slate-50">Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {doctorData.upcomingAppointments.map((appt) => (
                            <li key={appt.id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Avatar>
                                        <AvatarFallback>{appt.patientName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-slate-50">{appt.patientName}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{appt.reason}</p>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{appt.time}</p>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
