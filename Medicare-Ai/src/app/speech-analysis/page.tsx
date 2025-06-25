"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Mic,
  MicOff,
  Volume2,
  AlertCircle,
  CheckCircle,
  MapPin,
  Hospital,
  Send,
  X,
  MessageSquarePlus,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Header from "@/components/Header"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import jsPDF from "jspdf"

// Define the SpeechRecognition types for broader browser support
interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult
  length: number
  item(index: number): SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onend: (() => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  start(): void
  stop(): void
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
  error: string
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface CustomWindow extends Window {
  SpeechRecognition: {
    new (): SpeechRecognition
  }
  webkitSpeechRecognition: {
    new (): SpeechRecognition
  }
}
declare const window: CustomWindow

const LANGUAGES = [
  { code: "en-US", label: "English" },
  { code: "hi-IN", label: "Hindi" },
  { code: "mr-IN", label: "Marathi" },
  { code: "gu-IN", label: "Gujarati" },
  { code: "ta-IN", label: "Tamil" },
  { code: "te-IN", label: "Telugu" },
]

interface Message {
  role: "user" | "doctor"
  content: string
}

const SpeechAnalysis = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [conversation, setConversation] = useState<Message[]>([
    {
      role: "doctor",
      content:
        "Hello! I am your AI doctor. Please describe your symptoms in your preferred language.",
    },
  ])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [language, setLanguage] = useState("en-US")
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const wasRecordingRef = useRef(false)
  const [prescription, setPrescription] = useState("")
  const [showPrescription, setShowPrescription] = useState(false)
  const [inputValue, setInputValue] = useState("")

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      toast.error("Your browser does not support speech recognition.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = language

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ""
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript
      }
      setTranscript(finalTranscript)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      toast.error(`Speech recognition error: ${event.error}`)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
    }
  }, [language])

  useEffect(() => {
    if (transcript.trim() && wasRecordingRef.current) {
      handleSend(transcript)
      setTranscript("")
      wasRecordingRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript])

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
    } else {
      setTranscript("")
      wasRecordingRef.current = true
      recognitionRef.current?.start()
      setIsRecording(true)
    }
  }

  const handleSend = async (userMessage: string) => {
    if (!userMessage.trim()) return
    setConversation((prev) => [...prev, { role: "user", content: userMessage }])
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/analyze-symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation: [
            ...conversation,
            { role: "user", content: userMessage },
          ],
          language,
        }),
      })
      if (!response.ok)
        throw new Error("Failed to get analysis from the server.")
      const data = await response.json()
      setConversation((prev) => [
        ...prev,
        { role: "doctor", content: data.analysis },
      ])
    } catch (error) {
      toast.error("There was an error analyzing your symptoms.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Helper to format doctor's analysis (remove asterisks, add headings)
  function formatAnalysis(text: string) {
    return text
      .replace(/\*\*/g, "") // Remove bold markdown
      .replace(/\*/g, "") // Remove asterisks
      .replace(
        /(Possible Conditions:|Recommendations:|Red Flags:|Next Steps:|Disclaimer:)/g,
        "\n$1\n"
      )
      .replace(/\n{2,}/g, "\n\n") // Normalize line breaks
  }

  const generatePrescription = async () => {
    setShowPrescription(true)
    setPrescription("") // Clear previous prescription
    try {
      const response = await fetch("/api/analyze-symptoms/prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation, language }),
      })
      if (!response.ok) {
        throw new Error("Failed to generate prescription.")
      }
      const data = await response.json()
      setPrescription(data.prescription)
    } catch (e) {
      toast.error("Failed to generate prescription. Please try again.")
      setPrescription("Could not generate a prescription at this time.")
    }
  }

  const handleNewChat = () => {
    setConversation([
      {
        role: "doctor",
        content:
          "Hello! I am your AI doctor. Please describe your symptoms in your preferred language.",
      },
    ])
    setShowPrescription(false)
    setInputValue("")
    if (isRecording) {
      recognitionRef.current?.stop()
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div
        className={`max-w-5xl mx-auto px-4 py-8 flex ${
          showPrescription ? "flex-row gap-8" : "flex-col items-center"
        }`}
      >
        {/* Chat Section */}
        <div
          className={`bg-card rounded-2xl shadow-lg p-6 h-[70vh] flex flex-col w-full ${
            showPrescription ? "max-w-2xl" : "max-w-2xl mx-auto"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <Button variant="outline" onClick={handleNewChat}>
              <MessageSquarePlus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 overflow-y-auto space-y-6 mb-4 pr-4">
            {conversation.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-end gap-2 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-5 py-3 max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-muted-foreground rounded-bl-none"
                  }`}
                >
                  {msg.role === "doctor" ? (
                    <pre className="whitespace-pre-wrap font-sans text-left">
                      {formatAnalysis(msg.content)}
                    </pre>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {isAnalyzing && (
              <div className="flex items-end gap-2 justify-start">
                <div className="bg-muted text-muted-foreground rounded-2xl px-5 py-3 max-w-[80%] rounded-bl-none">
                  <span className="animate-pulse">Doctor is typing...</span>
                </div>
              </div>
            )}
          </div>
          <Button
            variant="default"
            className="w-full mb-4"
            onClick={generatePrescription}
            disabled={isAnalyzing || conversation.length < 2}
          >
            Generate AI recommended prescription
          </Button>
          <div className="flex items-center gap-2 p-2 rounded-lg border bg-input focus-within:ring-2 focus-within:ring-ring">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleMicClick}
              className={`w-12 h-12 rounded-full flex-shrink-0 ${
                isRecording
                  ? "bg-red-500/20 text-red-500 animate-pulse"
                  : "text-muted-foreground"
              }`}
              disabled={isAnalyzing}
            >
              <Mic className="w-6 h-6" />
            </Button>
            <input
              type="text"
              className="flex-1 bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
              placeholder="Type your message or use the mic..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && inputValue.trim()) {
                  handleSend(inputValue)
                  setInputValue("")
                }
              }}
              disabled={isAnalyzing}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                handleSend(inputValue)
                setInputValue("")
              }}
              disabled={!inputValue.trim() || isAnalyzing}
              className="w-12 h-12 rounded-full flex-shrink-0 text-primary"
            >
              <Send className="w-6 h-6" />
            </Button>
          </div>
        </div>
        {/* Prescription Panel */}
        {showPrescription && (
          <div className="relative bg-card rounded-2xl shadow-lg p-6 h-[70vh] w-full max-w-md flex flex-col justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-muted-foreground"
              onClick={() => setShowPrescription(false)}
            >
              <X className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-xl font-bold mb-4 text-center">
                AI Recommended Prescription
              </h2>
              <pre className="whitespace-pre-wrap font-sans text-left text-base overflow-y-auto max-h-[calc(70vh-150px)] bg-muted p-4 rounded-lg">
                {prescription || "Generating prescription..."}
              </pre>
            </div>
            <Button
              className="mt-4 w-full"
              onClick={() => {
                const doc = new jsPDF()
                doc.setFontSize(12)
                doc.text(prescription || "No prescription generated.", 10, 20)
                doc.save("prescription.pdf")
              }}
              disabled={
                !prescription || prescription === "Generating prescription..."
              }
            >
              Download PDF
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SpeechAnalysis
