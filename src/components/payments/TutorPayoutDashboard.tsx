import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Calendar, Clock, CheckCircle, AlertCircle, RefreshCw, TrendingUp, Wallet } from 'lucide-react';
import { paymentApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Payout {
  id: string;
  paymentId: string;
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
  reason: string;
  status: string;
  createdAt: string;
  adminNotes?: string;
  resolution?: string;
}

export const TutorPayoutDashboard: React.FC = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayoutData();
  }, []);

  const fetchPayoutData = async () => {
    try {
      setLoading(true);
      const [payoutsResponse, disputesResponse] = await Promise.all([
        paymentApi.getTutorPayouts(),
        paymentApi.getTutorDisputes()
      ]);

      if (payoutsResponse.success) {
        setPayouts(payoutsResponse.payouts || []);
      }

      if (disputesResponse.success) {
        setDisputes(disputesResponse.disputes || []);
      }
    } catch (error) {
      console.error('Error fetching payout data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payout information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPayoutData();
    setRefreshing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'ON_HOLD':
        return <Badge className="bg-orange-100 text-orange-800">On Hold</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
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

  const calculateStats = () => {
    const totalEarnings = payouts
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingEarnings = payouts
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPayouts = payouts.length;
    const paidPayouts = payouts.filter(p => p.status === 'PAID').length;

    const openDisputes = disputes.filter(d => d.status === 'OPEN').length;

    return {
      totalEarnings,
      pendingEarnings,
      totalPayouts,
      paidPayouts,
      openDisputes,
      successRate: totalPayouts > 0 ? (paidPayouts / totalPayouts) * 100 : 0
    };
  };

  const isOnHold = (payout: Payout) => {
    return new Date(payout.holdUntil) > new Date();
  };

  const getDaysUntilPayout = (payout: Payout) => {
    const holdUntil = new Date(payout.holdUntil);
    const now = new Date();
    const diffTime = holdUntil.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
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

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {stats.paidPayouts} completed sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pendingEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {payouts.filter(p => p.status === 'PENDING').length} sessions pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
            <Progress value={stats.successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Disputes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openDisputes}</div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold flex items-center">
            <Wallet className="mr-2 h-6 w-6" />
            Payout Dashboard
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="payouts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="payouts">Payouts ({payouts.length})</TabsTrigger>
              <TabsTrigger value="disputes">Disputes ({disputes.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="payouts" className="mt-4">
              {payouts.length > 0 ? (
                <div className="space-y-4">
                  {payouts.map((payout) => (
                    <Card key={payout.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">{payout.metadata.subject}</Badge>
                            {getStatusBadge(payout.status)}
                            {isOnHold(payout) && (
                              <Badge className="bg-blue-100 text-blue-800">
                                Hold: {getDaysUntilPayout(payout)} days
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Session: {new Date(payout.metadata.sessionDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              ${payout.amount.toFixed(2)}
                            </span>
                            <span>
                              Platform Fee: ${payout.metadata.platformFee.toFixed(2)}
                            </span>
                          </div>
                          {payout.paidAt && (
                            <div className="text-sm text-green-600">
                              <CheckCircle className="h-4 w-4 inline mr-1" />
                              Paid on {new Date(payout.paidAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            ${payout.amount.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {payout.currency.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Payouts Yet</h3>
                  <p className="text-muted-foreground">Your payout history will appear here once students pay for sessions.</p>
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
                            <AlertCircle className="h-5 w-5 text-orange-600" />
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
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Disputes</h3>
                  <p className="text-muted-foreground">You don't have any payment disputes at this time.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
