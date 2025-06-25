import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { Users, Stethoscope, HeartPulse, UserCheck } from "lucide-react";

export default function ActivityPage() {
  const collaborators = [
    { id: "doc1", name: "Dr. Sarah Johnson", specialty: "Pediatrics", email: "sarah.j@medicare.com", avatar: "/placeholder.svg" },
    { id: "doc2", name: "Dr. Michael Chen", specialty: "Neurology", email: "michael.c@medicare.com", avatar: "/placeholder.svg" },
    { id: "doc3", name: "Dr. Lisa Rodriguez", specialty: "Oncology", email: "lisa.r@medicare.com", avatar: "/placeholder.svg" },
  ];

  const operations = [
    { id: "op1", patientName: "John Doe", patientId: "1", operation: "Appendectomy", date: "2024-07-15", collaborators: ["Dr. Sarah Johnson"] },
    { id: "op2", patientName: "Robert Brown", patientId: "5", operation: "Coronary Artery Bypass", date: "2024-06-28", collaborators: ["Dr. Michael Chen", "Dr. Lisa Rodriguez"] },
    { id: "op3", patientName: "Jane Smith", patientId: "2", operation: "Knee Replacement", date: "2024-06-10", collaborators: [] },
  ];

  const consultations = [
    { id: "con1", patientName: "Alice Johnson", patientId: "4", reason: "Annual Check-up", date: "2024-07-12" },
    { id: "con2", patientName: "Sam Wilson", patientId: "3", reason: "Follow-up on blood pressure", date: "2024-07-08" },
    { id: "con3", patientName: "John Doe", patientId: "1", reason: "Pre-operative assessment", date: "2024-07-05" },
  ];

  const allPatients = [
    { id: 1, name: "John Doe", lastVisit: "2024-07-20", avatar: "/placeholder.svg" },
    { id: 2, name: "Jane Smith", lastVisit: "2024-07-18", avatar: "/placeholder.svg" },
    { id: 3, name: "Sam Wilson", lastVisit: "2024-07-15", avatar: "/placeholder.svg" },
  ];

  const renderSection = (id, title, icon, data, columns, renderRow) => (
    <div id={id}>
      <Card className="bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            {icon}
            <CardTitle className="text-xl text-slate-800 dark:text-slate-200">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col, index) => <TableHead key={index}>{col}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map(renderRow)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-8">
      {renderSection(
        "collaborators",
        "Collaborating Doctors",
        <Users className="h-6 w-6 text-indigo-500" />,
        collaborators,
        ["Doctor", "Specialty", "Contact", "Actions"],
        (doctor) => (
          <TableRow key={doctor.id}>
            <TableCell>
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-4"><AvatarImage src={doctor.avatar} /><AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback></Avatar>
                <span className="font-medium text-slate-900 dark:text-slate-50">{doctor.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-slate-600 dark:text-slate-300">{doctor.specialty}</TableCell>
            <TableCell className="text-slate-600 dark:text-slate-300">{doctor.email}</TableCell>
            <TableCell><Link href={`/doctor/collaborators/${doctor.id}`} className="text-indigo-600 hover:underline">View Profile</Link></TableCell>
          </TableRow>
        )
      )}

      {renderSection(
        "operations",
        "Operations Performed",
        <Stethoscope className="h-6 w-6 text-indigo-500" />,
        operations,
        ["Date", "Operation", "Patient", "Collaborators"],
        (op) => (
          <TableRow key={op.id}>
            <TableCell className="text-slate-600 dark:text-slate-300">{op.date}</TableCell>
            <TableCell className="font-medium text-slate-900 dark:text-slate-50">{op.operation}</TableCell>
            <TableCell><Link href={`/doctor/patients/${op.patientId}`} className="text-indigo-600 hover:underline">{op.patientName}</Link></TableCell>
            <TableCell className="text-slate-600 dark:text-slate-300">{op.collaborators.join(", ") || "None"}</TableCell>
          </TableRow>
        )
      )}

      {renderSection(
        "consultations",
        "Medical Consultations",
        <HeartPulse className="h-6 w-6 text-indigo-500" />,
        consultations,
        ["Date", "Patient", "Reason for Visit"],
        (con) => (
          <TableRow key={con.id}>
            <TableCell className="text-slate-600 dark:text-slate-300">{con.date}</TableCell>
            <TableCell><Link href={`/doctor/patients/${con.patientId}`} className="text-indigo-600 hover:underline">{con.patientName}</Link></TableCell>
            <TableCell className="text-slate-600 dark:text-slate-300">{con.reason}</TableCell>
          </TableRow>
        )
      )}

      {renderSection(
        "attended-patients",
        "All Attended Patients",
        <UserCheck className="h-6 w-6 text-indigo-500" />,
        allPatients,
        ["Patient", "Last Visit Date", "Actions"],
        (patient) => (
          <TableRow key={patient.id}>
            <TableCell>
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-4"><AvatarImage src={patient.avatar} /><AvatarFallback>{patient.name.charAt(0)}</AvatarFallback></Avatar>
                <span className="font-medium text-slate-900 dark:text-slate-50">{patient.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-slate-600 dark:text-slate-300">{patient.lastVisit}</TableCell>
            <TableCell><Link href={`/doctor/patients/${patient.id}`} className="text-indigo-600 hover:underline">View Medical Record</Link></TableCell>
          </TableRow>
        )
      )}
    </div>
  );
} 