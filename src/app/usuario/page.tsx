"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageCropper } from "@/components/image-cropper"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { getJobTypeColor, getEventTypeColor } from "@/lib/color-utils"

// Custom hooks
import { useUsuarioData } from "@/hooks/usuario/useUsuarioData"
import { useProfileManagement } from "@/hooks/usuario/useProfileManagement"
import { useRegistration } from "@/hooks/usuario/useRegistration"

// Components
import { UsuarioHeader } from "@/components/usuario/UsuarioHeader"
import { DashboardCards } from "@/components/usuario/DashboardCards"
import { SearchAndControls } from "@/components/usuario/SearchAndControls"
import { ProceduresDisplay } from "@/components/usuario/ProceduresDisplay"
import { JobsDisplay } from "@/components/usuario/JobsDisplay"
import { EventsDisplay } from "@/components/usuario/EventsDisplay"

import { ProfileModal } from "@/components/usuario/ProfileModal"
import { ContentModal } from "@/components/usuario/ContentModal"


// Types
import { Procedure, Job, Event } from "@/types/usuario"

export default function UsuarioPage() {
  const router = useRouter()
  const { user, logout, loading: authLoading, authChecked } = useAuth()
  const { toast } = useToast()
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Efeito para detectar transição de login e evitar flash de mensagem
  useEffect(() => {
    // Check if login is in progress
    const loginInProgress = sessionStorage.getItem('loginInProgress') === 'true'
    
    // Se estamos carregando autenticação ou login está em progresso, mostramos loading
    if (authLoading || loginInProgress) {
      setIsTransitioning(true)
      return
    }
    
    // Se a autenticação foi verificada e temos um usuário, terminamos a transição
    if (authChecked && user) {
      setIsTransitioning(false)
      // Clear any lingering login flags
      sessionStorage.removeItem('loginInProgress')
      return
    }
    
    // Se a autenticação foi verificada e não temos usuário, mas estávamos em transição,
    // damos um tempo para o redirecionamento acontecer
    if (authChecked && !user && !authLoading) {
      const timer = setTimeout(() => {
        setIsTransitioning(false)
        // Clear login flags if we end up here
        sessionStorage.removeItem('loginInProgress')
      }, 1000) // Pequeno delay para permitir redirecionamento
      
      return () => clearTimeout(timer)
    }
  }, [user, authLoading, authChecked])

  // Cleanup effect to clear login flags when component unmounts
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('loginInProgress')
    }
  }, [])

  // Custom hooks
  const {
    loading,
    procedures,
    jobs,
    events,
    registeredJobs,
    registeredEvents,
    sectors,
    setRegisteredJobs,
    setRegisteredEvents
  } = useUsuarioData()

  const profileManagement = useProfileManagement()
  const {
    loadingActions,
    registerForJob,
    unregisterFromJob,
    registerForEvent,
    unregisterFromEvent
  } = useRegistration()

  // Local state
  const [activeTab, setActiveTab] = useState("procedimentos")
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards")
  const [showContentModal, setShowContentModal] = useState(false)
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null)

  // Filter functions
  const filteredProcedures = procedures.filter(procedure => 
    procedure.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    procedure.content.toLowerCase().includes(searchTerm.toLowerCase())
  )



  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Modal handlers
  const openContentModal = (procedure: Procedure) => {
    setSelectedProcedure(procedure)
    setShowContentModal(true)
  }

  const closeContentModal = () => {
    setShowContentModal(false)
    setSelectedProcedure(null)
  }



  // Registration handlers
  const handleRegisterForJob = (jobId: string) => {
    registerForJob(jobId, () => {
      setRegisteredJobs([...registeredJobs, jobId])
    })
  }

  const handleUnregisterFromJob = (jobId: string) => {
    unregisterFromJob(jobId, () => {
      setRegisteredJobs(registeredJobs.filter(id => id !== jobId))
    })
  }

  const handleRegisterForEvent = (eventId: string) => {
    registerForEvent(eventId, () => {
      setRegisteredEvents([...registeredEvents, eventId])
    })
  }

  const handleUnregisterFromEvent = (eventId: string) => {
    unregisterFromEvent(eventId, () => {
      setRegisteredEvents(registeredEvents.filter(id => id !== eventId))
    })
  }

  // Show loading only while auth is being checked for the first time
  if (authLoading && !authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Show loading state while data is being fetched, but show header
  if (user && authChecked && loading) {
    return (
      <div className="min-h-screen bg-background">
        <UsuarioHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <UsuarioHeader
        photoRemoved={profileManagement.photoRemoved}
        latestPhotoUrl={profileManagement.latestPhotoUrl}
        profileForm={profileManagement.profileForm}
        openProfileModal={profileManagement.openProfileModal}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileManagement.showProfileModal}
        onClose={() => profileManagement.setShowProfileModal(false)}
        profileForm={profileManagement.profileForm}
        setProfileForm={profileManagement.setProfileForm}
        sectors={sectors}
        isUpdatingProfile={profileManagement.isUpdatingProfile}
        onPhotoChange={profileManagement.handlePhotoChange}
        onRemovePhoto={profileManagement.removePhoto}
        onUpdateProfile={profileManagement.updateProfile}
      />

      {/* Image Cropper Modal */}
      {profileManagement.showImageCropper && profileManagement.imageToCrop && (
        <ImageCropper
          imageSrc={profileManagement.imageToCrop}
          onCropComplete={profileManagement.handleCropComplete}
          onCancel={profileManagement.handleCropCancel}
          aspect={1}
          circular={true}
        />
      )}

      {/* Content Viewer Modal */}
      <ContentModal
        isOpen={showContentModal}
        onClose={closeContentModal}
        selectedProcedure={selectedProcedure}
      />



      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Seu Painel</h2>
          <p className="text-muted-foreground">
            Acesse procedimentos, vagas e eventos disponíveis para você.
          </p>
        </div>

        {/* Dashboard Cards */}
        <DashboardCards
          procedures={procedures}
          jobs={jobs}
          events={events}
          filteredProcedures={filteredProcedures}
          filteredJobs={filteredJobs}
          filteredEvents={filteredEvents}
          onTabChange={setActiveTab}
        />

        {/* Search Bar */}
        <SearchAndControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="procedimentos">Procedimentos</TabsTrigger>
              <TabsTrigger value="vagas">Vagas</TabsTrigger>
              <TabsTrigger value="eventos">Eventos</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="procedimentos" className="space-y-4">
            <ProceduresDisplay
              procedures={filteredProcedures}
              viewMode={viewMode}
              onOpenContentModal={openContentModal}
            />
          </TabsContent>

          <TabsContent value="vagas" className="space-y-4">
            <JobsDisplay
              jobs={filteredJobs}
              viewMode={viewMode}
              registeredJobs={registeredJobs}
              loadingActions={loadingActions}
              onRegister={handleRegisterForJob}
              onUnregister={handleUnregisterFromJob}
            />
          </TabsContent>

          <TabsContent value="eventos" className="space-y-4">
            <EventsDisplay
              events={filteredEvents}
              viewMode={viewMode}
              registeredEvents={registeredEvents}
              loadingActions={loadingActions}
              onRegister={handleRegisterForEvent}
              onUnregister={handleUnregisterFromEvent}
            />
          </TabsContent>


        </Tabs>
      </main>
    </div>
  )
}