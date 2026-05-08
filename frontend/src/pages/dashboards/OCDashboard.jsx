import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Users, Trophy, Play, ChevronLeft, BarChart3, LayoutList, Eye, Trash2, UserCheck, UserX, Clock, CheckCircle, AlertTriangle, X, MessageSquareWarning } from 'lucide-react';

const OCDashboard = () => {
  const [activeTab, setActiveTab] = useState('competitions');
  const [competitions, setCompetitions] = useState([]);
  const [newComp, setNewComp] = useState({ name: '', totalRounds: 3, teamSize: 2, adjudicatorsPerMatch: 1, venues: 'Room A, Room B' });
  const [loading, setLoading] = useState(false);

  // Detail view state
  const [selectedComp, setSelectedComp] = useState(null);
  const [compDetail, setCompDetail] = useState(null);
  const [matches, setMatches] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [adjLeaderboard, setAdjLeaderboard] = useState([]);
  const [detailTab, setDetailTab] = useState('participants');
  const [lbTab, setLbTab] = useState('teams');
  const [forceOverride, setForceOverride] = useState(false);
  const [issues, setIssues] = useState([]);
  const [resolveModal, setResolveModal] = useState(null); // issue id being resolved
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      const { data } = await api.get('/competitions');
      setCompetitions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchIssues = useCallback(async () => {
    try {
      const { data } = await api.get('/issues');
      setIssues(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Poll issues every 15s when in detail view
  useEffect(() => {
    if (selectedComp) {
      fetchIssues();
      const interval = setInterval(fetchIssues, 15000);
      return () => clearInterval(interval);
    }
  }, [selectedComp, fetchIssues]);

  const handleResolveIssue = async (issueId) => {
    try {
      await api.put(`/issues/${issueId}/resolve`, { resolution: resolution || 'Resolved by OC' });
      setResolveModal(null);
      setResolution('');
      fetchIssues();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve issue');
    }
  };

  const handleCreateComp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/competitions', {
        ...newComp,
        venues: newComp.venues.split(',').map((v) => v.trim()),
      });
      fetchCompetitions();
      setNewComp({ name: '', totalRounds: 3, teamSize: 2, adjudicatorsPerMatch: 1, venues: 'Room A, Room B' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComp = async (compId) => {
    if (!window.confirm('Delete competition?')) return;
    try {
      await api.delete(`/competitions/${compId}`);
      fetchCompetitions();
      if (selectedComp === compId) closeDetail();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleGenerateMatches = async (compId) => {
    try {
      await api.post(`/competitions/${compId}/matches/generate`, { forceOverride });
      alert("Matches generated successfully!");
      fetchCompetitions();
      if (selectedComp === compId) openCompDetail(compId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate');
    }
  };

  const handleApproveParticipant = async (compId, userId) => {
    try {
      await api.put(`/competitions/${compId}/approve/${userId}`);
      openCompDetail(compId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleRejectParticipant = async (compId, userId) => {
    try {
      await api.put(`/competitions/${compId}/reject/${userId}`);
      openCompDetail(compId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    }
  };

  const openCompDetail = async (compId) => {
    setSelectedComp(compId);
    setDetailTab('participants');
    try {
      const [compRes, matchRes, lbRes, adjLbRes] = await Promise.all([
        api.get(`/competitions/${compId}`),
        api.get(`/competitions/${compId}/matches`),
        api.get(`/results/leaderboard/${compId}`),
        api.get(`/results/adjudicator-leaderboard/${compId}`),
      ]);
      setCompDetail(compRes.data);
      setMatches(matchRes.data);
      setLeaderboard(lbRes.data);
      setAdjLeaderboard(adjLbRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const closeDetail = () => {
    setSelectedComp(null);
    setCompDetail(null);
    setMatches([]);
    setLeaderboard([]);
  };

  const matchesByRound = {};
  matches.forEach((m) => {
    if (!matchesByRound[m.roundNumber]) matchesByRound[m.roundNumber] = [];
    matchesByRound[m.roundNumber].push(m);
  });
  const roundNumbers = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b);

  if (selectedComp && compDetail) {
    const pendingAll = [...(compDetail.pendingTeams || []), ...(compDetail.pendingAdjudicators || [])];
    const approvedAll = [...(compDetail.approvedTeams || []), ...(compDetail.approvedAdjudicators || [])];
    const checkedInAll = [...(compDetail.checkedInTeams || []), ...(compDetail.checkedInAdjudicators || [])];

    return (
      <div className="space-y-6">
        <button onClick={closeDetail} className="flex items-center text-sm text-slate-500 hover:text-primary transition-colors font-medium">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Competitions
        </button>

        <div className="card">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-navy">{compDetail.name}</h1>
              <p className="text-sm text-slate-500 mt-1 uppercase font-bold tracking-wider">
                {compDetail.status} Round {compDetail.currentRound} / {compDetail.totalRounds}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
              <label className="flex items-center text-sm text-slate-600 font-medium cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={forceOverride} 
                  onChange={(e) => setForceOverride(e.target.checked)} 
                  className="mr-2 rounded text-primary focus:ring-primary h-4 w-4"
                />
                Force Generate (Auto-rate Adjs)
              </label>
              <button onClick={() => handleGenerateMatches(compDetail._id)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm flex items-center text-sm transition-colors">
                <Play className="w-4 h-4 mr-2" /> Generate Next Round
              </button>
              <button onClick={() => handleDeleteComp(compDetail._id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm flex items-center text-sm transition-colors">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-5">
            {[
              { label: 'Checked In (Active)', value: checkedInAll.length, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
              { label: 'Approved (Pending CI)', value: approvedAll.length, color: 'text-blue-600 bg-blue-50 border-blue-100' },
              { label: 'Pending Approve', value: pendingAll.length, color: 'text-amber-600 bg-amber-50 border-amber-100' },
              { label: 'Total Matches', value: matches.filter(m => !m.isBye).length, color: 'text-slate-600 bg-slate-50 border-slate-100' },
            ].map((s, i) => (
              <div key={i} className={`rounded-lg p-3 text-center border ${s.color}`}>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs font-medium uppercase tracking-wide mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-1 bg-slate-100 rounded-lg p-1">
          {[
            { key: 'participants', label: 'Participants', icon: Users },
            { key: 'draws', label: 'Match Draws', icon: LayoutList },
            { key: 'issues', label: 'Issues', icon: AlertTriangle, badge: issues.filter(i => i.status === 'open').length },
            { key: 'leaderboard', label: 'Leaderboard', icon: BarChart3 },
          ].map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              onClick={() => setDetailTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all relative ${detailTab === key ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Icon className="w-4 h-4" /> {label}
              {badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 animate-pulse">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {detailTab === 'participants' && (
          <div className="space-y-6">
            {/* Pending Approval */}
            {pendingAll.length > 0 && (
              <div className="card border-l-4 border-l-amber-400">
                <h3 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" /> Pending Registrations
                </h3>
                <div className="space-y-3">
                  {pendingAll.map((u) => (
                    <div key={u._id} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div>
                        <p className="font-semibold text-navy">{u.name} <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">{u.role}</span></p>
                        <p className="text-sm text-slate-500">{u.email}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => handleApproveParticipant(compDetail._id, u._id)} className="text-green-600 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={() => handleRejectParticipant(compDetail._id, u._id)} className="text-red-600 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1">
                          <UserX className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Approved (Not Checked In) */}
              <div className="card">
                <h3 className="text-md font-bold text-navy mb-4 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-500" /> Approved (Registration Only)
                </h3>
                {approvedAll.length === 0 ? <p className="text-xs text-slate-400">No approved participants waiting to check in.</p> : (
                  <div className="space-y-2">
                    {approvedAll.map(u => (
                      <div key={u._id} className="text-sm p-2 bg-blue-50 rounded border border-blue-100 flex justify-between">
                        <span className="font-medium text-navy">{u.name}</span>
                        <span className="text-xs text-blue-400 uppercase">{u.role || (compDetail.approvedTeams.includes(u._id) ? 'Team' : 'Adj')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Checked In (Active) */}
              <div className="card">
                <h3 className="text-md font-bold text-navy mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Checked In (Ready)
                </h3>
                {checkedInAll.length === 0 ? <p className="text-xs text-slate-400">No one has checked in yet.</p> : (
                  <div className="space-y-2">
                    {checkedInAll.map(u => (
                      <div key={u._id} className="text-sm p-2 bg-emerald-50/50 rounded border border-emerald-100 flex justify-between">
                        <span className="font-medium text-emerald-800">{u.name}</span>
                        <span className="text-xs text-emerald-400 uppercase font-bold">Checked In</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ... Rest of tabs (Draws, Leaderboard) stay mostly the same ... */}
        {detailTab === 'draws' && (
          <div className="space-y-6">
            {roundNumbers.length === 0 ? (
              <div className="card text-center py-12">
                <LayoutList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No rounds generated. Generation uses **Checked In** participants only.</p>
              </div>
            ) : (
              roundNumbers.map((rn) => (
                <div key={rn} className="card">
                  <h3 className="text-lg font-bold text-navy mb-4">Round {rn}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Team A</th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">vs</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Team B</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Venue</th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matchesByRound[rn].map((m) => (
                          <tr key={m._id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 font-semibold text-navy">{m.teamA?.name || 'TBD'}</td>
                            <td className="py-3 px-4 text-center text-slate-400 font-bold">{m.isBye ? 'BYE' : 'vs'}</td>
                            <td className="py-3 px-4 font-semibold text-navy">{m.isBye ? '—' : (m.teamB?.name || 'TBD')}</td>
                            <td className="py-3 px-4 text-slate-600">{m.venue}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${m.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {m.status === 'completed' ? '✓ Done' : '● Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Issues Tab */}
        {detailTab === 'issues' && (
          <div className="space-y-4">
            {issues.filter(i => i.status === 'open').length === 0 && issues.filter(i => i.status === 'resolved').length === 0 ? (
              <div className="card text-center py-12">
                <MessageSquareWarning className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No issues have been raised yet.</p>
              </div>
            ) : (
              <>
                {/* Open Issues */}
                {issues.filter(i => i.status === 'open').length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Open Issues ({issues.filter(i => i.status === 'open').length})
                    </h3>
                    {issues.filter(i => i.status === 'open').map(issue => (
                      <div key={issue._id} className="card border-l-4 border-l-red-500 bg-red-50/30">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> OPEN
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(issue.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-navy">{issue.description}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                              <div className="bg-white rounded-lg p-2 border border-slate-200">
                                <p className="text-slate-400 uppercase font-bold tracking-wider mb-0.5">Room / Venue</p>
                                <p className="font-semibold text-slate-700">{issue.match?.venue || 'N/A'}</p>
                              </div>
                              <div className="bg-white rounded-lg p-2 border border-slate-200">
                                <p className="text-slate-400 uppercase font-bold tracking-wider mb-0.5">Teams</p>
                                <p className="font-semibold text-slate-700">
                                  {issue.match?.teamA?.name || 'TBD'} vs {issue.match?.teamB?.name || 'TBD'}
                                </p>
                              </div>
                              <div className="bg-white rounded-lg p-2 border border-slate-200">
                                <p className="text-slate-400 uppercase font-bold tracking-wider mb-0.5">Adjudicator(s)</p>
                                <p className="font-semibold text-slate-700">
                                  {issue.match?.adjudicators?.map(a => a.name).join(', ') || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500">
                              Raised by: <span className="font-semibold">{issue.raisedBy?.name}</span>
                              <span className="text-slate-400 ml-1">({issue.raisedBy?.role})</span>
                            </p>
                          </div>
                          <button
                            onClick={() => { setResolveModal(issue._id); setResolution(''); }}
                            className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                          >
                            <CheckCircle className="w-4 h-4" /> Mark Resolved
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Resolved Issues */}
                {issues.filter(i => i.status === 'resolved').length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h3 className="text-md font-bold text-slate-500 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Resolved ({issues.filter(i => i.status === 'resolved').length})
                    </h3>
                    {issues.filter(i => i.status === 'resolved').map(issue => (
                      <div key={issue._id} className="card border-l-4 border-l-emerald-400 opacity-75">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-3">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> RESOLVED
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(issue.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600">{issue.description}</p>
                            <div className="flex gap-4 text-xs text-slate-500">
                              <span>Room: <strong>{issue.match?.venue || 'N/A'}</strong></span>
                              <span>{issue.match?.teamA?.name || 'TBD'} vs {issue.match?.teamB?.name || 'TBD'}</span>
                            </div>
                            {issue.resolution && (
                              <p className="text-xs text-emerald-600 font-medium">
                                Resolution: {issue.resolution}
                                {issue.resolvedBy?.name && ` (by ${issue.resolvedBy.name})`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Resolve Issue Modal */}
        {resolveModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setResolveModal(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Resolve Issue</h3>
                </div>
                <button onClick={() => setResolveModal(null)} className="text-white/80 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Resolution note (optional)</label>
                  <textarea
                    rows={3}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all resize-none placeholder-slate-400"
                    placeholder="e.g. Replacement adjudicator sent, equipment fixed..."
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setResolveModal(null)}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleResolveIssue(resolveModal)}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Confirm Resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {detailTab === 'leaderboard' && (
          <div className="card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="text-lg font-bold text-navy">Standings</h3>
              <div className="flex bg-slate-100 p-1 rounded-md">
                <button 
                  onClick={() => setLbTab('teams')}
                  className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${lbTab === 'teams' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Teams
                </button>
                <button 
                  onClick={() => setLbTab('adjudicators')}
                  className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${lbTab === 'adjudicators' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Adjudicators
                </button>
              </div>
            </div>

            {lbTab === 'teams' ? (
              leaderboard.length === 0 ? <p className="text-slate-500 text-center py-8">No results yet.</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-center py-3 px-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Rank</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Team</th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Wins</th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Total Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((row) => (
                        <tr key={row.teamId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 text-center font-bold text-slate-500">{row.rank}</td>
                          <td className="py-3 px-4 font-semibold text-navy">{row.teamName}</td>
                          <td className="py-3 px-4 text-center font-bold text-emerald-600">{row.wins}</td>
                          <td className="py-3 px-4 text-center font-medium text-slate-700">{row.totalScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              adjLeaderboard.length === 0 ? <p className="text-slate-500 text-center py-8">No adjudicator ratings yet.</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-center py-3 px-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Rank</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Adjudicator</th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Avg Rating</th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Total Ratings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adjLeaderboard.map((row) => (
                        <tr key={row.adjudicatorId} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${row.rank <= 3 ? 'bg-amber-50/40' : ''}`}>
                          <td className="py-3 px-4 text-center font-bold text-slate-500">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${row.rank === 1 ? 'bg-yellow-400 text-white' : row.rank === 2 ? 'bg-slate-300 text-white' : row.rank === 3 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                              {row.rank}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-navy">{row.adjudicatorName}</td>
                          <td className="py-3 px-4 text-center font-bold text-primary">{row.averageRating.toFixed(1)} / 10</td>
                          <td className="py-3 px-4 text-center text-slate-500">{row.ratingCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">OC Dashboard</h1>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Create New Competition</h2>
        <form onSubmit={handleCreateComp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" className="input-field" value={newComp.name} onChange={e => setNewComp({...newComp, name: e.target.value})} required />
          </div>
          <div className="grid grid-cols-3 gap-2 md:col-span-2">
            <div><label className="block text-xs font-bold uppercase text-slate-400 mb-1">Rounds</label><input type="number" className="input-field" value={newComp.totalRounds} onChange={e => setNewComp({...newComp, totalRounds: e.target.value})} /></div>
            <div><label className="block text-xs font-bold uppercase text-slate-400 mb-1">Team Size</label><input type="number" className="input-field" value={newComp.teamSize} onChange={e => setNewComp({...newComp, teamSize: e.target.value})} /></div>
            <div><label className="block text-xs font-bold uppercase text-slate-400 mb-1">Adj/Match</label><input type="number" className="input-field" value={newComp.adjudicatorsPerMatch} onChange={e => setNewComp({...newComp, adjudicatorsPerMatch: e.target.value})} /></div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Venues</label>
            <input type="text" className="input-field" value={newComp.venues} onChange={e => setNewComp({...newComp, venues: e.target.value})} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary md:col-span-2">Create Competition</button>
        </form>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Your Competitions</h2>
        <div className="space-y-4">
          {competitions.map(c => (
            <div key={c._id} className="border border-slate-200 rounded-lg p-5 flex justify-between items-center hover:border-primary/30 transition-colors">
              <div>
                <h3 className="text-lg font-bold">{c.name}</h3>
                <p className="text-sm text-slate-500 uppercase font-bold">{c.status} | Round {c.currentRound}</p>
                <div className="flex gap-4 mt-2 text-xs font-bold">
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Active: {c.checkedInTeams?.length || 0} teams</span>
                  <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Approved: {c.approvedTeams?.length || 0} teams</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openCompDetail(c._id)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded font-medium flex items-center text-sm transition-colors">
                  <Eye className="w-4 h-4 mr-2" /> View
                </button>
                <button onClick={() => handleDeleteComp(c._id)} className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OCDashboard;
