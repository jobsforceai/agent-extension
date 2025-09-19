// src/components/JobScraperPanel.tsx
import React, { useEffect, useState } from "react"
import { Loader2, Send, ArrowLeft, ChevronDown } from "lucide-react"
import { useAuthStore } from "~stores/authStore"
import { selectorsBasedOnSite } from "~utils/selectorsBasedOnSite"
import { agentAPI, type CreateJobForUserBody } from "../services/agentAPI"
import { getMetaData } from "~helpers/sendMetaData/metaData.helper"
import { generateUUID } from "~helpers/uuid.helper"


type Props = { userId: string; onBack: () => void }

const JobScraperPanel: React.FC<Props> = ({ userId, onBack }) => {
  const { initializeAuth, isAuthenticated } = useAuthStore()
  const [phase, setPhase] = useState<"idle" | "detecting" | "ready" | "sending" | "error" | "success">("idle")
  const [message, setMessage] = useState<string>("")

  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState<string | undefined>(undefined)
  const [companyUrl, setCompanyUrl] = useState<string | undefined>(undefined)
  const [location, setLocation] = useState<string | undefined>(undefined)
  const [jobLink, setJobLink] = useState(window.location.href)
  const [h1bStatus, setH1bStatus] = useState<"checking" | "yes" | "no" | "error">("checking")
  const [score, setScore] = useState<any>(null); // Assuming the score is an object or number
  const [computingScore, setComputingScore] = useState(false);

  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium")
  const [openPriority, setOpenPriority] = useState(false)
  const [status, setStatus] = useState<
    | "Saved"
    | "Assigned"
    | "In Progress"
    | "Applied"
    | "Screen"
    | "Interviewing"
    | "Offer"
    | "Withdrawn"
    | "Rejected"
    | "Accepted"
    | ""
  >("Assigned") // sensible default

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    const detect = async () => {
      setPhase("detecting")
      setMessage("Detecting job details on this page...")
      try {
        const data = await getMetaData({ ...selectorsBasedOnSite(window.location.href) })
        // map into local state
        if (data?.jobTitle) setJobTitle(data.jobTitle)
        if (data?.jobDescription) setJobDescription(data.jobDescription)
        if (data?.companyName) setCompanyName(data.companyName)
        if (data?.companyLogo) setCompanyLogo(data.companyLogo)
        if (data?.companyUrl) setCompanyUrl(data.companyUrl)
        if (data?.location) setLocation(data.location)
        if (data?.jobLink) setJobLink(data.jobLink)

        if (data?.jobTitle && data?.jobDescription) {
          setPhase("ready")
          setMessage("Job details detected. Review and send.")
        } else {
          setPhase("error")
          setMessage("Could not detect required fields. You can edit fields manually.")
        }
      } catch (err) {
        console.error("Detect error:", err)
        setPhase("error")
        setMessage("Error while detecting job details.")
      }
    }
    detect()
  }, [])

  useEffect(() => {
    const fetchH1BStatus = async () => {
      if (companyName) {
        setH1bStatus("checking");
        try {
          const result = await agentAPI.checkH1bSponsorship(companyName);
          setH1bStatus(result.data.isH1bSponsor ? "yes" : "no");
        } catch (error) {
          console.error("Error fetching H1B status:", error);
          setMessage(
            `Error checking H1B sponsorship: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
          setPhase("error");
        }
      }
    };
    fetchH1BStatus();
  }, [companyName]);

  const handleComputeScore = async () => {
    if (!jobDescription) {
      setMessage("Please enter a job description to compute the score.");
      return;
    }
    setComputingScore(true);
    setMessage("Computing job score...");
    try {
      const result = await agentAPI.computeJobScore(jobDescription);
      setScore(result);
      setMessage("Job score computed successfully.");
    } catch (error: any) {
      setMessage(`Error computing job score: ${error?.message || 'Unknown error'}`);
      setPhase("error");
    }
    setComputingScore(false);
  };
  const canSend =
    isAuthenticated &&
    jobTitle.trim().length > 0 &&
    jobDescription.trim().length > 0 &&
    jobLink.trim().length > 0

  const sendToUser = async () => {
    if (!canSend) {
      setMessage("Please login and fill required fields (title/description/link).")
      return
    }
    setPhase("sending")
    setMessage("Creating job for this user...")

    const body: CreateJobForUserBody = {
      jobId: generateUUID(),
      jobTitle,
      jobDescription,
      jobLink,
      // backend expects `imageUrl`; we also pass companyLogo separately for storage if you use it later
      imageUrl: companyLogo ?? null,
      priority: priority.toLowerCase(), // "high" | "medium" | "low"
      companyName: companyName || undefined,
      companyUrl: companyUrl || undefined,
      companyLogo: companyLogo || undefined,
      location: location || undefined,
      status: status || undefined
    }

    try {
      await agentAPI.createJobForUser(userId, body)
      setPhase("success")
      setMessage("Job created for user successfully!")
    } catch (err: any) {
      setPhase("error")
      setMessage(err?.message || "Failed to create job.")
    }
  }

  return (
    <div className="w-full">
      
      {h1bStatus === "checking" && ( <span>H1B Status: Searching... <Loader2 className="inline-block h-4 w-4 animate-spin" /></span> )}
      
      {h1bStatus !== "checking" && ( // Only show the status if not checking
        <div className="text-sm mb-2">
          H1B Status: {
            h1bStatus === "yes" ? (
              <span className="text-green-600 font-semibold">Yes</span>
            ) : h1bStatus === "no" ? (
              <span className="text-red-600 font-semibold">No</span>
            ) : (
              <span className="text-yellow-600 font-semibold">Error</span>
            )
          }
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-xs text-sky-700 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to users
        </button>
        <div className="text-[11px] text-gray-500">
          User: <span className="font-semibold">{userId}</span>
        </div>
      </div>

      <div className={`text-xs mb-3 ${phase === "error" ? "text-rose-600" : "text-gray-600"}`}>
        {message}
      </div>

      {/* Job Score Display */}
      <div className="text-sm mb-2">
        {computingScore ? (
          <span>Computing... <Loader2 className="inline-block h-4 w-4 animate-spin" /></span>
        ) : score ? (
          <span>Job Score: {JSON.stringify(score)}</span> // You can format this better
        ) : null}
      </div>

      {/* Fields */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Job Title *</label>
          <input
            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Software Engineer"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Job Description *</label>
          <textarea
            rows={4}
            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the description"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
            {companyName ? (
              <input
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            ) : (
              <input
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter Company Name Manually"
              />
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
            <input
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={location ?? ""}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Company URL</label>
          <input
            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={companyUrl ?? ""}
            onChange={(e) => setCompanyUrl(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Job Link *</label>
          <input
            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={jobLink}
            onChange={(e) => setJobLink(e.target.value)}
          />
        </div>

        {/* Priority selector */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
          <button
            onClick={() => setOpenPriority((p) => !p)}
            className={`w-full flex justify-between items-center px-4 py-2 text-left text-sm bg-white border ${
              openPriority ? "rounded-t-xl" : "rounded-xl"
            }`}
          >
            <span>{priority}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${openPriority ? "rotate-180" : ""}`} />
          </button>
          {openPriority && (
            <div className="absolute z-10 w-full bg-white rounded-b-xl border border-t-0">
              {(["High", "Medium", "Low"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setPriority(opt)
                    setOpenPriority(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-sky-100 rounded-xl"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status (optional) */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status (optional)</label>
          <select
            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            {[
              "Assigned",
              "Saved",
              "In Progress",
              "Applied",
              "Screen",
              "Interviewing",
              "Offer",
              "Withdrawn",
              "Rejected",
              "Accepted",
              ""
            ].map((s) => (
              <option key={s || "empty"} value={s}>
                {s || "— None —"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* <button
          onClick={handleComputeScore}
          disabled={computingScore || !jobDescription}
          className="w-full mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >Compute Score</button> */}

      <button
        onClick={sendToUser}
        disabled={!canSend || phase === "sending"}
        className="w-full mt-4 bg-gradient-to-r from-sky-200 via-sky-300 to-purple-200 hover:from-sky-300 hover:via-sky-400 hover:to-purple-300 border border-white text-gray-900 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
      >
        {phase === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {phase === "sending" ? "Sending..." : "Create Job for User"}
      </button>
    </div>
  )
}

export default JobScraperPanel