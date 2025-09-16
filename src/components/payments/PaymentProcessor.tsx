import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Lock, CheckCircle, AlertCircle, DollarSign, Calendar, User } from 'lucide-react';
import { paymentApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface PaymentProcessorProps {
  booking: {
    id: string;
    subject: string;
    sessionDate: string;
    duration: number;
    tutorName: string;
    amount: number;
    currency?: string;
  };
  onPaymentSuccess: (payment: any) => void;
  onPaymentError: (error: string) => void;
}

export const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  booking,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [step, setStep] = useState<'details' | 'processing' | 'success' | 'error'>('details');
  const { toast } = useToast();

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardDetails(prev => ({ ...prev, number: formatted }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setCardDetails(prev => ({ ...prev, expiry: formatted }));
  };

  const handlePayment = async () => {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc || !cardDetails.name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all card details",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setStep('processing');

    try {
      // Create payment intent
      const paymentIntentResponse = await paymentApi.createPaymentIntent(
        booking.id,
        booking.amount,
        booking.currency || 'usd'
      );

      if (!paymentIntentResponse.success) {
        throw new Error('Failed to create payment intent');
      }

      // Simulate payment processing (replace with actual Stripe integration)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Confirm payment
      const confirmResponse = await paymentApi.confirmPayment(
        paymentIntentResponse.paymentIntent.id
      );

      if (confirmResponse.success) {
        setStep('success');
        onPaymentSuccess(confirmResponse.payment);
        toast({
          title: "Payment Successful!",
          description: "Your session has been confirmed and payment processed.",
        });
      } else {
        throw new Error('Payment confirmation failed');
      }

    } catch (error) {
      console.error('Payment error:', error);
      setStep('error');
      onPaymentError(error instanceof Error ? error.message : 'Payment failed');
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : 'Payment could not be processed',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentDetails = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <Label className="text-lg font-semibold">Payment Details</Label>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="card-number">Card Number</Label>
            <Input
              id="card-number"
              placeholder="1234 5678 9012 3456"
              value={cardDetails.number}
              onChange={handleCardNumberChange}
              maxLength={19}
              className="mt-1"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={cardDetails.expiry}
                onChange={handleExpiryChange}
                maxLength={5}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                placeholder="123"
                value={cardDetails.cvc}
                onChange={(e) => setCardDetails(prev => ({ ...prev, cvc: e.target.value }))}
                maxLength={4}
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="card-name">Cardholder Name</Label>
            <Input
              id="card-name"
              placeholder="John Doe"
              value={cardDetails.name}
              onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Lock className="h-5 w-5 text-green-600" />
          <span className="text-sm text-muted-foreground">
            Your payment information is encrypted and secure
          </span>
        </div>
        
        <Button 
          onClick={handlePayment}
          className="w-full"
          size="lg"
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Pay ${booking.amount.toFixed(2)}
        </Button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center space-y-4 py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <div>
        <h3 className="text-lg font-semibold">Processing Payment</h3>
        <p className="text-muted-foreground">Please wait while we process your payment...</p>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-4 py-8">
      <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
      <div>
        <h3 className="text-lg font-semibold text-green-600">Payment Successful!</h3>
        <p className="text-muted-foreground">Your session has been confirmed and payment processed.</p>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="text-center space-y-4 py-8">
      <AlertCircle className="h-16 w-16 text-red-600 mx-auto" />
      <div>
        <h3 className="text-lg font-semibold text-red-600">Payment Failed</h3>
        <p className="text-muted-foreground">There was an error processing your payment. Please try again.</p>
      </div>
      <Button onClick={() => setStep('details')} variant="outline">
        Try Again
      </Button>
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Payment</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Booking Summary */}
        <div className="mb-6 p-4 bg-muted rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Subject:</span>
            <Badge variant="secondary">{booking.subject}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Tutor:</span>
            <span className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {booking.tutorName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Session Date:</span>
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(booking.sessionDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Duration:</span>
            <span>{booking.duration} minutes</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total Amount:</span>
            <span className="text-primary">${booking.amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Steps */}
        {step === 'details' && renderPaymentDetails()}
        {step === 'processing' && renderProcessing()}
        {step === 'success' && renderSuccess()}
        {step === 'error' && renderError()}
      </CardContent>
    </Card>
  );
};
