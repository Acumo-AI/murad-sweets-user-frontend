'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Phone, MapPin, Clock, MessageCircle, Send, Check } from 'lucide-react';
import { useCart } from '@/app/store/useCart';
import { submitInquiry } from '@/app/lib/api';

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const contactSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { addToast } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    mode: 'all',
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      await submitInquiry({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        message: data.message,
      });
      setIsSubmitting(false);
      setIsSuccess(true);
      addToast('Message sent successfully! We will get back to you shortly.', 'success');
      reset();
      setTimeout(() => { setIsSuccess(false); }, 5000);
    } catch (err: any) {
      setIsSubmitting(false);
      addToast(err.response?.data?.detail || 'Failed to send message. Please try again.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="border-b border-border pb-4 text-center max-w-xl mx-auto space-y-2">
        <span className="font-script text-accent text-3xl">Get in touch</span>
        <h1 className="font-heading text-3xl sm:text-4xl text-primary font-extrabold tracking-tight">Contact Murad Sweets</h1>
        <p className="text-xs sm:text-sm text-brown font-body">
          Have questions about custom catering, wedding trays, or delivery schedules? Send us a message!
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left Column: Form */}
        <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="font-cinzel text-sm uppercase tracking-wider text-primary font-bold">
              Send an Inquiry
            </h2>
            <p className="text-xs text-brown mt-1">Fill out the form below and we will email or call you back shortly.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-cinzel font-semibold text-brown mb-1.5">Your Name</label>
              <input
                type="text"
                {...register('fullName')}
                className="w-full text-xs bg-cream/20 border border-border rounded-md p-2.5 text-primary-deep placeholder-brown/30 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Rahim Ahmed"
              />
              {errors.fullName && <span className="text-[10px] text-red-600 block mt-1">{errors.fullName.message}</span>}
            </div>

            <div>
              <label className="block text-[10px] uppercase font-cinzel font-semibold text-brown mb-1.5">Email Address</label>
              <input
                type="email"
                {...register('email')}
                className="w-full text-xs bg-cream/20 border border-border rounded-md p-2.5 text-primary-deep placeholder-brown/30 focus:outline-none"
                placeholder="rahim@example.com"
              />
              {errors.email && <span className="text-[10px] text-red-600 block mt-1">{errors.email.message}</span>}
            </div>

            <div>
              <label className="block text-[10px] uppercase font-cinzel font-semibold text-brown mb-1.5">Phone Number</label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full text-xs bg-cream/20 border border-border rounded-md p-2.5 text-primary-deep placeholder-brown/30 focus:outline-none"
                placeholder="(555) 123-4567"
              />
              {errors.phone && <span className="text-[10px] text-red-600 block mt-1">{errors.phone.message}</span>}
            </div>

            <div>
              <label className="block text-[10px] uppercase font-cinzel font-semibold text-brown mb-1.5">Message / Inquiry</label>
              <textarea
                rows={4}
                {...register('message')}
                className="w-full text-xs bg-cream/20 border border-border rounded-md p-2.5 text-primary-deep placeholder-brown/30 focus:outline-none"
                placeholder="Tell us details about your event, desired tray sizes, or address coverage inquiries..."
              />
              {errors.message && <span className="text-[10px] text-red-600 block mt-1">{errors.message.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-2 ${isSubmitting ? 'opacity-55 cursor-not-allowed' : 'btn-gold shadow-md'
                }`}
            >
              {isSuccess ? (
                <>
                  <Check className="h-4 w-4 text-accent mr-1" />
                  <span>Sent Successfully!</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1 text-accent" />
                  <span>{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Contact Cards & Map */}
        <div className="space-y-6">
          {/* Info Details card */}
          <div className="bg-cream/40 border border-border rounded-2xl p-6 space-y-5">
            <h2 className="font-cinzel text-xs uppercase tracking-wider text-primary-deep font-bold border-b border-border pb-2.5">
              Contact & Hours
            </h2>

            <div className="space-y-4 text-xs font-body">
              {/* Phone */}
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-primary-deep uppercase font-cinzel text-[10px] tracking-wider block">Customer Care</span>
                  <span className="text-primary-deep font-semibold">+1 (555) 123-4567</span>
                </div>
              </div>

              {/* Pickup Address */}
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-primary-deep uppercase font-cinzel text-[10px] tracking-wider block">Pickup Hub</span>
                  <span className="text-primary-deep font-semibold">Houston, Texas 77055</span>
                  <span className="text-[10px] text-brown block mt-0.5">Exact address shared in order receipt details.</span>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-primary-deep uppercase font-cinzel text-[10px] tracking-wider block">Kitchen Schedule</span>
                  <span className="text-primary-deep block">Friday – Sunday: 10:00 AM – 8:00 PM</span>
                  <span className="text-brown block mt-1">Pre-orders are processed 24/7. Deliveries are made on Saturdays and Sundays.</span>
                </div>
              </div>
            </div>

            {/* Social channels */}
            <div className="pt-2 border-t border-border flex gap-4">
              <a href="#" className="flex-1 py-2 px-3 border border-border bg-white rounded-lg flex items-center justify-center space-x-2 text-[10px] uppercase font-cinzel font-bold text-brown hover:text-primary transition-all">
                <FacebookIcon className="h-4 w-4" />
                <span>Facebook</span>
              </a>
              <a href="#" className="flex-1 py-2 px-3 border border-border bg-white rounded-lg flex items-center justify-center space-x-2 text-[10px] uppercase font-cinzel font-bold text-brown hover:text-primary transition-all">
                <InstagramIcon className="h-4 w-4" />
                <span>Instagram</span>
              </a>
              <a href="#" className="flex-1 py-2 px-3 border border-border bg-white rounded-lg flex items-center justify-center space-x-2 text-[10px] uppercase font-cinzel font-bold text-brown hover:text-primary transition-all">
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm h-64 relative group">
            {/* Embedded Iframe */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12104.996163351336!2d-73.97818451152281!3d40.6453129598288!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25b394c8e70a9%3A0x63354b38d38ee5d!2sBrooklyn%2C%20NY%2011218!5e0!3m2!1sen!2sus!4v1716943892749!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Murad Sweets Pickup Hub Map"
              className="absolute inset-0 grayscale contrast-125 opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
