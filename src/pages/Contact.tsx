import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Send,
  User,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const Contact: React.FC = () => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    messageType: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Simulate form submission
    toast({
      title: 'Message sent successfully!',
      description: 'We\'ll get back to you within 24 hours.',
    });

    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      messageType: '',
      message: ''
    });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone Support',
      details: ['+92 345 3284 284', '+92 300 9271 976'],
      description: 'Mon-Fri 9AM-6PM EST'
    },
    {
      icon: Mail,
      title: 'Email Support',
      details: ['info@tutorspool.com', 'help@tutorspool.com'],
      description: '24/7 email support'
    },
    {
      icon: MapPin,
      title: 'Office Address',
      details: ['Karachi', 'Pakistan'],
      description: 'Visit us Monday-Friday'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Header variant="transparent" />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
             Get in <span className="text-[#2c2e71]">Touch</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
             We're here to help! Reach out with any questions, concerns, or feedback.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <MessageCircle className="h-6 w-6 mr-2 text-[#2c2e71]" />
                    Send us a Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="What's this about?"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="messageType">Message Type</Label>
                      <Select value={formData.messageType} onValueChange={(value) => setFormData({ ...formData, messageType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select message type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="tutor">Become a Tutor</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us how we can help you..."
                      />
                    </div>
                    
                    <Button type="submit" className="btn-gradient-primary w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <p className="text-gray-600 mb-8">
                  We're here to help you succeed. Whether you have questions about our services, 
                  need technical support, or want to become a tutor, we're just a message away.
                </p>
              </div>

              {contactInfo.map((info, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-lg">
                        <info.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{info.title}</h3>
                        <div className="space-y-1 mb-2">
                          {info.details.map((detail, i) => (
                            <p key={i} className="text-gray-700">{detail}</p>
                          ))}
                        </div>
                        <p className="text-sm text-gray-500">{info.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Social Media */}
              <Card className="bg-gradient-to-r from-blue-50 to-green-50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
                  <div className="flex space-x-4">
                    <Facebook className="h-6 w-6 text-blue-600 hover:text-blue-800 cursor-pointer transition-colors" />
                    <Twitter className="h-6 w-6 text-sky-500 hover:text-sky-700 cursor-pointer transition-colors" />
                    <Instagram className="h-6 w-6 text-pink-600 hover:text-pink-800 cursor-pointer transition-colors" />
                    <Linkedin className="h-6 w-6 text-blue-700 hover:text-blue-900 cursor-pointer transition-colors" />
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Stay updated with our latest news and announcements.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Quick answers to common questions
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              {[
                {
                  question: 'How quickly can I book a session?',
                  answer: 'You can book sessions instantly! Most tutors are available within 24-48 hours.'
                },
                {
                  question: 'What subjects do you cover?',
                  answer: 'We cover all major academic subjects from elementary to graduate level, plus test prep and specialized topics.'
                },
                {
                  question: 'Can I cancel or reschedule sessions?',
                  answer: 'Yes, you can cancel or reschedule sessions up to 24 hours before the scheduled time.'
                }
              ].map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-6">
              {[
                {
                  question: 'How do I become a tutor?',
                  answer: 'Apply through our tutor application form. We\'ll review your qualifications and schedule an interview.'
                },
                {
                  question: 'What is your satisfaction guarantee?',
                  answer: 'If you\'re not satisfied with your session, we\'ll provide a full refund or arrange a new tutor.'
                },
                {
                  question: 'Do you offer group sessions?',
                  answer: 'Yes! We offer group tutoring sessions at discounted rates for friends studying together.'
                }
              ].map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#F47B2F] to-[#ff6b35] text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6">
            Need Immediate Help?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            For urgent academic support or technical issues, our priority support team is standing by.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="bg-white text-[#F47B2F] hover:bg-gray-50 px-8 py-3">
              <Phone className="h-5 w-5 mr-2" />
              Call Now: (555) 123-4567
            </Button>
            
            <Button variant="outline" className="border-white  hover:bg-white hover:text-[#F47B2F] px-8 py-3">
              <MessageCircle className="h-5 w-5 mr-2" />
              Live Chat Support
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Contact;
