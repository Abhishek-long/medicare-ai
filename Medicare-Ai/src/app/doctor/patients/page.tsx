import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";

export default function PatientsPage() {
  const patients = [
    { id: 1, name: "John Doe", age: 45, gender: "Male", lastVisit: "2024-07-20", avatar: "/placeholder.svg" },
    { id: 2, name: "Jane Smith", age: 34, gender: "Female", lastVisit: "2024-07-18", avatar: "/placeholder.svg" },
    { id: 3, name: "Sam Wilson", age: 52, gender: "Male", lastVisit: "2024-07-15", avatar: "/placeholder.svg" },
    { id: 4, name: "Alice Johnson", age: 28, gender: "Female", lastVisit: "2024-07-12", avatar: "/placeholder.svg" },
    { id: 5, name: "Robert Brown", age: 61, gender: "Male", lastVisit: "2024-07-10", avatar: "/placeholder.svg" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-slate-50">Patients</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{patients.length}</div>
                </CardContent>
            </Card>
        </div>
      <Card className="bg-white dark:bg-slate-900">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
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
                  <TableCell className="text-slate-600 dark:text-slate-300">{patient.age}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">{patient.gender}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">{patient.lastVisit}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/doctor/patients/${patient.id}`} className="text-indigo-600 hover:underline">
                      View Details
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 