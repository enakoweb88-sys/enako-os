import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  ArrowRight,
  Check,
  ShieldCheck,
  Cloud,
  BarChart3,
  CreditCard,
  FileText,
  Search,
  Menu,
  Plus,
  LayoutDashboard,
  Receipt,
  PieChart,
  Settings,
  MoreHorizontal
} from 'lucide-react';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen font-sans bg-[#FAF9FC] text-[#1E293B] antialiased flex flex-col justify-between selection:bg-[#00C2C7] selection:text-[#001F5B] overflow-x-hidden">
      
      {/* ── HEADER / NAVIGATION BAR ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-6 lg:px-12 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Branding */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <img
              src="/logo.png"
              alt="ENAKO Logo"
              className="h-8 sm:h-10 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-black text-lg sm:text-xl tracking-tight text-[#0F172A] leading-none">
                ENAKO
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-[#00C2C7] uppercase mt-0.5">
                CLOUD SYSTEM
              </span>
            </div>
          </Link>

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex items-center gap-4 lg:gap-6">
            <Link
              to="/login"
              className="text-sm font-extrabold text-[#001F5B] hover:text-[#00C2C7] transition-colors"
            >
              Login
            </Link>
            <Link
              to="/select-role"
              className="px-5 lg:px-6 py-2.5 rounded-full bg-[#001F5B] hover:bg-[#001540] text-white text-sm font-extrabold shadow-md shadow-[#001F5B]/20 hover:shadow-lg hover:shadow-[#001F5B]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <span className="text-[#00C2C7]">→</span>
            </Link>
          </div>

          {/* Mobile & Tablet Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-slate-700 hover:text-[#001F5B] hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile & Tablet Dropdown Navigation Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden pt-4 pb-3 border-t border-slate-100 mt-3 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 px-2 pb-2 border-b border-slate-100">
              <img src="/logo.png" alt="ENAKO Logo" className="h-6 w-auto object-contain" />
              <span className="font-bold text-xs text-[#0F172A]">ENAKO OS Mobile</span>
            </div>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-bold text-[#001F5B] bg-slate-100 rounded-xl"
            >
              Login
            </Link>
            <Link
              to="/select-role"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-extrabold text-white bg-[#001F5B] rounded-xl shadow-md"
            >
              Get Started
            </Link>
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-20 w-full">

        {/* ── HERO SECTION ── */}
        <div id="home" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          
          {/* Left Hero Text Content */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.1] mb-6">
              ENAKO Finance <br />
              <span className="text-[#001F5B]">Cloud System</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[#475569] text-base sm:text-lg leading-relaxed mb-8 max-w-xl font-normal">
              A modern, secure, and sovereign financial management system designed to help enterprises track, manage, and scale operations anytime, anywhere.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link
                to="/select-role"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#001F5B] hover:bg-[#001540] text-white font-extrabold text-sm shadow-xl shadow-[#001F5B]/25 hover:shadow-2xl hover:shadow-[#001F5B]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 text-[#00C2C7] stroke-[3]" />
              </Link>
            </div>

            {/* Checkmark Features Strip */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#00C2C7] flex items-center justify-center text-[#001F5B]">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-xs font-extrabold text-[#1E293B]">Secure & Reliable</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#00C2C7] flex items-center justify-center text-[#001F5B]">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-xs font-extrabold text-[#1E293B]">Easy to Use</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#00C2C7] flex items-center justify-center text-[#001F5B]">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-xs font-extrabold text-[#1E293B]">Access Anywhere</span>
              </div>
            </div>

          </div>

          {/* Right Hero Visual Mockups Container */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            
            {/* Background Decorative Abstract SVGs with Real ENAKO Colors */}
            <div className="absolute inset-0 -z-10 pointer-events-none flex items-center justify-center overflow-visible">
              <svg className="w-[120%] h-[120%] opacity-80" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M400 120C450 200 480 300 420 380C360 460 220 480 150 420C80 360 100 240 180 160C260 80 350 40 400 120Z" fill="url(#enako-grad-1)" opacity="0.15" />
                <path d="M440 220C480 270 470 360 420 410C370 460 280 470 200 420C120 370 140 280 210 210C280 140 400 170 440 220Z" fill="url(#enako-grad-2)" opacity="0.25" />
                <defs>
                  <linearGradient id="enako-grad-1" x1="0" y1="0" x2="500" y2="500" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#001F5B" />
                    <stop offset="1" stopColor="#00C2C7" />
                  </linearGradient>
                  <linearGradient id="enako-grad-2" x1="100" y1="100" x2="400" y2="400" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00C2C7" />
                    <stop offset="1" stopColor="#001F5B" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* LAPTOP MOCKUP CONTAINER */}
            <div className="relative w-full max-w-[620px] rounded-t-2xl bg-[#0A0F2C] p-3 pt-3 pb-2 shadow-2xl shadow-[#001F5B]/20 border border-slate-700">
              
              {/* Laptop Screen Bezel */}
              <div className="relative rounded-lg bg-white overflow-hidden border border-slate-200">
                
                {/* Dashboard Top Header */}
                <div className="h-10 bg-white border-b border-slate-100 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="ENAKO Logo" className="h-5 w-auto object-contain" />
                    <span className="font-black text-xs text-[#0F172A]">ENAKO</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <Search className="w-3 h-3" />
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                      <div className="w-5 h-5 rounded-full bg-[#001F5B] text-[#00C2C7] text-[9px] font-extrabold flex items-center justify-center">
                        JD
                      </div>
                      <span className="text-[10px] font-bold text-slate-700">John Doe</span>
                      <span className="text-[8px] text-[#001F5B] font-semibold">Admin</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Screen Content */}
                <div className="flex h-[320px] bg-[#F8FAFC]">
                  
                  {/* Dashboard Mini Sidebar */}
                  <div className="w-36 bg-white border-r border-slate-100 p-2.5 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 px-2 py-1.5 bg-[#00C2C7]/15 text-[#001F5B] rounded-md font-extrabold text-[10px]">
                        <LayoutDashboard className="w-3 h-3 text-[#00C2C7]" />
                        <span>Dashboard</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1.5 text-slate-500 rounded-md text-[10px] font-medium hover:bg-slate-50">
                        <Receipt className="w-3 h-3" />
                        <span>Transactions</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1.5 text-slate-500 rounded-md text-[10px] font-medium hover:bg-slate-50">
                        <CreditCard className="w-3 h-3" />
                        <span>Accounts</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1.5 text-slate-500 rounded-md text-[10px] font-medium hover:bg-slate-50">
                        <FileText className="w-3 h-3" />
                        <span>Invoices</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1.5 text-slate-500 rounded-md text-[10px] font-medium hover:bg-slate-50">
                        <PieChart className="w-3 h-3" />
                        <span>Reports</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1.5 text-slate-500 rounded-md text-[10px] font-medium hover:bg-slate-50">
                        <Settings className="w-3 h-3" />
                        <span>Settings</span>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Main Panel */}
                  <div className="flex-1 p-3 overflow-hidden text-left">
                    
                    {/* Welcome Title */}
                    <div className="mb-2">
                      <p className="text-[9px] text-slate-400 font-medium">Good morning,</p>
                      <h3 className="text-xs font-black text-slate-900">Welcome back!</h3>
                    </div>

                    {/* 3 KPI Cards */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      
                      <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-xs">
                        <p className="text-[8px] font-semibold text-slate-400">Total Balance</p>
                        <p className="text-[11px] font-black text-slate-900">$ 24,580.00</p>
                        <span className="text-[7px] font-bold text-emerald-600">↑ 12%</span>
                      </div>

                      <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-xs">
                        <p className="text-[8px] font-semibold text-slate-400">Total Income</p>
                        <p className="text-[11px] font-black text-slate-900">$ 18,420.00</p>
                        <span className="text-[7px] font-bold text-emerald-600">↑ 15%</span>
                      </div>

                      <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-xs">
                        <p className="text-[8px] font-semibold text-slate-400">Total Expenses</p>
                        <p className="text-[11px] font-black text-slate-900">$ 6,160.00</p>
                        <span className="text-[7px] font-bold text-rose-500">↑ 8%</span>
                      </div>

                    </div>

                    {/* Cash Flow Line Chart */}
                    <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-xs mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-extrabold text-slate-800">Cash Flow Analytics</span>
                      </div>
                      
                      {/* Smooth Wavy Line SVG Chart with Cyan Brand Accent */}
                      <div className="h-16 w-full">
                        <svg className="w-full h-full" viewBox="0 0 300 60" fill="none">
                          <path
                            d="M0 45 C30 30, 60 50, 90 25 C120 10, 150 40, 180 20 C210 5, 240 35, 270 15 C285 5, 295 10, 300 12"
                            stroke="#00C2C7"
                            strokeWidth="2.5"
                            fill="none"
                          />
                          <path
                            d="M0 45 C30 30, 60 50, 90 25 C120 10, 150 40, 180 20 C210 5, 240 35, 270 15 L300 60 L0 60 Z"
                            fill="url(#chart-gradient)"
                            opacity="0.2"
                          />
                          <defs>
                            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="60">
                              <stop stopColor="#00C2C7" />
                              <stop offset="1" stopColor="#00C2C7" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>

                      {/* Month Labels */}
                      <div className="flex justify-between text-[7px] text-slate-400 font-medium px-1">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                      </div>
                    </div>

                    {/* Bottom Split */}
                    <div className="grid grid-cols-12 gap-2 text-left">
                      
                      {/* Recent Transactions Table */}
                      <div className="col-span-8 bg-white p-2 rounded-lg border border-slate-100 shadow-xs">
                        <span className="text-[8px] font-extrabold text-slate-800 block mb-1">Recent Transactions</span>
                        <table className="w-full text-[7px]">
                          <thead>
                            <tr className="text-slate-400 border-b border-slate-50">
                              <th className="text-left font-medium py-0.5">Date</th>
                              <th className="text-left font-medium py-0.5">Description</th>
                              <th className="text-right font-medium py-0.5">Amount</th>
                              <th className="text-right font-medium py-0.5">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            <tr>
                              <td className="py-0.5 text-slate-400">Apr 21, 2025</td>
                              <td className="py-0.5 font-semibold text-slate-700">Office Supplies</td>
                              <td className="py-0.5 text-right font-bold text-slate-800">-$120.00</td>
                              <td className="py-0.5 text-right"><span className="bg-emerald-50 text-emerald-600 px-1 py-0.5 rounded text-[6px] font-bold">Paid</span></td>
                            </tr>
                            <tr>
                              <td className="py-0.5 text-slate-400">Apr 20, 2025</td>
                              <td className="py-0.5 font-semibold text-slate-700">Client Payment</td>
                              <td className="py-0.5 text-right font-bold text-emerald-600">+$2,500.00</td>
                              <td className="py-0.5 text-right"><span className="bg-[#00C2C7]/20 text-[#001F5B] px-1 py-0.5 rounded text-[6px] font-bold">Received</span></td>
                            </tr>
                            <tr>
                              <td className="py-0.5 text-slate-400">Apr 19, 2025</td>
                              <td className="py-0.5 font-semibold text-slate-700">Software License</td>
                              <td className="py-0.5 text-right font-bold text-slate-800">-$49.00</td>
                              <td className="py-0.5 text-right"><span className="bg-emerald-50 text-emerald-600 px-1 py-0.5 rounded text-[6px] font-bold">Paid</span></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Quick Actions */}
                      <div className="col-span-4 bg-white p-2 rounded-lg border border-slate-100 shadow-xs space-y-1">
                        <span className="text-[8px] font-extrabold text-slate-800 block mb-1">Quick Actions</span>
                        <div className="p-1 rounded bg-[#001F5B] text-[#00C2C7] text-[7px] font-extrabold flex items-center gap-1 cursor-pointer">
                          <Plus className="w-2 h-2 text-[#00C2C7]" /> New Transaction
                        </div>
                        <div className="p-1 rounded bg-slate-50 text-slate-700 text-[7px] font-bold flex items-center gap-1 cursor-pointer">
                          <FileText className="w-2 h-2" /> Create Invoice
                        </div>
                        <div className="p-1 rounded bg-slate-50 text-slate-700 text-[7px] font-bold flex items-center gap-1 cursor-pointer">
                          <PieChart className="w-2 h-2" /> View Reports
                        </div>
                      </div>

                    </div>

                  </div>
                </div>

              </div>

              {/* Laptop Base Stand */}
              <div className="w-[110%] -ml-[5%] h-3 bg-[#0F172A] rounded-b-xl border-t border-slate-700 shadow-md relative flex justify-center">
                <div className="w-16 h-1 bg-slate-500 rounded-b" />
              </div>
            </div>

            {/* OVERLAPPING MOBILE PHONE MOCKUP WITH REAL LOGO */}
            <div className="absolute -bottom-6 -right-2 sm:right-2 w-36 sm:w-44 rounded-[1.8rem] sm:rounded-[2rem] bg-[#0A0F2C] p-1.5 sm:p-2 border-2 border-slate-700 shadow-2xl z-20 block">
              <div className="rounded-[1.6rem] bg-white overflow-hidden text-left p-2.5 border border-slate-100 shadow-inner">
                
                {/* Phone Notch & Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <img src="/logo.png" alt="ENAKO Logo" className="h-4 w-auto object-contain" />
                    <span className="text-[9px] font-black text-slate-900">ENAKO</span>
                  </div>
                  <Menu className="w-3 h-3 text-slate-600" />
                </div>

                {/* Mobile Greeting */}
                <div className="mb-2">
                  <p className="text-[7px] text-slate-400">Good morning,</p>
                  <h4 className="text-[10px] font-extrabold text-slate-900">John Doe</h4>
                </div>

                {/* Mobile Balance Card */}
                <div className="bg-[#001F5B] p-2.5 rounded-xl mb-2.5 text-white shadow-xs">
                  <p className="text-[7px] font-semibold text-slate-300">Total Balance</p>
                  <h3 className="text-xs font-black text-white">$ 24,580.00</h3>
                  <span className="text-[7px] font-bold text-[#00C2C7]">↑ 12%</span>
                </div>

                {/* Mobile Recent Transactions */}
                <div className="space-y-1.5 mb-2">
                  <span className="text-[7px] font-extrabold text-slate-800 block">Recent Activity</span>
                  
                  <div className="flex justify-between items-center text-[7px] p-1 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-bold text-slate-800">Office Supplies</p>
                      <p className="text-[6px] text-slate-400">Apr 21, 2025</p>
                    </div>
                    <span className="font-bold text-rose-500">-$120.00</span>
                  </div>

                  <div className="flex justify-between items-center text-[7px] p-1 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-bold text-slate-800">Client Payment</p>
                      <p className="text-[6px] text-slate-400">Apr 20, 2025</p>
                    </div>
                    <span className="font-bold text-emerald-600">+$2,500.00</span>
                  </div>
                </div>

                {/* Mobile Bottom Navigation */}
                <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-[6px] text-slate-400 font-semibold px-1">
                  <div className="text-[#001F5B] flex flex-col items-center">
                    <LayoutDashboard className="w-2.5 h-2.5 text-[#00C2C7]" />
                    <span>Home</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Receipt className="w-2.5 h-2.5" />
                    <span>Txns</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <PieChart className="w-2.5 h-2.5" />
                    <span>Reports</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <MoreHorizontal className="w-2.5 h-2.5" />
                    <span>More</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* ── 4 FEATURES CARDS ROW (BOTTOM SECTION) ── */}
        <div id="features" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-8">
          
          {/* Card 1 */}
          <div className="flex flex-col items-center text-center group p-6 rounded-3xl bg-white transition-all hover:shadow-xl hover:shadow-[#001F5B]/5 border border-slate-100 hover:border-[#00C2C7]/30">
            <div className="w-14 h-14 rounded-2xl bg-[#00C2C7]/15 flex items-center justify-center text-[#001F5B] mb-5 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7 stroke-[2.2] text-[#001F5B]" />
            </div>
            <h3 className="font-extrabold text-lg text-[#0F172A] mb-2.5">
              Secure & Sovereign
            </h3>
            <p className="text-[#64748B] text-sm leading-relaxed font-normal">
              Protected with enterprise 256-bit encryption and robust access control.
            </p>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col items-center text-center group p-6 rounded-3xl bg-white transition-all hover:shadow-xl hover:shadow-[#001F5B]/5 border border-slate-100 hover:border-[#00C2C7]/30">
            <div className="w-14 h-14 rounded-2xl bg-[#001F5B]/10 flex items-center justify-center text-[#001F5B] mb-5 group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7 stroke-[2.2] text-[#001F5B] fill-[#00C2C7]" />
            </div>
            <h3 className="font-extrabold text-lg text-[#0F172A] mb-2.5">
              Maximum Efficiency
            </h3>
            <p className="text-[#64748B] text-sm leading-relaxed font-normal">
              Automate multi-entity workflows, approvals, and cash collection tasks seamlessly.
            </p>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col items-center text-center group p-6 rounded-3xl bg-white transition-all hover:shadow-xl hover:shadow-[#001F5B]/5 border border-slate-100 hover:border-[#00C2C7]/30">
            <div className="w-14 h-14 rounded-2xl bg-[#00C2C7]/15 flex items-center justify-center text-[#00C2C7] mb-5 group-hover:scale-110 transition-transform">
              <Cloud className="w-7 h-7 stroke-[2.2] text-[#001F5B] fill-[#00C2C7]/20" />
            </div>
            <h3 className="font-extrabold text-lg text-[#0F172A] mb-2.5">
              Access Anywhere
            </h3>
            <p className="text-[#64748B] text-sm leading-relaxed font-normal">
              Connect to your organization’s unified cloud workspace anytime from any device.
            </p>
          </div>

          {/* Card 4 */}
          <div className="flex flex-col items-center text-center group p-6 rounded-3xl bg-white transition-all hover:shadow-xl hover:shadow-[#001F5B]/5 border border-slate-100 hover:border-[#00C2C7]/30">
            <div className="w-14 h-14 rounded-2xl bg-[#001F5B]/10 flex items-center justify-center text-[#001F5B] mb-5 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-7 h-7 stroke-[2.2] text-[#001F5B]" />
            </div>
            <h3 className="font-extrabold text-lg text-[#0F172A] mb-2.5">
              Real-time Analytics
            </h3>
            <p className="text-[#64748B] text-sm leading-relaxed font-normal">
              Drive intelligence with executive dashboards, instant reporting, and audit logs.
            </p>
          </div>

        </div>

      </main>

      {/* ── FOOTER / BOTTOM ACCENT BANNER ── */}
      <footer className="w-full bg-[#001F5B] py-6 px-6 text-center text-white text-xs font-semibold">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-[#00C2C7]" />
            <span>&copy; {new Date().getFullYear()} ENAKO Cloud System. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-slate-300 text-xs font-bold">
            <Link to="/login" className="hover:text-[#00C2C7] transition-colors">Staff Portal Login</Link>
            <Link to="/select-role" className="hover:text-[#00C2C7] transition-colors">All Portals</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

