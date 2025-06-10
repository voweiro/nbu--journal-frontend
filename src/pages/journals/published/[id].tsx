"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Image from "next/image"
import Layout from "@/components/layout/Layout"
import Button from "@/components/ui/Button"
import Alert from "@/components/ui/Alert"
import Modal from "@/components/ui/Modal"
import { journalAPI } from "@/utils/api"
import { type Journal, UserRole } from "@/types"
import { useAuth } from "@/hooks/useAuth"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const PublishedJournalDetailPage: React.FC = () => {
  const router = useRouter()
  const { id } = router.query
  const { user, isAuthenticated } = useAuth()

  const [journal, setJournal] = useState<Journal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [isUnpublishing, setIsUnpublishing] = useState(false)

  // Fetch published journal details
  useEffect(() => {
    const fetchJournal = async () => {
      if (!id) return

      try {
        setIsLoading(true)
        setError(null)

        console.log(`Fetching published journal with ID: ${id}`)

        // Use the journalAPI utility to fetch the journal
        const { journal: fetchedJournal } = await journalAPI.getJournalById(Number(id))
        
        // Check if the journal is published
        if (fetchedJournal.status !== 'published') {
          throw new Error('This journal is not published yet')
        }
        
        // Use the fetched journal data directly
        const data = { journal: fetchedJournal }

        if (!data.journal) {
          throw new Error("Journal not found or invalid data received")
        }

        console.log("Journal data received:", data.journal)
        setJournal(data.journal)
      } catch (error) {
        console.error("Error fetching published journal:", error)
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load journal. The journal may not exist or may not be published yet."
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchJournal()
  }, [id])

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Check if user has permission to delete journals
  const canDeleteJournal = () => {
    if (!isAuthenticated || !user) return false
    // Only allow SUPER_ADMIN and ADMIN to delete journals
    return [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user.role)
  }

  // Handle journal deletion
  const handleDeleteJournal = async () => {
    if (!id) return

    try {
      setIsDeleting(true)
      setDeleteError(null)

      await journalAPI.deleteJournal(Number(id))

      toast.success("Journal deleted successfully")
      // Redirect to homepage after successful deletion
      router.push("/")
    } catch (error) {
      console.error("Error deleting journal:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete journal"
      setDeleteError(errorMessage)
      toast.error(errorMessage)
      setShowDeleteModal(false)
    } finally {
      setIsDeleting(false)
    }
  }
  
  // Handle journal unpublish/republish
  const handleUnpublishJournal = async () => {
    if (!id) return

    try {
      setIsUnpublishing(true)
      
      if (journal?.status === 'published') {
        // Unpublish the journal by setting its status to 'approved'
        await journalAPI.updateJournalStatus(Number(id), 'approved')
        toast.success("Journal unpublished successfully")
        
        // Update the journal status locally
        setJournal(prev => prev ? {...prev, status: 'approved'} : null)
        
        // Redirect to the regular journal page
        router.push(`/journals/${id}`)
      } else {
        // Republish the journal
        await journalAPI.publishJournal(Number(id), journal?.publication_number || '')
        toast.success("Journal republished successfully")
        
        // Update the journal status locally
        setJournal(prev => prev ? {...prev, status: 'published'} : null)
      }
      
    } catch (error) {
      console.error("Error unpublishing/republishing journal:", error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to unpublish/republish journal"
      toast.error(errorMessage)
    } finally {
      setIsUnpublishing(false)
    }
  }

  return (
    <Layout title={journal?.title || "Journal Details"} description="View published journal details" hideHero={true}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="container mx-auto px-4 py-6">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            router.push("/")
          }}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Journals
        </a>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : journal ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                    Published
                  </span>
                  <span className="ml-3 text-sm text-gray-500">ID: {journal.publication_number || "nbu" + id}</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{journal.title}</h1>

                <div className="flex items-center mt-4 border-t pt-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                      {journal.publisher_profile_picture ? (
                        <>
                          {typeof journal.publisher_profile_picture === "string" &&
                          journal.publisher_profile_picture.startsWith("{") ? (
                            <Image
                              src={
                                JSON.parse(journal.publisher_profile_picture).downloadLink ||
                                "/placeholder.svg?height=48&width=48"
                              }
                              alt={`${journal.publisher_first_name} ${journal.publisher_last_name}`}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Image
                              src={
                                journal.publisher_profile_picture.startsWith("http")
                                  ? journal.publisher_profile_picture
                                  : `/placeholder.svg?height=48&width=48`
                              }
                              alt={`${journal.publisher_first_name} ${journal.publisher_last_name}`}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-blue-100 text-blue-600 font-medium text-sm">
                          {journal.publisher_first_name?.charAt(0)}
                          {journal.publisher_last_name?.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium">Published by</p>
                    <p className="text-base font-semibold text-blue-600">
                      {journal.publisher_first_name} {journal.publisher_last_name}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-sm">
                      <span className="text-gray-500">Published:</span> {formatDate(journal.published_date)}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Submitted:</span> {formatDate(journal.created_at)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h2 className="text-xl font-semibold">Abstract</h2>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{journal.abstract}</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <h2 className="text-xl font-semibold">Authors</h2>
                </div>
                <p className="text-gray-700">{journal.author_names || "No authors listed"}</p>
              </div>

              {canDeleteJournal() && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-red-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Administrative Actions</h2>
                  <div className="flex flex-col md:flex-row gap-3">
                    <Button
                      variant="secondary"
                      onClick={handleUnpublishJournal}
                      disabled={isUnpublishing}
                      className={`w-full md:w-auto ${journal?.status === 'published' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={journal?.status === 'published' 
                            ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" 
                            : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"}
                        />
                      </svg>
                      {isUnpublishing 
                        ? "Processing..." 
                        : journal?.status === 'published' 
                          ? "Unpublish Journal" 
                          : "Republish Journal"}
                    </Button>
                    
                    <Button
                      variant="danger"
                      onClick={() => setShowDeleteModal(true)}
                      disabled={isDeleting}
                      className="w-full md:w-auto"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      {isDeleting ? "Deleting..." : "Delete Journal"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  <h2 className="text-xl font-semibold">Download Journal</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Access the full journal paper to read all the details and research findings.
                </p>
                <button
                  onClick={() => journalAPI.downloadJournal(journal.id)}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download PDF
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  <h2 className="text-xl font-semibold">Share Journal</h2>
                </div>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="w-full flex items-center justify-center px-4 py-3 border border-blue-600 text-blue-600 font-medium rounded-md hover:bg-blue-50 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Share Journal
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h2 className="text-xl font-semibold">Journal Information</h2>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Publication ID:</span>
                    <span className="font-medium">{journal.publication_number || "nbu" + id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 font-medium">Published</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Published:</span>
                    <span className="font-medium">{formatDate(journal.published_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submitted:</span>
                    <span className="font-medium">{formatDate(journal.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Alert variant="danger">The requested journal could not be found.</Alert>
        )}

        {/* Delete Confirmation Modal */}
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Journal">
          <div className="space-y-4">
            <p className="text-gray-700">Are you sure you want to delete this journal? This action cannot be undone.</p>

            {deleteError && <Alert variant="danger">{deleteError}</Alert>}

            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteJournal} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Share Journal Modal */}
        <Modal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false)
            setCopySuccess(false)
          }}
          title="Share Journal"
        >
          <div className="space-y-6">
            <div>
              <p className="text-gray-700 mb-2">
                Share this link with others to give them direct access to this journal:
              </p>
              <div className="flex items-center">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== "undefined" ? window.location.href : ""}
                  className="flex-grow p-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => {
                    if (typeof navigator !== "undefined") {
                      navigator.clipboard.writeText(window.location.href)
                      setCopySuccess(true)
                      setTimeout(() => setCopySuccess(false), 3000)
                    }
                  }}
                  className="p-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {copySuccess ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {copySuccess && <p className="text-green-600 text-sm mt-1">Link copied to clipboard!</p>}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-gray-700 mb-3">Share on social media:</p>
              <div className="flex space-x-4">
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&text=${encodeURIComponent(journal?.title || "Check out this academic journal")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-400 text-white hover:bg-blue-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(journal?.title || "Academic Journal Recommendation")}&body=${encodeURIComponent(`I thought you might be interested in this academic journal: ${journal?.title || "Check out this journal"}\n\n${typeof window !== "undefined" ? window.location.href : ""}`)}`}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() => {
                  setShowShareModal(false)
                  setCopySuccess(false)
                }}
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}

export default PublishedJournalDetailPage
