"use client"

import { createContext, useContext, type ReactNode } from "react"

// Simplified translations object with only Spanish
const translations = {
  // Navigation
  "nav.home": "Home",
  "nav.dashboard": "Dashboard",
  "nav.contact": "Contact Coach",
  "nav.logout": "Sign Out",
  "nav.loggingOut": "Signing out...",
  "nav.menu": "Menu",
  // Pitch Canvas
  "pitch.title": "Pitch Canvas Generator",
  "pitch.subtitle": "Create your perfect pitch with AI",
  "pitch.problem": "Problem",
  "pitch.problem.placeholder": "What problem are you solving?",
  "pitch.solution": "Solution",
  "pitch.solution.placeholder": "How does your solution work?",
  "pitch.uniqueness": "Uniqueness",
  "pitch.uniqueness.placeholder": "What makes your solution unique?",
  "pitch.market": "Target Market",
  "pitch.market.placeholder": "Who is your target audience?",
  "pitch.traction": "Traction",
  "pitch.traction.placeholder": "What traction do you have so far?",
  "pitch.business": "Business Model",
  "pitch.business.placeholder": "How will you generate revenue?",
  "pitch.team": "Team",
  "pitch.team.placeholder": "Who is part of your team?",
  "pitch.ask": "The Ask",
  "pitch.ask.placeholder": "What are you asking for?",
  "pitch.generate": "Generate Pitch",
  "pitch.generating": "Generating...",
  "pitch.canvas": "Pitch Canvas",
  "pitch.result": "Generated Pitch",
  "pitch.canvas.title": "David Beckett's Pitch Canvas",
  "pitch.canvas.description": "Fill in the details below to generate your 3-minute pitch",
  "pitch.result.title": "Your Generated Pitch",
  "pitch.result.description": "Here's your AI-generated 3-minute pitch based on David Beckett's method",
  "pitch.edit": "Edit Canvas",
  "pitch.copy": "Copy Text",
  "pitch.print": "Print",
  "pitch.download": "Download",
  "pitch.copied": "Copied to clipboard",
  "pitch.copied.description": "Your pitch has been copied to the clipboard",
  "pitch.your3min": "Your 3-Minute Pitch",
  "pitch.based": "Based on David Beckett's Pitch Canvas",
  // Contact
  "contact.title": "Contact Pitch Coach",
  "contact.subtitle": "Get professional coaching from Martina Guzman",
  "contact.name": "Name",
  "contact.email": "Email",
  "contact.message": "Message",
  "contact.submit": "Send",
  "contact.sending": "Sending...",
  "contact.success": "Message sent successfully!",
  "contact.success.description": "Martina Guzman will contact you soon.",
  "contact.coach.title": "Meet Your Coach",
  "contact.coach.description": "Professional pitch coaching from an industry expert",
  "contact.coach.bio":
    "Professional Pitch Coach with over 10 years of experience helping entrepreneurs and executives deliver compelling presentations. Specialized in David Beckett's pitch canvas methodology.",
  "contact.form.title": "Contact Martina Guzman",
  "contact.form.description": "Get professional coaching to perfect your pitch delivery and presentation",
  "contact.services": "Coaching Services",
  "contact.basic.title": "Basic Coaching",
  "contact.basic.description": "Individual pitch review session",
  "contact.basic.feature1": "60-minute virtual session",
  "contact.basic.feature2": "Detailed feedback on your pitch",
  "contact.basic.feature3": "Presentation tips and techniques",
  "contact.premium.title": "Premium Coaching",
  "contact.premium.description": "Comprehensive pitch preparation",
  "contact.premium.feature1": "3 coaching sessions (90 minutes each)",
  "contact.premium.feature2": "Pitch content refinement",
  "contact.premium.feature3": "Body language and voice coaching",
  "contact.premium.feature4": "Video recording and analysis",
  // Video Course
  "course.title": "Video Course",
  "course.name": "The Complete Pitch Mastery Course",
  "course.description":
    "Learn the art of pitching directly from Martina Guzman with this comprehensive video course. Master every aspect of creating and delivering compelling pitches that win over investors, clients, and stakeholders.",
  "course.feature1": "Over 10 hours of professional video content",
  "course.feature2": "Downloadable resources and templates",
  "course.feature3": "Lifetime access and updates",
  "course.feature4": "Private community access",
  "course.reviews": "4.9/5 (over 120 reviews)",
  "course.purchase": "Purchase Course",
  "course.preview": "Preview: Mastering Your Pitch Delivery",
  // Home Page
  "home.hero.title": "Create Perfect Pitches with AI",
  "home.hero.subtitle":
    "Generate professional 3-minute pitches based on David Beckett's pitch canvas method. Free pitch generation with optional professional coaching.",
  "home.getstarted": "Get Started",
  "home.contactcoach": "Contact Coach",
  "home.feature1.title": "The Best 3-Minute Pitch Method",
  "home.feature1.description":
    "Based on David Beckett's proven pitch canvas methodology, our AI helps you create compelling pitches that capture attention and drive results.",
  "home.feature1.point1": "Define your problem and solution clearly",
  "home.feature1.point2": "Highlight your unique value proposition",
  "home.feature1.point3": "Structure your pitch for maximum impact",
  "home.feature2.title": "Professional Coaching",
  "home.feature2.description":
    "Get personalized coaching from Martina Guzman to perfect your pitch delivery and presentation.",
  "home.feature2.point1": "Build confidence in your presentation",
  "home.feature2.point2": "Refine your presentation style",
  "home.feature2.point3": "Get expert feedback on your pitch",
  "home.course.title": "Master Pitching with Our Video Course",
  "home.course.description":
    "Learn at your own pace with Martina Guzman's comprehensive video course on pitch mastery. From fundamentals to advanced techniques, this course covers everything you need to deliver compelling pitches that win over any audience.",
  "home.course.learnmore": "Learn More About the Course",
  "home.cta.title": "Ready to Create Your Perfect Pitch?",
  "home.cta.description":
    "Start using our AI-powered pitch generator today and transform your ideas into compelling presentations.",
  "home.cta.button": "Start Now",
  // Footer
  "footer.copyright": "© 2025 PitchAI. All rights reserved.",
  "footer.free": "Pitch generation is free",
  "footer.coaching": "Professional coaching is a paid service",
  // Auth
  "auth.signin": "Sign In",
  "auth.signup": "Sign Up",
  "auth.google": "Continue with Google",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.confirmPassword": "Confirm Password",
  "auth.noAccount": "Don't have an account?",
  "auth.hasAccount": "Already have an account?",
  "auth.or": "Or continue with",
  "auth.signin.description": "Sign in to your account to create and manage your pitches",
  "auth.signup.description": "Create an account to start generating professional pitches",
  "auth.error": "An error occurred. Please try again.",
  "auth.invalid": "Invalid email or password",
  "auth.passwordMismatch": "Passwords don't match",
  "auth.registrationFailed": "Registration failed. Please try again.",
  "auth.emailPlaceholder": "your.email@example.com",
  "auth.passwordPlaceholder": "••••••••",
  "auth.signingIn": "Signing in...",
  "auth.continueWith": "Or continue with",
  "auth.invalidCredentials": "Invalid email or password",
}

interface LanguageContextType {
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Simplified t function that only returns Spanish translations
  const t = (key: string): string => {
    return translations[key] || key
  }

  return <LanguageContext.Provider value={{ t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
