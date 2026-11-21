import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getCurrentUser } from './lib/supabase'
import Header from './components/Header'
import Footer from './components/Footer'
import Hero from './sections/Hero'
import Pricing from './sections/Pricing'
import BotDemo from './sections/BotDemo'
import HowItWorks from './sections/HowItWorks'
import FAQ from './sections/FAQ'
import CTA from './sections/CTA'
import Login from './pages/Login'
import Register from './pages/Register'
import Payment from './pages/Payment'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'

function LandingPage() {
  return (
    <div className="min-h-screen bg-transparent text-[#F4F6FA] flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <BotDemo />
        <Pricing />
        <HowItWorks />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
