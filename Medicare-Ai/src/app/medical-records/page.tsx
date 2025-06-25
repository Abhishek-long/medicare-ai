"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { FileText, Download, Upload, Calendar, User, DollarSign, Plus, Search, Filter } from "lucide-react";
import Header from "@/components/Header";

const MedicalRecords = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const medicalHistory = [
    {
      id: 1,
      date: "2024-01-15",
      type: "Consultation",
      doctor: "Dr. Sarah Johnson",
      diagnosis: "Annual Physical Exam",
      notes: "Patient in good health. Recommended annual follow-up.",
      status: "Completed"
    },
    {
      id: 2,
      date: "2023-12-08",
      type: "Lab Results",
      doctor: "Dr. Michael Chen",
      diagnosis: "Blood Panel - Normal",
      notes: "All values within normal range. Cholesterol slightly elevated.",
      status: "Reviewed"
    },
    {
      id: 3,
      date: "2023-11-22",
      type: "Prescription",
      doctor: "Dr. Emily Rodriguez",
      diagnosis: "Migraine Treatment",
      notes: "Prescribed Sumatriptan 50mg as needed for migraine episodes.",
      status: "Active"
    }
  ];

  const bills = [
    {
      id: 1,
      date: "2024-01-15",
      provider: "City General Hospital",
      service: "Annual Physical Exam",
      amount: 250.00,
      insurance: 200.00,
      balance: 50.00,
      status: "Paid"
    },
    {
      id: 2,
      date: "2023-12-08",
      provider: "Advanced Cardiac Center",
      service: "Blood Panel & Lab Work",
      amount: 180.00,
      insurance: 144.00,
      balance: 36.00,
      status: "Outstanding"
    },
    {
      id: 3,
      date: "2023-11-22",
      provider: "Community Health Clinic",
      service: "Consultation & Prescription",
      amount: 120.00,
      insurance: 96.00,
      balance: 24.00,
      status: "Paid"
    }
  ];

  const documents = [
    {
      id: 1,
      name: "Annual_Physical_Report_2024.pdf",
      type: "Medical Report",
      date: "2024-01-15",
      size: "2.4 MB",
      category: "Lab Results"
    },
    {
      id: 2,
      name: "Blood_Panel_Results_Dec2023.pdf",
      type: "Lab Results",
      date: "2023-12-08",
      size: "1.8 MB",
      category: "Lab Results"
    },
    {
      id: 3,
      name: "Prescription_Migraine_Treatment.pdf",
      type: "Prescription",
      date: "2023-11-22",
      size: "0.5 MB",
      category: "Prescriptions"
    },
    {
      id: 4,
      name: "Insurance_Card_2024.jpg",
      type: "Insurance",
      date: "2024-01-01",
      size: "1.2 MB",
      category: "Insurance"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Active":
      case "Outstanding":
        return "bg-yellow-100 text-yellow-800";
      case "Reviewed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Medical Records</h1>
          <p className="text-xl text-gray-600">Securely manage your medical history, bills, and documents</p>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 flex gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search records, bills, or documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
            <div className="flex gap-2">
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history">Medical History</TabsTrigger>
            <TabsTrigger value="bills">Bills & Payments</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Medical History Tab */}
          <TabsContent value="history" className="space-y-4">
            {medicalHistory.map((record) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                  <div>
                    <CardTitle className="text-lg">{record.diagnosis}</CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-1">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {record.date}
                      </span>
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {record.doctor}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                    <Badge variant="outline">{record.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{record.notes}</p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Bills Tab */}
          <TabsContent value="bills" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-green-600">$74.00</div>
                  <div className="text-gray-600">Total Paid</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-yellow-600">$36.00</div>
                  <div className="text-gray-600">Outstanding</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-blue-600">$440.00</div>
                  <div className="text-gray-600">Insurance Covered</div>
                </CardContent>
              </Card>
            </div>

            {bills.map((bill) => (
              <Card key={bill.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                  <div>
                    <CardTitle className="text-lg">{bill.service}</CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-1">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {bill.date}
                      </span>
                      <span>{bill.provider}</span>
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(bill.status)}>{bill.status}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Total Amount</div>
                      <div className="font-semibold">${bill.amount.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Insurance</div>
                      <div className="font-semibold text-green-600">${bill.insurance.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Your Balance</div>
                      <div className="font-semibold text-blue-600">${bill.balance.toFixed(2)}</div>
                    </div>
                    <div className="flex items-end">
                      {bill.status === "Outstanding" && (
                        <Button size="sm" className="w-full">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      View Bill
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <Badge variant="outline">{doc.category}</Badge>
                    </div>
                    <CardTitle className="text-base truncate">{doc.name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center justify-between text-xs">
                        <span>{doc.date}</span>
                        <span>{doc.size}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MedicalRecords;
