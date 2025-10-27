import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, LogOut, Mail, MessageSquare, ShieldAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function ApprovalPending() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  // Redirect admins immediately since they don't need approval
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      navigate('/admin/dashboard')
      return
    }
  }, [user, navigate])

  // Redirect to dashboard if user is already approved
  useEffect(() => {
    if (user?.status === 'ACTIVE') {
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : 
              user.role === 'TUTOR' ? '/tutor/dashboard' : 
              '/student/dashboard')
    }
  }, [user, navigate])

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@tutorspool.com?subject=Account%20Approval%20Inquiry'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-yellow-500" />
            <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
          </div>
          <CardDescription>
            Your account is currently under review by our admin team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>What's next?</AlertTitle>
            <AlertDescription className="mt-2">
              Our team is reviewing your registration. You'll receive an email once your account is approved.
              This process usually takes 1-2 business days.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>Email: {user?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>Status: Pending Admin Approval</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 pt-4">
            <Button 
              variant="default" 
              onClick={handleContactSupport}
              className="w-full"
            >
              <Mail className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
