import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, DollarSign, Calendar, User, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import { paymentApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Payment {
  id: string;
  bookingId: string;
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

interface Dispute {
  id: string;
  paymentId: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
  adminNotes?: string;
  resolution?: string;
}

export const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const [paymentsResponse, disputesResponse] = await Promise.all([
        paymentApi.getStudentPayments(),
        paymentApi.getStudentDisputes()
      ]);

      if (paymentsResponse.success) {
        setPayments(paymentsResponse.payments || []);
      }

      if (disputesResponse.success) {
        setDisputes(disputesResponse.disputes || []);
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payment history",
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

  const handleRequestRefund = async (paymentId: string) => {
    try {
      const reason = prompt('Please provide a reason for the refund request:');
      if (!reason) return;

      const response = await paymentApi.requestRefund(paymentId, reason);
      
      if (response.success) {
        toast({
          title: "Refund Requested",
          description: "Your refund request has been submitted and will be reviewed.",
        });
        await fetchPaymentData(); // Refresh data
      } else {
        throw new Error('Failed to request refund');
      }
    } catch (error) {
      console.error('Error requesting refund:', error);
      toast({
        title: "Error",
        description: "Failed to request refund",
        variant: "destructive"
      });
    }
  };

  const handleCreateDispute = async (paymentId: string) => {
    try {
      const reason = prompt('Please provide a reason for the dispute:');
      if (!reason) return;

      const description = prompt('Please provide additional details about the dispute:');
      if (!description) return;

      const response = await paymentApi.createDispute(paymentId, reason, description);
      
      if (response.success) {
        toast({
          title: "Dispute Created",
          description: "Your dispute has been submitted and will be reviewed by our team.",
        });
        await fetchPaymentData(); // Refresh data
      } else {
        throw new Error('Failed to create dispute');
      }
    } catch (error) {
      console.error('Error creating dispute:', error);
      toast({
        title: "Error",
        description: "Failed to create dispute",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'REFUNDED':
        return <Badge className="bg-blue-100 text-blue-800">Refunded</Badge>;
      case 'DISPUTED':
        return <Badge className="bg-orange-100 text-orange-800">Disputed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDisputeStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'OPEN':
        return <Badge className="bg-red-100 text-red-800">Open</Badge>;
      case 'UNDER_REVIEW':
        return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
      case 'RESOLVED':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'CLOSED':
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const exportPayments = () => {
    const csvContent = [
      ['Date', 'Subject', 'Amount', 'Status', 'Session Date'].join(','),
      ...payments.map(payment => [
        new Date(payment.createdAt).toLocaleDateString(),
        payment.metadata.subject,
        `$${payment.amount.toFixed(2)}`,
        payment.status,
        new Date(payment.metadata.sessionDate).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
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
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold flex items-center">
          <CreditCard className="mr-2 h-6 w-6" />
          Payment History
        </CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportPayments}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="payments" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
            <TabsTrigger value="disputes">Disputes ({disputes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="mt-4">
            {payments.length > 0 ? (
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
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ${payment.amount.toFixed(2)}
                          </span>
                          <span>Session: {new Date(payment.metadata.sessionDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {payment.status === 'COMPLETED' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRequestRefund(payment.id)}
                            >
                              Request Refund
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCreateDispute(payment.id)}
                            >
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Dispute
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Payments Yet</h3>
                <p className="text-muted-foreground">Your payment history will appear here once you book sessions.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="disputes" className="mt-4">
            {disputes.length > 0 ? (
              <div className="space-y-4">
                {disputes.map((dispute) => (
                  <Card key={dispute.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                          <span className="font-medium">Dispute #{dispute.id.slice(-8)}</span>
                          {getDisputeStatusBadge(dispute.status)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(dispute.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">Reason:</span>
                          <p className="text-sm text-muted-foreground">{dispute.reason}</p>
                        </div>
                        <div>
                          <span className="font-medium">Description:</span>
                          <p className="text-sm text-muted-foreground">{dispute.description}</p>
                        </div>
                        {dispute.adminNotes && (
                          <div>
                            <span className="font-medium">Admin Response:</span>
                            <p className="text-sm text-muted-foreground">{dispute.adminNotes}</p>
                          </div>
                        )}
                        {dispute.resolution && (
                          <div>
                            <span className="font-medium">Resolution:</span>
                            <p className="text-sm text-muted-foreground">{dispute.resolution}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Disputes</h3>
                <p className="text-muted-foreground">You haven't created any payment disputes yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
