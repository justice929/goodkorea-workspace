import React, { useState } from 'react';
import { Check, Star, Play, Trophy, Sparkles, BookOpen, Droplets, Footprints, Flame, Plus, Crown } from 'lucide-react';
import './index.css';

const DragonGraphic = ({ level }) => {
  const stage = Math.min(level, 6);
  return (
    <img 
      src={`/images/dragon_stage_${stage}.png`} 
      alt={`Dragon Stage ${stage}`} 
      className={`dragon-graphic animate-float`}
    />
  );
};

const LandingScreen = ({ onStart }) => (
  <div className="screen landing-screen animate-bounce-in">
    <div className="egg-container">
      <DragonGraphic level={1} />
    </div>
    <h1 className="title">Adopt your Dragon!</h1>
    <p className="subtitle">
      Build healthy exercise habits every day to help your dragon evolve to the ultimate form.
    </p>
    <button className="btn btn-primary" onClick={onStart}>
      <Play className="icon" fill="currentColor" />
      Start Journey
    </button>
  </div>
);

const DexModal = ({ onClose }) => (
  <div className="modal-overlay">
    <div className="card modal-content animate-bounce-in" style={{ maxWidth: '32rem', padding: '1.5rem', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
      <h2 className="modal-title" style={{ fontSize: '1.5rem' }}>Dragon Dex</h2>
      <p className="text-muted mb-4">Discover all the stages of your Dragon!</p>
      
      <div className="dex-grid" style={{ overflowY: 'auto', paddingRight: '10px' }}>
        {[1,2,3,4,5,6].map(stage => (
          <div className="dex-item" key={stage}>
            <div style={{ height: '7rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              <img src={`/images/dragon_stage_${stage}.png`} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} alt={`Stage ${stage}`} />
            </div>
            <h3 className="dex-item-title">Level {stage}</h3>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
        <button className="btn btn-secondary" onClick={onClose}>Close Dex</button>
      </div>
    </div>
  </div>
);

const EvolutionModal = ({ onClose, level, isPrestige }) => (
  <div className="modal-overlay">
    <div className="card modal-content animate-bounce-in">
      <div className="modal-bg-glow"></div>
      <Sparkles className="modal-icon animate-pulse-slow" />
      <h2 className="modal-title">{isPrestige ? 'Prestige Rebirth!' : 'Level Up!'}</h2>
      <p className="modal-subtitle">
        {isPrestige 
          ? 'Your Elder Dragon ascended! A new mystical egg appeared with a permanent XP boost!' 
          : `Your dragon has evolved to Level ${level}!`}
      </p>
      
      <div className="modal-graphic-wrapper animate-float">
        <DragonGraphic level={level} />
      </div>
      
      <button className="btn btn-secondary" onClick={onClose} style={{ position: 'relative', zIndex: 1 }}>
        Awesome!
      </button>
    </div>
  </div>
);

const DashboardScreen = ({ xp, level, prestige, missions, progressMission, openDex }) => {
  const currentMaxXp = level < 6 ? level * 200 : 1500; // XP scale for dragon
  const xpPercentage = Math.min((xp / currentMaxXp) * 100, 100);
  
  const getStageName = (lvl) => {
    const names = ['Mystic Egg', 'Hatchling', 'Fledgling', 'Drake', 'Adult Dragon', 'Elder Dragon'];
    return names[Math.min(lvl - 1, 5)];
  };

  const getIcon = (name) => {
    if (name === 'Droplets') return <Droplets className="mission-icon" />;
    if (name === 'Footprints') return <Footprints className="mission-icon" />;
    if (name === 'Flame') return <Flame className="mission-icon" />;
    return <Star className="mission-icon" />;
  };
  
  return (
    <div className="screen">
      <div className="dashboard-header">
        <div>
          <h2 className="header-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            My Dragon
            {prestige > 0 && <span className="prestige-badge"><Crown size={14} /> +{prestige * 10}% XP</span>}
          </h2>
          <p className="text-muted text-sm">Level {level} • {getStageName(level)}</p>
        </div>
        <div className="level-badge">
          <Trophy className="icon" style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.25rem' }} />
          <span>{Math.floor(xp)} XP</span>
        </div>
      </div>

      <div className="card slime-display-card">
        <div className="slime-glow-1"></div>
        <div className="slime-glow-2"></div>
        
        <div className="slime-stage">
          <div className="slime-stage-inner">
            <DragonGraphic level={level} />
          </div>
        </div>

        <div className="progress-header">
          <span className="text-muted">{level < 6 ? `Progress to Lvl ${level + 1}` : 'Progress to Prestige'}</span>
          <span className="text-secondary">{Math.round(xpPercentage)}%</span>
        </div>
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${xpPercentage}%` }}></div>
        </div>
      </div>

      <div className="quest-title">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Star className="quest-icon" fill="currentColor" />
          Today's Missions
        </div>
        <button onClick={openDex} style={{ background: 'none', border: 'none', color: 'var(--on-surface-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
          <BookOpen size={16} style={{ marginRight: '4px' }} />
          Dragon Dex
        </button>
      </div>
      
      <div className="quest-list">
        {missions.map((mission) => {
          const isComplete = mission.currentStep >= mission.steps.length;
          const nextTarget = isComplete ? mission.steps[mission.steps.length - 1] : mission.steps[mission.currentStep];
          const nextXp = isComplete ? 0 : mission.xpPerStep[mission.currentStep];
          
          return (
            <div key={mission.id} className={`habit-item ${isComplete ? 'completed' : ''}`}>
              <div className="mission-icon-wrapper">
                {getIcon(mission.icon)}
              </div>
              <div className="mission-info">
                <div className="mission-name">{mission.title}</div>
                <div className="mission-target">
                  {mission.currentStep > 0 && !isComplete && <span>{mission.steps[mission.currentStep - 1]} {mission.unit} → </span>}
                  <span style={{ fontWeight: 'bold' }}>{nextTarget} {mission.unit}</span>
                  {!isComplete && <span className="mission-reward"> (+{nextXp} XP)</span>}
                </div>
              </div>
              <button 
                className="mission-add-btn" 
                onClick={() => progressMission(mission.id)}
                disabled={isComplete}
              >
                {isComplete ? <Check size={20} /> : <Plus size={20} strokeWidth={3} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [showDexModal, setShowDexModal] = useState(false);
  
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [prestige, setPrestige] = useState(0);
  const [isPrestigeModal, setIsPrestigeModal] = useState(false);
  
  const [missions, setMissions] = useState([
    { id: 'water', title: 'Hydration', icon: 'Droplets', unit: 'ml', steps: [500, 1000, 1500, 2000], xpPerStep: [10, 10, 15, 25], currentStep: 0 },
    { id: 'walk', title: 'Daily Steps', icon: 'Footprints', unit: 'steps', steps: [1000, 3000, 5000], xpPerStep: [10, 20, 30], currentStep: 0 },
    { id: 'stretch', title: 'Stretching', icon: 'Flame', unit: 'mins', steps: [5, 10], xpPerStep: [15, 25], currentStep: 0 },
  ]);

  const handleStart = () => setCurrentScreen('dashboard');
  
  const progressMission = (id) => {
    setMissions(prev => prev.map(m => {
      if (m.id === id && m.currentStep < m.steps.length) {
        const xpGained = m.xpPerStep[m.currentStep];
        addXp(xpGained);
        return { ...m, currentStep: m.currentStep + 1 };
      }
      return m;
    }));
  };

  const addXp = (amount) => {
    // Apply prestige multiplier (10% per prestige level)
    const multiplier = 1 + (prestige * 0.1);
    const finalAmount = amount * multiplier;
    
    let newXp = xp + finalAmount;
    let newLevel = level;
    let didEvolve = false;
    let didPrestige = false;
    
    let maxForCurrentLevel = newLevel < 6 ? newLevel * 200 : 1500;

    while (newXp >= maxForCurrentLevel) {
      if (newLevel < 6) {
        newLevel++;
        newXp -= maxForCurrentLevel;
        didEvolve = true;
      } else {
        // Prestige!
        setPrestige(p => p + 1);
        newLevel = 1;
        newXp -= maxForCurrentLevel;
        didPrestige = true;
        break; // break the loop and show prestige modal
      }
      maxForCurrentLevel = newLevel < 6 ? newLevel * 200 : 1500;
    }
    
    setLevel(newLevel);
    setXp(newXp);
    
    if (didPrestige) {
      setIsPrestigeModal(true);
      setShowEvolutionModal(true);
    } else if (didEvolve) {
      setIsPrestigeModal(false);
      setShowEvolutionModal(true);
    }
  };

  return (
    <div className="app-container">
      {currentScreen === 'landing' && <LandingScreen onStart={handleStart} />}
      
      {currentScreen === 'dashboard' && (
        <DashboardScreen 
          xp={xp} 
          level={level} 
          prestige={prestige}
          missions={missions} 
          progressMission={progressMission} 
          openDex={() => setShowDexModal(true)}
        />
      )}
      
      {showEvolutionModal && (
        <EvolutionModal 
          level={level} 
          isPrestige={isPrestigeModal}
          onClose={() => setShowEvolutionModal(false)} 
        />
      )}
      
      {showDexModal && (
        <DexModal onClose={() => setShowDexModal(false)} />
      )}
    </div>
  );
}

export default App;
