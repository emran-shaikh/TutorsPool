import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  DollarSign, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Users, 
  Calendar,
  RefreshCw,
  Download,
  Eye,
  Check,
  X
} from 'lucide-react';
import { paymentApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Payment {
  id: string;
  bookingId: string;
  studentId: string;
  tutorId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  metadata: {
    subject: string;
    sessionDate: string;
    platformFee: number;
    tutorAmount: number;
  };
}

interface Payout {
  id: string;
  paymentId: string;
  tutorId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  holdUntil: string;
  paidAt?: string;
  metadata: {
    platformFee: number;
    subject: string;
    sessionDate: string;
  };
}

interface Dispute {
  id: string;
  paymentId: string;
  studentId: string;
  tutorId: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
  adminNotes?: string;
  resolution?: string;
}

interface Analytics {
  totalRevenue: number;
  totalPayouts: number;
  platformFees: number;
  pendingPayouts: number;
  openDisputes: number;
  paymentCount: number;
  payoutCount: number;
  disputeCount: number;
  averagePaymentAmount: number;
  successRate: number;
}

export const AdminPaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [disputeNotes, setDisputeNotes] = useState('');
  const [disputeResolution, setDisputeResolution] = useState('');
  const [disputeStatus, setDisputeStatus] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const [paymentsResponse, payoutsResponse, disputesResponse, analyticsResponse] = await Promise.all([
        paymentApi.getAllPayments(),
        paymentApi.getAllPayouts(),
        paymentApi.getAllDisputes(),
        paymentApi.getPaymentAnalytics()
      ]);

      if (paymentsResponse.success) {
        setPayments(paymentsResponse.payments || []);
      }

      if (payoutsResponse.success) {
        setPayouts(payoutsResponse.payouts || []);
      }

      if (disputesResponse.success) {
        setDisputes(disputesResponse.disputes || []);
      }

      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.analytics);
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payment data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPaymentData();
    setRefreshing(false);
  };

  const handleProcessPayout = async (payoutId: string) => {
    try {
      const response = await paymentApi.processPayout(payoutId);
      
      if (response.success) {
        toast({
          title: "Payout Processed",
          description: "The payout has been successfully processed.",
        });
        await fetchPaymentData(); // Refresh data
      } else {
        throw new Error('Failed to process payout');
      }
    } catch (error) {
      console.error('Error processing payout:', error);
      toast({
        title: "Error",
        description: "Failed to process payout",
        variant: "destructive"
      });
    }
  };

  const handleDisputeResolution = async () => {
    if (!selectedDispute || !disputeStatus) return;

    try {
      const response = await paymentApi.handleDispute(
        selectedDispute.id,
        disputeStatus,
        disputeNotes,
        disputeResolution
      );
      
      if (response.success) {
        toast({
          title: "Dispute Resolved",
          description: "The dispute has been successfully resolved.",
        });
        setDisputeDialogOpen(false);
        setSelectedDispute(null);
        setDisputeNotes('');
        setDisputeResolution('');
        setDisputeStatus('');
        await fetchPaymentData(); // Refresh data
      } else {
        throw new Error('Failed to resolve dispute');
      }
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast({
        title: "Error",
        description: "Failed to resolve dispute",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'REFUNDED':
        return <Badge className="bg-blue-100 text-blue-800">Refunded</Badge>;
      case 'DISPUTED':
      case 'OPEN':
        return <Badge className="bg-orange-100 text-orange-800">Disputed</Badge>;
      case 'ON_HOLD':
        return <Badge className="bg-purple-100 text-purple-800">On Hold</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const exportData = (type: 'payments' | 'payouts' | 'disputes') => {
    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'payments':
        csvContent = [
          ['Date', 'Student ID', 'Tutor ID', 'Subject', 'Amount', 'Status', 'Session Date'].join(','),
          ...payments.map(payment => [
            new Date(payment.createdAt).toLocaleDateString(),
            payment.studentId,
            payment.tutorId,
            payment.metadata.subject,
            `$${payment.amount.toFixed(2)}`,
            payment.status,
            new Date(payment.metadata.sessionDate).toLocaleDateString()
          ].join(','))
        ].join('\n');
        filename = `payments-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'payouts':
        csvContent = [
          ['Date', 'Tutor ID', 'Amount', 'Status', 'Subject', 'Session Date'].join(','),
          ...payouts.map(payout => [
            new Date(payout.createdAt).toLocaleDateString(),
            payout.tutorId,
            `$${payout.amount.toFixed(2)}`,
            payout.status,
            payout.metadata.subject,
            new Date(payout.metadata.sessionDate).toLocaleDateString()
          ].join(','))
        ].join('\n');
        filename = `payouts-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'disputes':
        csvContent = [
          ['Date', 'Student ID', 'Tutor ID', 'Reason', 'Status', 'Resolution'].join(','),
          ...disputes.map(dispute => [
            new Date(dispute.createdAt).toLocaleDateString(),
            dispute.studentId,
            dispute.tutorId,
            dispute.reason,
            dispute.status,
            dispute.resolution || 'N/A'
          ].join(','))
        ].join('\n');
        filename = `disputes-${new Date().toISOString().split('T')[0]}.csv`;
        break;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-48">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From {analytics.paymentCount} payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.platformFees.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {((analytics.platformFees / analytics.totalRevenue) * 100).toFixed(1)}% of revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.pendingPayouts.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Disputes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.openDisputes}</div>
              <p className="text-xs text-muted-foreground">
                Requiring attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Management Interface */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold flex items-center">
            <CreditCard className="mr-2 h-6 w-6" />
            Payment Management
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="payments" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
              <TabsTrigger value="payouts">Payouts ({payouts.length})</TabsTrigger>
              <TabsTrigger value="disputes">Disputes ({disputes.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="payments" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">All Payments</h3>
                <Button variant="outline" size="sm" onClick={() => exportData('payments')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
              <div className="space-y-4">
                {payments.map((payment) => (
                  <Card key={payment.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{payment.metadata.subject}</Badge>
                          {getStatusBadge(payment.status)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Student: {payment.studentId}</span>
                          <span>Tutor: {payment.tutorId}</span>
                          <span>Session: {new Date(payment.metadata.sessionDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          ${payment.amount.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Fee: ${payment.metadata.platformFee.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="payouts" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">All Payouts</h3>
                <Button variant="outline" size="sm" onClick={() => exportData('payouts')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
              <div className="space-y-4">
                {payouts.map((payout) => (
                  <Card key={payout.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{payout.metadata.subject}</Badge>
                          {getStatusBadge(payout.status)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Tutor: {payout.tutorId}</span>
                          <span>Session: {new Date(payout.metadata.sessionDate).toLocaleDateString()}</span>
                          <span>Created: {new Date(payout.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            ${payout.amount.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Fee: ${payout.metadata.platformFee.toFixed(2)}
                          </div>
                        </div>
                        {payout.status === 'PENDING' && (
                          <Button
                            size="sm"
                            onClick={() => handleProcessPayout(payout.id)}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Process
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="disputes" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">All Disputes</h3>
                <Button variant="outline" size="sm" onClick={() => exportData('disputes')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
              <div className="space-y-4">
                {disputes.map((dispute) => (
                  <Card key={dispute.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                          <span className="font-medium">Dispute #{dispute.id.slice(-8)}</span>
                          {getStatusBadge(dispute.status)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Student: {dispute.studentId}</span>
                          <span>Tutor: {dispute.tutorId}</span>
                          <span>Payment: {dispute.paymentId}</span>
                          <span>Created: {new Date(dispute.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Reason:</span> {dispute.reason}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Description:</span> {dispute.description}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Dialog open={disputeDialogOpen} onOpenChange={setDisputeDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedDispute(dispute);
                                setDisputeNotes(dispute.adminNotes || '');
                                setDisputeResolution(dispute.resolution || '');
                                setDisputeStatus(dispute.status);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Resolve
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Resolve Dispute</DialogTitle>
                              <DialogDescription>
                                Review and resolve the payment dispute.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={disputeStatus} onValueChange={setDisputeStatus}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                                    <SelectItem value="CLOSED">Closed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="resolution">Resolution</Label>
                                <Select value={disputeResolution} onValueChange={setDisputeResolution}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select resolution" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="STUDENT_WINS">Student Wins</SelectItem>
                                    <SelectItem value="TUTOR_WINS">Tutor Wins</SelectItem>
                                    <SelectItem value="PARTIAL_REFUND">Partial Refund</SelectItem>
                                    <SelectItem value="NO_ACTION">No Action</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="notes">Admin Notes</Label>
                                <Textarea
                                  id="notes"
                                  value={disputeNotes}
                                  onChange={(e) => setDisputeNotes(e.target.value)}
                                  placeholder="Add admin notes..."
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleDisputeResolution}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Resolve Dispute
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
