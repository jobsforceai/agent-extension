import { X } from "lucide-react"
import React, { useState, useEffect } from "react"
import logo from "~assets/jobsforce_logo.jpeg"
import { useAuthStore } from "~stores/authStore"
import { agentAPI } from "~services/agentAPI"
import JobScraperPanel from "~components/JobScraperPanel"

interface User {
  userId: string
  name: string
}

interface OverlayProps {
  closeOverlay: () => void
  isAutoOpened?: boolean
  isSupported: boolean
}

const Overlay: React.FC<OverlayProps> = ({
  closeOverlay,
  isAutoOpened = false,
  isSupported
}) => {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { logout, isAuthenticated, initializeAuth } = useAuthStore()
  const [manualTokenInp, setManualTokenInp] = useState("")
  const [tokenMessage, setTokenMessage] = useState("")

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const list = await agentAPI.getAssignedUsers()
        setUsers(list)
      } catch (err: any) {
        setError(err?.message || "Failed to fetch users")
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) fetchUsers()
  }, [isAuthenticated])

  const handleLogout = () => {
    logout()
  }

  const handleSaveToken = () => {
    if (manualTokenInp.trim()) {
      chrome.storage.local.set({ authToken: manualTokenInp.trim() }, () => {
        initializeAuth() // Re-check auth status
        setTokenMessage("Token saved successfully! Refreshing...")
      })
    } else {
      setTokenMessage("Please enter a token.")
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed top-4 right-4 z-[10000] flex items-start justify-end">
        <div className="bg-white rounded-[25px] w-[300px] min-w-[400px] max-w-[70vw] max-h-[640px] relative shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <div className="flex items-center">
              <img src={logo} alt="logo" className="h-8 w-8 flex-shrink-0" />
              <h1 className="text-[#333] text-lg font-bold bg-clip-text font-sans pl-2 truncate">
                Jobsforce
              </h1>
            </div>
            <button onClick={closeOverlay}>
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-8 font-sans">
            <div className="text-center flex flex-col">
              <div>
                <img
                  src={logo}
                  alt="Jobsforce Logo"
                  className="h-16 w-16 mb-2 mx-auto"
                />
                <h2 className="text-xl font-bold text-black mb-2">
                  Welcome to Jobsforce
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Please log in to access your profile and start applying to jobs
                </p>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">
                  Or enter your token directly:
                </p>
                <div className="flex items-center justify-center">
                  <input
                    type="text"
                    value={manualTokenInp}
                    onChange={(e) => setManualTokenInp(e.target.value)}
                    placeholder="Enter auth token"
                    className="border rounded-l-md px-2 py-1 text-sm w-48"
                  />
                  <button
                    onClick={handleSaveToken}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-3 py-1 rounded-r-md text-sm"
                  >
                    Save
                  </button>
                </div>
                {tokenMessage && (
                  <p className="text-xs text-green-600 mt-1">
                    {tokenMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-[10000] flex items-start justify-end">
      <div className="bg-white rounded-[25px] w-[300px] min-w-[400px] max-w-[70vw] max-h-[640px] relative shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center">
            <img src={logo} alt="logo" className="h-8 w-8 flex-shrink-0" />
            <h1 className="text-[#333] text-lg font-bold bg-clip-text font-sans pl-2 truncate">
              Jobsforce
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700 focus:outline-none"
            >
              Logout
            </button>
            <button onClick={closeOverlay}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading && <p>Loading users...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

          {selectedUser ? (
            <JobScraperPanel
              userId={selectedUser.userId}
              onBack={() => setSelectedUser(null)}
            />
          ) : (
            !loading &&
            !error &&
            users.map((user) => (
              <button
                key={user.userId}
                className="w-full p-2 text-left border-b border-gray-100 hover:bg-sky-50 rounded-md"
                onClick={() => setSelectedUser(user)}
              >
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-[11px] text-gray-500">User ID: {user.userId}</div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Overlay
