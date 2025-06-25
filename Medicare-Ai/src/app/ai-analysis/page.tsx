"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import FileUpload from "@/components/FileUpload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Header from "@/components/Header"
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  X,
  ArrowRight,
  Plus,
  FileText,
  Image as ImageIcon,
} from "lucide-react"

const HARDCODED_ANALYSIS = [
  {
    label: "Hemoglobin",
    value: "11.2 g/dL",
    status: "LOW",
    icon: <XCircle className="text-red-500 w-4 h-4 mr-1 inline" />, // Needs attention
    tag: (
      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs ml-2">
        LOW
      </span>
    ),
    explanation: "Slightly low, could mean mild anemia.",
  },
  {
    label: "WBC",
    value: "8,500 /mm³",
    status: "NORMAL",
    icon: <CheckCircle className="text-green-500 w-4 h-4 mr-1 inline" />,
    tag: (
      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs ml-2">
        NORMAL
      </span>
    ),
    explanation: "Within healthy range.",
  },
  {
    label: "Platelets",
    value: "210,000 /mm³",
    status: "NORMAL",
    icon: <CheckCircle className="text-green-500 w-4 h-4 mr-1 inline" />,
    tag: (
      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs ml-2">
        NORMAL
      </span>
    ),
    explanation: "Within healthy range.",
  },
  {
    label: "Blood Sugar (Fasting)",
    value: "130 mg/dL",
    status: "BORDERLINE",
    icon: <AlertTriangle className="text-yellow-500 w-4 h-4 mr-1 inline" />,
    tag: (
      <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs ml-2">
        BORDERLINE
      </span>
    ),
    explanation: "Borderline high, could be a sign of prediabetes.",
  },
]

const HARDCODED_SUMMARY = `\n- Your hemoglobin is a bit low, which could mean mild anemia.\n- Your white blood cell and platelet counts are normal, which is good.\n- Your fasting blood sugar is a little high. This could be a sign of prediabetes, especially if you have risk factors.`

const HARDCODED_NEXT_STEPS = [
  "Consider eating more iron-rich foods (like spinach, beans, or lean meats).",
  "If you have a family history of diabetes or other risk factors, talk to your doctor about your blood sugar.",
  "No urgent issues, but follow up with your doctor for a full interpretation.",
]

function getFileTypeIcon(type: string) {
  if (type.startsWith("image/"))
    return <ImageIcon className="w-4 h-4 text-blue-500 mr-1" />
  if (type === "application/pdf")
    return <FileText className="w-4 h-4 text-red-500 mr-1" />
  return <FileText className="w-4 h-4 text-gray-400 mr-1" />
}

export default function AIReportAnalyzer() {
  const [files, setFiles] = useState<Array<{ file: File; url: string }>>([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [typedAnalysis, setTypedAnalysis] = useState<string>("")
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Typing effect for analysis
  const startTypingEffect = (fullText: string) => {
    setTypedAnalysis("")
    let i = 0
    const interval = setInterval(() => {
      setTypedAnalysis((prev) => prev + fullText[i])
      i++
      if (i >= fullText.length) clearInterval(interval)
    }, 12)
  }

  // Analyze the selected file automatically when files or selectedIdx changes
  useEffect(() => {
    if (files.length > 0) {
      setIsAnalyzing(true)
      setTypedAnalysis("")
      setTimeout(() => {
        setIsAnalyzing(false)
        let result = "**Key Findings:**\n"
        HARDCODED_ANALYSIS.forEach((item) => {
          result += `- ${item.label}: ${item.value} (${item.status})\n`
        })
        result +=
          "\n**What This Means:**" +
          HARDCODED_SUMMARY +
          "\n\n**Next Steps:**\n" +
          HARDCODED_NEXT_STEPS.map((s) => `- ${s}`).join("\n")
        startTypingEffect(result)
      }, 1800)
    } else {
      setTypedAnalysis("")
      setIsAnalyzing(false)
    }
    // eslint-disable-next-line
  }, [files, selectedIdx])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || [])
    const validFiles = newFiles.filter(
      (f) => f.type.startsWith("image/") || f.type === "application/pdf"
    )
    if (validFiles.length !== newFiles.length) {
      alert("Some files were not supported and were skipped.")
    }
    const fileObjs = validFiles.map((file) => ({
      file,
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
    }))
    setFiles((prev) => [...prev, ...fileObjs])
    if (files.length === 0 && fileObjs.length > 0) setSelectedIdx(0)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    const dtFiles = Array.from(e.dataTransfer.files || [])
    const validFiles = dtFiles.filter(
      (f) => f.type.startsWith("image/") || f.type === "application/pdf"
    )
    if (validFiles.length !== dtFiles.length) {
      alert("Some files were not supported and were skipped.")
    }
    const fileObjs = validFiles.map((file) => ({
      file,
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
    }))
    setFiles((prev) => [...prev, ...fileObjs])
    if (files.length === 0 && fileObjs.length > 0) setSelectedIdx(0)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleRemoveFile = (idx: number) => {
    setFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== idx)
      if (newFiles.length === 0) {
        setTypedAnalysis("")
        setIsAnalyzing(false)
      }
      if (selectedIdx === idx) setSelectedIdx(0)
      else if (selectedIdx > idx) setSelectedIdx(selectedIdx - 1)
      return newFiles
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Analyze a Medical Report
          </h1>
          <p className="text-lg text-gray-600">
            Upload your lab reports (PDF, JPG, PNG) and let AI explain them in
            simple language.
          </p>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Panel: Drop Zone */}
          <Card className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
            <CardHeader className="flex flex-col items-center gap-1 mb-2">
              <CardTitle className="text-lg font-bold text-center">
                Lab Report
              </CardTitle>
              <CardDescription className="text-base text-slate-600 text-center w-96">
                Upload your reports below.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center w-full">
              <FileUpload
                onFiles={(newFiles: any) => {
                  const validFiles = newFiles.filter(
                    (f: any) =>
                      f.type.startsWith("image/") ||
                      f.type === "application/pdf"
                  )
                  const fileObjs = validFiles.map((file: any) => ({
                    file,
                    url: file.type.startsWith("image/")
                      ? URL.createObjectURL(file)
                      : "",
                  }))
                  setFiles((prev) => [...prev, ...fileObjs])
                  if (files.length === 0 && fileObjs.length > 0)
                    setSelectedIdx(0)
                }}
                multiple
                disabled={isAnalyzing}
              />
              {/* ...keep your file list, preview, and remove logic below here... */}
              <div className="flex flex-wrap gap-2 w-full mb-4">
                {files.map((f, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center px-2 py-1 rounded border ${
                      selectedIdx === idx
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-slate-100"
                    } cursor-pointer`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedIdx(idx)
                    }}
                  >
                    {getFileTypeIcon(f.file.type)}
                    <span className="text-xs font-medium mr-1">
                      {f.file.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFile(idx)
                      }}
                      className="ml-1 text-red-500 hover:text-red-700"
                      aria-label="Remove file"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              {files[selectedIdx] ? (
                files[selectedIdx].file.type.startsWith("image/") ? (
                  <img
                    src={files[selectedIdx].url}
                    alt="Uploaded Lab Report"
                    className="rounded-lg border shadow max-h-80 object-contain mt-2"
                  />
                ) : (
                  <div className="flex flex-col items-center mt-8">
                    <FileText className="w-16 h-16 text-red-400 mb-2" />
                    <span className="text-sm text-slate-700">
                      {files[selectedIdx].file.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      PDF file (preview not available)
                    </span>
                  </div>
                )
              ) : (
                <img
                  src="/file.svg"
                  alt="Placeholder"
                  className="w-32 h-32 opacity-40 mt-8"
                />
              )}
            </CardContent>
          </Card>
          {/* Right Panel: Analysis */}
          <Card className="flex-1 min-h-[400px]">
            <CardHeader>
              <CardTitle>AI Analysis & Insights</CardTitle>
              <CardDescription>
                The AI will highlight and explain key findings in your report.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-full py-16">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                  <p className="text-blue-700 font-medium">
                    AI is analyzing your report...
                  </p>
                </div>
              ) : typedAnalysis ? (
                <div>
                  <h4 className="font-semibold mb-2">Key Findings:</h4>
                  <ul className="mb-4">
                    {HARDCODED_ANALYSIS.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 mb-1">
                        {item.icon}
                        <span className="font-medium text-slate-800">
                          {item.label}:
                        </span>
                        <span className="ml-1 text-slate-700">
                          {item.value}
                        </span>
                        {item.tag}
                        <span className="ml-2 text-xs text-slate-500">
                          {item.explanation}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <h4 className="font-semibold mb-2">What This Means:</h4>
                  <div className="mb-4 whitespace-pre-line text-slate-700">
                    {HARDCODED_SUMMARY}
                  </div>
                  <h4 className="font-semibold mb-2">Next Steps:</h4>
                  <ul className="mb-6">
                    {HARDCODED_NEXT_STEPS.map((step, idx) => (
                      <li key={idx} className="flex items-center gap-2 mb-1">
                        <ArrowRight className="w-4 h-4 text-blue-500" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-4 mt-6">
                    <Button variant="default" className="flex-1">
                      <Plus className="w-4 h-4 mr-1" />
                      Save to My Medical Records
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() =>
                        (window.location.href = "/doctor-directory")
                      }
                    >
                      <ArrowRight className="w-4 h-4 mr-1" />
                      Find a Specialist
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center mt-20">
                  Upload a report to see the analysis here.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
