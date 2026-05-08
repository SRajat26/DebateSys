import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { CheckCircle, Clock, MapPin, Users, Swords, BarChart3, LayoutList, Trophy, Send, UserCheck, AlertTriangle, X } from 'lucide-react';

const TeamDashboard = () => {
  const { user } = useContext(AuthContext);
  const [competitions, setCompetitions] = useState([]);
  const [activeCompId, setActiveCompId] = useState(null);
  const [matches, setMatches] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [adjLeaderboard, setAdjLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('myMatch');
  const [lbTab, setLbTab] = useState('teams'); // 'teams' | 'adjudicators'
  const [ratings, setRatings] = useState({}); // { [matchId_adjId]: number }
  const [issueModal, setIssueModal] = useState(false);
  const [issueMatchId, setIssueMatchId] = useState(null);
  const [issueDesc, setIssueDesc] = useState('');
  const [issueSubmitting, setIssueSubmitting] = useState(false);

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

  const handleRegister = async (compId) => {
    try {
      await api.put(`/competitions/${compId}/register`);
      alert("Registration submitted! Awaiting OC approval.");
      fetchCompetitions();
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleCheckIn = async (compId) => {
    try {
      await api.put(`/competitions/${compId}/checkin`);
      alert("Checked in successfully!");
      fetchCompetitions();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    }
  };

  const openCompetition = async (compId) => {
    setActiveCompId(compId);
    setActiveTab('myMatch');
    try {
      const [matchRes, lbRes, adjLbRes] = await Promise.all([
        api.get(`/competitions/${compId}/matches`),
        api.get(`/results/leaderboard/${compId}`),
        api.get(`/results/adjudicator-leaderboard/${compId}`),
      ]);
      setMatches(matchRes.data);
      setLeaderboard(lbRes.data);
      setAdjLeaderboard(adjLbRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Registration states: none -> pending -> approved -> checkedIn
  const getParticipantStatus = (comp) => {
    if (comp.checkedInTeams?.includes(user._id)) return 'checkedIn';
    if (comp.approvedTeams?.includes(user._id)) return 'approved';
    if (comp.pendingTeams?.includes(user._id)) return 'pending';
    return 'none';
  };

  // Find my matches
  const myMatches = matches.filter(
    (m) => m.teamA?._id === user._id || m.teamB?._id === user._id
  );

  const activeComp = competitions.find(c => c._id === activeCompId);
  const currentRound = activeComp?.currentRound || 0;
  const currentMatch = myMatches.find((m) => m.roundNumber === currentRound);
  const pastMatches = myMatches.filter((m) => m.roundNumber < currentRound);

  // Group matches by round
  const matchesByRound = {};
  matches.forEach((m) => {
    if (!matchesByRound[m.roundNumber]) matchesByRound[m.roundNumber] = [];
    matchesByRound[m.roundNumber].push(m);
  });
  const roundNumbers = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b);

  // List view
  if (!activeCompId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-navy">Team Dashboard</h1>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Available Tournaments</h2>
          {competitions.length === 0 ? (
            <p className="text-slate-500">No tournaments found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {competitions.map(c => {
                const status = getParticipantStatus(c);

                return (
                  <div key={c._id} className="border border-slate-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold text-navy mb-1">{c.name}</h3>
                    <div className="text-sm text-slate-500 mb-4 space-y-1">
                      <p>Status: <span className="uppercase font-medium text-slate-700">{c.status}</span></p>
                      <p>Round: <span className="font-medium text-slate-700">{c.currentRound} / {c.totalRounds}</span></p>
                    </div>

                    {status === 'none' && c.status === 'registration' && (
                      <button onClick={() => handleRegister(c._id)} className="w-full btn-primary flex justify-center items-center">
                        <Send className="w-4 h-4 mr-2" /> Register for Tournament
                      </button>
                    )}
                    {status === 'pending' && (
                      <div className="bg-amber-50 text-amber-700 py-2.5 text-center rounded-md text-sm font-medium border border-amber-200 flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4" /> Registration pending OC approval
                      </div>
                    )}
                    {status === 'approved' && (
                      <button onClick={() => handleCheckIn(c._id)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-md font-medium flex items-center justify-center transition-colors">
                        <UserCheck className="w-4 h-4 mr-2" /> Registration approved! Check In Now
                      </button>
                    )}
                    {status === 'checkedIn' && (
                      <button onClick={() => openCompetition(c._id)} className="w-full btn-primary flex items-center justify-center">
                        <Trophy className="w-4 h-4 mr-2" /> View Tournament
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleRateAdjudicator = async (matchId, adjudicatorId) => {
    const rating = ratings[`${matchId}_${adjudicatorId}`];
    if (rating === undefined || rating < 0 || rating > 10) {
      return alert("Please enter a rating between 0 and 10");
    }
    try {
      await api.put(`/results/${matchId}/rate`, { adjudicatorId, rating: Number(rating) });
      alert("Rating submitted!");
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  const openIssueModal = (matchId) => {
    setIssueMatchId(matchId);
    setIssueDesc('');
    setIssueModal(true);
  };

  const handleRaiseIssue = async () => {
    if (!issueDesc.trim()) return alert('Please describe the issue.');
    setIssueSubmitting(true);
    try {
      await api.post('/issues', { matchId: issueMatchId, description: issueDesc });
      alert('Issue raised successfully! The OC has been notified.');
      setIssueModal(false);
      setIssueDesc('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to raise issue');
    } finally {
      setIssueSubmitting(false);
    }
  };

  // Competition detail view
  return (
    <div className="space-y-6">
      <button onClick={() => { setActiveCompId(null); setMatches([]); setLeaderboard([]); setAdjLeaderboard([]); setRatings({}); }} className="flex items-center text-sm text-slate-500 hover:text-primary transition-colors font-medium">
        ← Back to Tournaments
      </button>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-navy">{activeComp?.name}</h1>
        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-green-200">
          <CheckCircle className="w-3.5 h-3.5" /> Checked In
        </span>
      </div>

      {/* Tab nav */}
      <div className="flex space-x-1 bg-slate-100 rounded-lg p-1">
        {[
          { key: 'myMatch', label: 'My Matches', icon: Swords },
          { key: 'draws', label: 'All Draws', icon: LayoutList },
          { key: 'leaderboard', label: 'Leaderboard', icon: BarChart3 },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === key ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* My Matches Tab */}
      {activeTab === 'myMatch' && (
        <div className="space-y-6">
          {currentMatch ? (
            <div className="card border-l-4 border-l-primary">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">Current Match — Round {currentRound}</h3>
              <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-navy">{currentMatch.teamA?.name || 'TBD'}</p>
                  <p className="text-xs text-slate-500 uppercase mt-1">Team A{currentMatch.teamA?._id === user._id ? ' (You)' : ''}</p>
                </div>
                <div className="text-center">
                  {currentMatch.isBye ? (
                    <span className="text-lg font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-full">BYE</span>
                  ) : (
                    <span className="text-2xl font-bold text-slate-300">VS</span>
                  )}
                </div>
                {!currentMatch.isBye && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-navy">{currentMatch.teamB?.name || 'TBD'}</p>
                    <p className="text-xs text-slate-500 uppercase mt-1">Team B{currentMatch.teamB?._id === user._id ? ' (You)' : ''}</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium">{currentMatch.venue}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>Adj: {currentMatch.adjudicators?.map(a => a.name).join(', ') || '—'}</span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${currentMatch.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {currentMatch.status === 'completed' ? '✓ Completed' : '● In Progress'}
                </span>
              </div>
              {/* Raise Issue Button */}
              {currentMatch.status !== 'completed' && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => openIssueModal(currentMatch._id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all"
                  >
                    <AlertTriangle className="w-4 h-4" /> Raise an Issue
                  </button>
                </div>
              )}
              {/* Rate Adjudicators for current completed match */}
              {currentMatch.status === 'completed' && !currentMatch.isBye && currentMatch.adjudicators && currentMatch.adjudicators.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 bg-white p-4 rounded-lg">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Rate Adjudicators</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentMatch.adjudicators.map(adj => (
                      <div key={adj._id} className="flex items-center justify-between text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="font-medium text-slate-700">{adj.name}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0" max="10"
                            placeholder="0-10"
                            className="w-16 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                            value={ratings[`${currentMatch._id}_${adj._id}`] || ''}
                            onChange={(e) => setRatings(prev => ({ ...prev, [`${currentMatch._id}_${adj._id}`]: e.target.value }))}
                          />
                          <button
                            onClick={() => handleRateAdjudicator(currentMatch._id, adj._id)}
                            className="bg-primary text-white text-xs px-3 py-1.5 rounded hover:bg-primary/90 transition-colors font-medium"
                          >
                            Rate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : currentRound > 0 ? (
            <div className="card text-center py-8">
              <p className="text-slate-500">No match assigned for the current round.</p>
            </div>
          ) : (
            <div className="card text-center py-8">
              <p className="text-slate-500">The tournament hasn't started yet. Wait for the OC to generate matches from checked-in teams.</p>
            </div>
          )}

          {pastMatches.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-bold text-navy mb-4">Match History</h3>
              <div className="space-y-3">
                {pastMatches.sort((a, b) => b.roundNumber - a.roundNumber).map((m) => (
                  <div key={m._id} className="flex flex-col">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3">
                        <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded">R{m.roundNumber}</span>
                        <div>
                          <p className="font-semibold text-navy">
                            {m.teamA?.name || 'TBD'} {m.isBye ? '(BYE)' : `vs ${m.teamB?.name || 'TBD'}`}
                          </p>
                          <p className="text-xs text-slate-500">Venue: {m.venue}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${m.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {m.status === 'completed' ? '✓ Done' : '● Pending'}
                      </span>
                    </div>
                    {/* Rating Section */}
                    {m.status === 'completed' && !m.isBye && m.adjudicators && m.adjudicators.length > 0 && (
                      <div className="mt-2 bg-white p-3 rounded-lg border border-slate-100 flex flex-col gap-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rate Adjudicators</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {m.adjudicators.map(adj => (
                            <div key={adj._id} className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded">
                              <span className="font-medium text-slate-700">{adj.name}</span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0" max="10"
                                  placeholder="0-10"
                                  className="w-16 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                  value={ratings[`${m._id}_${adj._id}`] || ''}
                                  onChange={(e) => setRatings(prev => ({ ...prev, [`${m._id}_${adj._id}`]: e.target.value }))}
                                />
                                <button
                                  onClick={() => handleRateAdjudicator(m._id, adj._id)}
                                  className="bg-primary text-white text-xs px-2 py-1 rounded hover:bg-primary/90 transition-colors"
                                >
                                  Rate
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* All Draws Tab */}
      {activeTab === 'draws' && (
        <div className="space-y-6">
          {roundNumbers.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-slate-500">No rounds generated yet.</p>
            </div>
          ) : (
            roundNumbers.map((rn) => (
              <div key={rn} className="card">
                <h3 className="text-lg font-bold text-navy mb-4">
                  <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded mr-3">R{rn}</span>
                  Round {rn}
                </h3>
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
                      {matchesByRound[rn].map((m) => {
                        const isMyMatch = m.teamA?._id === user._id || m.teamB?._id === user._id;
                        return (
                          <tr key={m._id} className={`border-b border-slate-100 transition-colors ${isMyMatch ? 'bg-blue/10 font-semibold' : 'hover:bg-slate-50'}`}>
                            <td className="py-3 px-4 text-navy">{m.teamA?.name || 'TBD'} {m.teamA?._id === user._id ? '⭐' : ''}</td>
                            <td className="py-3 px-4 text-center text-slate-400 font-bold">{m.isBye ? 'BYE' : 'vs'}</td>
                            <td className="py-3 px-4 text-navy">{m.isBye ? '—' : (m.teamB?.name || 'TBD')} {m.teamB?._id === user._id ? '⭐' : ''}</td>
                            <td className="py-3 px-4 text-slate-600">{m.venue}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${m.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {m.status === 'completed' ? '✓ Done' : '● Pending'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
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
            leaderboard.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No team results submitted yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-center py-3 px-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Rank</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Team</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Wins</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Total Score</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Matches</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((row) => (
                      <tr key={row.teamId} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${row.teamId === user._id ? 'bg-blue/10' : ''} ${row.rank <= 3 ? 'bg-amber-50/40' : ''}`}>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${row.rank === 1 ? 'bg-yellow-400 text-white' : row.rank === 2 ? 'bg-slate-300 text-white' : row.rank === 3 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {row.rank}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-navy">{row.teamName} {row.teamId === user._id ? '⭐' : ''}</td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-600">{row.wins}</td>
                        <td className="py-3 px-4 text-center font-medium text-slate-700">{row.totalScore}</td>
                        <td className="py-3 px-4 text-center text-slate-500">{row.matchesPlayed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            adjLeaderboard.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No adjudicator ratings submitted yet.</p>
            ) : (
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
                        <td className="py-3 px-4 text-center">
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
      {/* Issue Modal */}
      {issueModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIssueModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-0 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Raise an Issue</h3>
              </div>
              <button onClick={() => setIssueModal(false)} className="text-white/80 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 border border-slate-200">
                <p className="font-semibold text-slate-700 mb-1">This will notify the OC about an issue in your current match.</p>
                <p className="text-xs text-slate-500">Room, teams, and adjudicator info will be sent automatically.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Describe the issue</label>
                <textarea
                  rows={4}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all resize-none placeholder-slate-400"
                  placeholder="e.g. Adjudicator hasn't arrived, projector not working, wrong room assignment..."
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIssueModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRaiseIssue}
                  disabled={issueSubmitting || !issueDesc.trim()}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {issueSubmitting ? 'Submitting...' : (<><AlertTriangle className="w-4 h-4" /> Submit Issue</>)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDashboard;
