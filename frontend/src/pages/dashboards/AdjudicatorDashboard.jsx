import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Clock, CheckCircle, MapPin, Users, Swords, BarChart3, LayoutList, Trophy, Send, MessageSquare, UserCheck } from 'lucide-react';

const AdjudicatorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [competitions, setCompetitions] = useState([]);
  const [activeCompId, setActiveCompId] = useState(null);
  const [matches, setMatches] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('myMatch');

  // Score form state
  const [scoreForm, setScoreForm] = useState({
    matchId: null,
    teamAScore: '',
    teamBScore: '',
    winningTeam: '',
    feedback: '',
  });
  const [submitting, setSubmitting] = useState(false);

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
    await refreshData(compId);
  };

  const refreshData = async (compId) => {
    try {
      const [matchRes, lbRes] = await Promise.all([
        api.get(`/competitions/${compId}/matches`),
        api.get(`/results/leaderboard/${compId}`),
      ]);
      setMatches(matchRes.data);
      setLeaderboard(lbRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitScore = async (e) => {
    e.preventDefault();
    if (!scoreForm.matchId) return;
    setSubmitting(true);
    try {
      await api.post(`/matches/${scoreForm.matchId}/result`, {
        teamAScore: Number(scoreForm.teamAScore),
        teamBScore: Number(scoreForm.teamBScore),
        winningTeam: scoreForm.winningTeam || null,
        feedback: scoreForm.feedback,
      });
      alert("Result submitted successfully!");
      setScoreForm({ matchId: null, teamAScore: '', teamBScore: '', winningTeam: '', feedback: '' });
      await refreshData(activeCompId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit result');
    } finally {
      setSubmitting(false);
    }
  };

  // Participant status for each competition
  const getParticipantStatus = (comp) => {
    if (comp.checkedInAdjudicators?.includes(user._id)) return 'checkedIn';
    if (comp.approvedAdjudicators?.includes(user._id)) return 'approved';
    if (comp.pendingAdjudicators?.includes(user._id)) return 'pending';
    return 'none';
  };

  // My assigned matches
  const myMatches = matches.filter(
    (m) => m.adjudicators?.some(a => a._id === user._id)
  );

  const activeComp = competitions.find(c => c._id === activeCompId);
  const currentRound = activeComp?.currentRound || 0;
  const currentMatch = myMatches.find((m) => m.roundNumber === currentRound);
  const pastMatches = myMatches.filter((m) => m.roundNumber < currentRound);

  // Group all matches by round
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
        <h1 className="text-2xl font-bold text-slate-800">Adjudicator Dashboard</h1>

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
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{c.name}</h3>
                    <div className="text-sm text-slate-500 mb-4 space-y-1">
                      <p>Status: <span className="uppercase font-medium text-slate-700">{c.status}</span></p>
                      <p>Round: <span className="font-medium text-slate-700">{c.currentRound} / {c.totalRounds}</span></p>
                    </div>

                    {status === 'none' && c.status === 'registration' && (
                      <button onClick={() => handleRegister(c._id)} className="w-full btn-primary flex justify-center items-center">
                        <Send className="w-4 h-4 mr-2" /> Register as Adjudicator
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

  // Competition detail view
  return (
    <div className="space-y-6">
      <button onClick={() => { setActiveCompId(null); setMatches([]); setLeaderboard([]); }} className="flex items-center text-sm text-slate-500 hover:text-primary transition-colors font-medium">
        ← Back to Tournaments
      </button>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">{activeComp?.name}</h1>
        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-green-200">
           <CheckCircle className="w-3.5 h-3.5" /> Checked In
        </span>
      </div>

      {/* Tab nav */}
      <div className="flex space-x-1 bg-slate-100 rounded-lg p-1">
        {[
          { key: 'myMatch', label: 'My Assigned', icon: Swords },
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

      {/* My Assigned Match Tab */}
      {activeTab === 'myMatch' && (
        <div className="space-y-6">
          {/* Current Match */}
          {currentMatch ? (
            <div className="card border-l-4 border-l-purple-500">
              <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-3">Your Assignment — Round {currentRound}</h3>
              <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800">{currentMatch.teamA?.name || 'TBD'}</p>
                  <p className="text-xs text-slate-500 uppercase mt-1">Team A</p>
                </div>
                <span className="text-2xl font-bold text-slate-300">VS</span>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800">{currentMatch.teamB?.name || 'TBD'}</p>
                  <p className="text-xs text-slate-500 uppercase mt-1">Team B</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">{currentMatch.venue}</span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${currentMatch.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {currentMatch.status === 'completed' ? '✓ Result Submitted' : '● Awaiting Result'}
                </span>
              </div>

              {/* Score Submission Form */}
              {currentMatch.status !== 'completed' && (
                <form onSubmit={handleSubmitScore} className="mt-6 border-t border-slate-100 pt-6">
                  <h4 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Send className="w-4 h-4 text-primary" /> Submit Result
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-slate-700">{currentMatch.teamA?.name || 'Team A'} Score</label>
                      <input
                        type="number"
                        min="0"
                        className="input-field"
                        value={scoreForm.matchId === currentMatch._id ? scoreForm.teamAScore : ''}
                        onFocus={() => setScoreForm(prev => ({ ...prev, matchId: currentMatch._id }))}
                        onChange={(e) => setScoreForm(prev => ({ ...prev, matchId: currentMatch._id, teamAScore: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-slate-700">{currentMatch.teamB?.name || 'Team B'} Score</label>
                      <input
                        type="number"
                        min="0"
                        className="input-field"
                        value={scoreForm.matchId === currentMatch._id ? scoreForm.teamBScore : ''}
                        onFocus={() => setScoreForm(prev => ({ ...prev, matchId: currentMatch._id }))}
                        onChange={(e) => setScoreForm(prev => ({ ...prev, matchId: currentMatch._id, teamBScore: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1 text-slate-700">Winning Team</label>
                      <select
                        className="input-field"
                        value={scoreForm.matchId === currentMatch._id ? scoreForm.winningTeam : ''}
                        onFocus={() => setScoreForm(prev => ({ ...prev, matchId: currentMatch._id }))}
                        onChange={(e) => setScoreForm(prev => ({ ...prev, matchId: currentMatch._id, winningTeam: e.target.value }))}
                        required
                      >
                        <option value="">Select winner...</option>
                        <option value={currentMatch.teamA?._id}>{currentMatch.teamA?.name || 'Team A'}</option>
                        <option value={currentMatch.teamB?._id}>{currentMatch.teamB?.name || 'Team B'}</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1 text-slate-700 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> Feedback (optional)
                      </label>
                      <textarea
                        rows={3}
                        className="input-field"
                        placeholder="Provide feedback on the debate performance..."
                        value={scoreForm.matchId === currentMatch._id ? scoreForm.feedback : ''}
                        onFocus={() => setScoreForm(prev => ({ ...prev, matchId: currentMatch._id }))}
                        onChange={(e) => setScoreForm(prev => ({ ...prev, matchId: currentMatch._id, feedback: e.target.value }))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                      >
                        <Send className="w-4 h-4" />
                        {submitting ? 'Submitting...' : 'Submit Result'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          ) : currentRound > 0 ? (
            <div className="card text-center py-8">
              <p className="text-slate-500">No match assigned for the current round.</p>
            </div>
          ) : (
            <div className="card text-center py-8">
              <p className="text-slate-500">The tournament hasn't started yet. Matches are generated only for checked-in adjudicators.</p>
            </div>
          )}

          {pastMatches.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Past Assignments</h3>
              <div className="space-y-3">
                {pastMatches.sort((a, b) => b.roundNumber - a.roundNumber).map((m) => (
                  <div key={m._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded">R{m.roundNumber}</span>
                      <div>
                        <p className="font-semibold text-slate-800">{m.teamA?.name || 'TBD'} vs {m.teamB?.name || 'TBD'}</p>
                        <p className="text-xs text-slate-500">Venue: {m.venue}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${m.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {m.status === 'completed' ? '✓ Done' : '● Pending'}
                    </span>
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
                <h3 className="text-lg font-bold text-slate-800 mb-4">
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
                        <th className="text-left py-3 px-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Adjudicator(s)</th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchesByRound[rn].map((m) => {
                        const isMyMatch = m.adjudicators?.some(a => a._id === user._id);
                        return (
                          <tr key={m._id} className={`border-b border-slate-100 transition-colors ${isMyMatch ? 'bg-purple-50/60' : 'hover:bg-slate-50'}`}>
                            <td className="py-3 px-4 font-semibold text-slate-800">{m.teamA?.name || 'TBD'}</td>
                            <td className="py-3 px-4 text-center text-slate-400 font-bold">{m.isBye ? 'BYE' : 'vs'}</td>
                            <td className="py-3 px-4 font-semibold text-slate-800">{m.isBye ? '—' : (m.teamB?.name || 'TBD')}</td>
                            <td className="py-3 px-4 text-slate-600">{m.venue}</td>
                            <td className="py-3 px-4 text-slate-600">
                              {m.adjudicators?.map(a => (
                                <span key={a._id} className={a._id === user._id ? 'font-bold text-purple-600' : ''}>
                                  {a.name}
                                </span>
                              )).reduce((prev, curr) => prev.length ? [...prev, ', ', curr] : [curr], []) || '—'}
                            </td>
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
          <h3 className="text-lg font-bold text-slate-800 mb-4">Team Standings</h3>
          {leaderboard.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No results submitted yet.</p>
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
                    <tr key={row.teamId} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${row.rank <= 3 ? 'bg-amber-50/40' : ''}`}>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${row.rank === 1 ? 'bg-yellow-400 text-white' : row.rank === 2 ? 'bg-slate-300 text-white' : row.rank === 3 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {row.rank}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{row.teamName}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">{row.wins}</td>
                      <td className="py-3 px-4 text-center font-medium text-slate-700">{row.totalScore}</td>
                      <td className="py-3 px-4 text-center text-slate-500">{row.matchesPlayed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdjudicatorDashboard;
