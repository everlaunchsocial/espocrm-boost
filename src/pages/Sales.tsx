import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Phone, MessageSquare, Clock, Star, ArrowRight, Zap, Shield, Users, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PagePreview } from '@/components/demos/PagePreview';

const Sales = () => {
  const navigate = useNavigate();
  const [demoData, setDemoData] = useState<{ id: string; screenshot: string; businessName: string; aiPersonaName: string } | null>(null);

  useEffect(() => {
    // Fetch the Re-envision Medspa demo by ID
    const fetchDemo = async () => {
      const { data } = await supabase
        .from('demos')
        .select('id, screenshot_url, business_name, ai_persona_name')
        .eq('id', '4544cc64-4a61-48ec-9f42-71b773ed0c84')
        .single();
      
      if (data && data.screenshot_url) {
        setDemoData({
          id: data.id,
          screenshot: data.screenshot_url,
          businessName: data.business_name,
          aiPersonaName: data.ai_persona_name || 'Jenna'
        });
      }
    };
    fetchDemo();
  }, []);

  const features = [
    { icon: Phone, title: '24/7 Phone Coverage', description: 'Never miss a call, even at 2am' },
    { icon: MessageSquare, title: 'Intelligent Web Chat', description: 'Engage visitors the second they land' },
    { icon: Clock, title: 'Zero Wait Time', description: 'Instant responses, always' },
    { icon: Users, title: 'Smart Lead Capture', description: 'Qualify & book automatically' },
  ];

  const benefits = [
    'Custom-trained on YOUR business',
    'Handles appointments & inquiries',
    'Speaks naturally like a real person',
    'Works on phone, web, and text',
    'Books directly into your calendar',
    'Sends follow-up emails automatically',
  ];

  const testimonials = [
    {
      quote: "We were missing 40% of our calls after hours. Now our AI handles everything — bookings are up 35% and I sleep better at night.",
      name: "Sarah M.",
      role: "Salon Owner",
      rating: 5
    },
    {
      quote: "Within the first week, the AI booked 12 appointments I would have missed. It paid for itself in 3 days.",
      name: "Mike T.",
      role: "HVAC Contractor",
      rating: 5
    },
    {
      quote: "My customers can't tell it's not a real person. The AI knows our services better than some of my employees!",
      name: "Lisa R.",
      role: "Medspa Owner",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-[hsl(222,47%,8%)] text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl bg-[hsl(222,47%,8%)]/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">EverLaunch AI</span>
          </div>
          <Button onClick={() => navigate('/checkout')} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30">
            Get Started <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/30 rounded-full blur-[120px] opacity-50" />
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <Badge className="mb-6 px-4 py-2 bg-blue-500/20 text-blue-300 border-blue-500/30 text-sm">
              🚀 AI-Powered Customer Service for Local Businesses
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Your Business,{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Never Closed
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Custom AI voice agents that answer calls, book appointments, and capture leads 24/7 — 
              trained specifically on <strong className="text-white">YOUR</strong> business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/checkout')} 
                className="text-lg px-10 py-7 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-xl shadow-blue-500/30 rounded-xl"
              >
                Start Today — $997 Setup
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-10 py-7 border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Play className="w-5 h-5 mr-2" /> Try Live Demo
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-4 gap-6 mt-8">
            {features.map((feature, i) => (
              <Card key={i} className="p-6 text-center bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                  <feature.icon className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section id="demo" className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2 bg-green-500/20 text-green-300 border-green-500/30">
              ✨ Interactive Demo
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Try Our AI Demo{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Right Now</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              This is a real AI we built for a medspa. Click the chat bubble and have a conversation — 
              this is exactly how YOUR AI would work for your business.
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
            {/* Demo Phone */}
            <div className="relative">
              <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 rounded-[60px] blur-2xl" />
              {demoData ? (
                <div className="relative transform hover:scale-[1.02] transition-transform duration-300">
                  <PagePreview
                    screenshot={demoData.screenshot}
                    demoId={demoData.id}
                    businessName={demoData.businessName}
                    aiPersonaName={demoData.aiPersonaName}
                  />
                </div>
              ) : (
                <Card className="w-80 h-[600px] flex items-center justify-center bg-white/5 border-white/10 rounded-[40px]">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading demo...</p>
                  </div>
                </Card>
              )}
            </div>

            {/* Demo Instructions */}
            <div className="max-w-md">
              <h3 className="text-2xl font-bold mb-6">How to Experience the Demo</h3>
              <div className="space-y-4">
                {[
                  { step: 1, text: "Click the blue chat bubble on the phone" },
                  { step: 2, text: "Type a question like \"What services do you offer?\"" },
                  { step: 3, text: "Watch the AI respond naturally and intelligently" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 font-bold shadow-lg shadow-blue-500/30">
                      {item.step}
                    </div>
                    <p className="text-lg text-gray-300 pt-1">{item.text}</p>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-gray-400 text-sm">
                💡 <strong className="text-gray-300">Pro tip:</strong> Ask about pricing, hours, or try to book an appointment!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Trusted by Local Business Owners
            </h2>
            <p className="text-xl text-gray-300">Real results from real businesses</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="p-8 bg-white/5 border-white/10 hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-lg text-gray-300 mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-cyan-600/10" />
        <div className="container mx-auto px-4 relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 px-4 py-2 bg-blue-500/20 text-blue-300 border-blue-500/30">
                Why EverLaunch AI?
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Stop Losing Leads to Voicemail
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Our AI agents are trained specifically on your business, services, and pricing — 
                delivering personalized experiences that <strong className="text-white">convert callers into customers</strong>.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 border border-green-500/30">
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="text-lg text-gray-200">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Stats Card */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { stat: '35%', label: 'More Bookings' },
                { stat: '24/7', label: 'Availability' },
                { stat: '<2s', label: 'Response Time' },
                { stat: '98%', label: 'Accuracy Rate' },
              ].map((item, i) => (
                <Card key={i} className="p-8 bg-white/5 border-white/10 text-center hover:border-blue-500/30 transition-all">
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    {item.stat}
                  </p>
                  <p className="text-gray-400">{item.label}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-300">No hidden fees. No long-term contracts. Cancel anytime.</p>
          </div>
          
          <Card className="max-w-xl mx-auto p-10 bg-gradient-to-b from-white/10 to-white/5 border-2 border-blue-500/30 shadow-2xl shadow-blue-500/10 rounded-2xl">
            <div className="text-center">
              <Badge className="mb-4 bg-blue-500 text-white border-none">Most Popular</Badge>
              <h3 className="text-2xl font-bold mb-2">EverLaunch AI Agent</h3>
              <p className="text-gray-400 mb-8">Complete AI solution for your business</p>
              
              <div className="mb-8">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-6xl font-bold">$997</span>
                  <span className="text-gray-400">one-time setup</span>
                </div>
                <div className="text-xl text-gray-300 mt-3">
                  + <span className="font-bold text-white">$279</span>/month thereafter
                </div>
              </div>
              
              <ul className="text-left space-y-4 mb-10">
                {[
                  'Custom AI trained on your business',
                  'Phone, chat & text capabilities',
                  '24/7/365 availability',
                  'Appointment booking integration',
                  'Lead capture & follow-up',
                  'Dedicated support team',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="text-gray-200">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                size="lg" 
                className="w-full text-xl py-7 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-xl shadow-blue-500/30 rounded-xl"
                onClick={() => navigate('/checkout')}
              >
                Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <p className="text-sm text-gray-400 mt-6 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                30-day money-back guarantee
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-cyan-600/10 to-blue-600/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-500/30 rounded-full blur-[100px]" />
        
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Never Miss a Lead Again?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join hundreds of local businesses already using EverLaunch AI to grow their revenue.
          </p>
          <Button 
            size="lg" 
            className="text-xl px-12 py-7 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-xl shadow-blue-500/30 rounded-xl"
            onClick={() => navigate('/checkout')}
          >
            Start Your AI Agent Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© 2024 EverLaunch AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Sales;
