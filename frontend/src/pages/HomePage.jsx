import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ArrowRight, Activity, Users, ShieldCheck } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center pt-20 pb-24 text-center">
      <div className="bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-6 flex items-center shadow-sm">
        <Trophy className="w-4 h-4 mr-2" /> The Standard in Debate Management
      </div>
      <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
        Centralized <br className="hidden lg:block"/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          Debate Tournament
        </span>
        <br className="hidden lg:block"/> System
      </h1>
      <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
        Automate the entire lifecycle of your debate tournaments. From registration and check-ins to automated power-pairing and result tracking.
      </p>
      
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-20 md:mb-32">
        <Link to="/register" className="btn-primary py-3 px-8 text-lg flex items-center justify-center">
          Get Started <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
        <Link to="/login" className="bg-white text-slate-700 border border-slate-300 py-3 px-8 text-lg font-medium rounded-md hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center">
          Login to Dashboard
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8 w-full">
        <div className="card text-left">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-6">
            <Activity className="text-blue-600 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">Automated Pairing</h3>
          <p className="text-slate-500">
            Intelligent matchmaking algorithms handle power-pairing and adjudicator distribution seamlessly.
          </p>
        </div>
        <div className="card text-left">
          <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center mb-6">
            <Users className="text-pink-600 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">Role-based Access</h3>
          <p className="text-slate-500">
            Dedicated dashboards for Teams, Adjudicators, and Organizing Committee (OC) members.
          </p>
        </div>
        <div className="card text-left">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-6">
            <ShieldCheck className="text-green-600 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">Transparent Results</h3>
          <p className="text-slate-500">
            Secure submission of ballot results, adjudicator ratings, and round-by-round point tracking.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
