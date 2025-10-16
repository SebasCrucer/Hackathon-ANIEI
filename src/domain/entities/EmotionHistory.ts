/**
 * Historial de emociones para análisis temporal y comparaciones
 */

export interface EmotionSnapshot {
  timestamp: number;
  valence: number;
  intensidad: number;
  confidence: number;
  stressLevel: number;
  dominantEmotion: string;
  emotions: {
    angry: number;
    disgust: number;
    fear: number;
    happy: number;
    sad: number;
    surprise: number;
    neutral: number;
  };
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  averageValence: number;
  averageIntensidad: number;
  averageStress: number;
  emotionCounts: Record<string, number>;
  totalMeasurements: number;
  peakStressTime?: string; // HH:MM
  calmestTime?: string; // HH:MM
}

export class EmotionHistory {
  private snapshots: EmotionSnapshot[] = [];
  private maxSnapshots: number = 1000; // Mantener últimas 1000 mediciones
  
  addSnapshot(snapshot: EmotionSnapshot): void {
    this.snapshots.push(snapshot);
    
    // Mantener solo las últimas maxSnapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }
  }

  getSnapshots(startTime?: number, endTime?: number): EmotionSnapshot[] {
    if (!startTime && !endTime) {
      return [...this.snapshots];
    }
    
    return this.snapshots.filter(s => {
      if (startTime && s.timestamp < startTime) return false;
      if (endTime && s.timestamp > endTime) return false;
      return true;
    });
  }

  getTodaySnapshots(): EmotionSnapshot[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.getSnapshots(today.getTime());
  }

  getLastNMinutes(minutes: number): EmotionSnapshot[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.getSnapshots(cutoff);
  }

  getDailyStats(date: Date = new Date()): DailyStats | null {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const daySnapshots = this.getSnapshots(startOfDay.getTime(), endOfDay.getTime());

    if (daySnapshots.length === 0) {
      return null;
    }

    const emotionCounts: Record<string, number> = {};
    let totalValence = 0;
    let totalIntensidad = 0;
    let totalStress = 0;
    let maxStress = 0;
    let minStress = 100;
    let peakStressTime = '';
    let calmestTime = '';

    daySnapshots.forEach(snapshot => {
      totalValence += snapshot.valence;
      totalIntensidad += snapshot.intensidad;
      totalStress += snapshot.stressLevel;

      emotionCounts[snapshot.dominantEmotion] = 
        (emotionCounts[snapshot.dominantEmotion] || 0) + 1;

      if (snapshot.stressLevel > maxStress) {
        maxStress = snapshot.stressLevel;
        const time = new Date(snapshot.timestamp);
        peakStressTime = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
      }

      if (snapshot.stressLevel < minStress) {
        minStress = snapshot.stressLevel;
        const time = new Date(snapshot.timestamp);
        calmestTime = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
      }
    });

    const count = daySnapshots.length;

    return {
      date: date.toISOString().split('T')[0],
      averageValence: totalValence / count,
      averageIntensidad: totalIntensidad / count,
      averageStress: totalStress / count,
      emotionCounts,
      totalMeasurements: count,
      peakStressTime,
      calmestTime,
    };
  }

  getAverageStress(minutes: number = 5): number {
    const recent = this.getLastNMinutes(minutes);
    if (recent.length === 0) return 0;
    
    const total = recent.reduce((sum, s) => sum + s.stressLevel, 0);
    return total / recent.length;
  }

  getStressTrend(minutes: number = 10): 'increasing' | 'decreasing' | 'stable' {
    const recent = this.getLastNMinutes(minutes);
    if (recent.length < 2) return 'stable';

    const midpoint = Math.floor(recent.length / 2);
    const firstHalf = recent.slice(0, midpoint);
    const secondHalf = recent.slice(midpoint);

    const avgFirst = firstHalf.reduce((sum, s) => sum + s.stressLevel, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, s) => sum + s.stressLevel, 0) / secondHalf.length;

    const diff = avgSecond - avgFirst;
    
    if (Math.abs(diff) < 5) return 'stable';
    return diff > 0 ? 'increasing' : 'decreasing';
  }

  clear(): void {
    this.snapshots = [];
  }

  // Persistencia en localStorage
  saveToLocalStorage(): void {
    try {
      localStorage.setItem('emotionHistory', JSON.stringify(this.snapshots));
    } catch (error) {
      console.error('Error saving history to localStorage:', error);
    }
  }

  loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('emotionHistory');
      if (stored) {
        this.snapshots = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading history from localStorage:', error);
    }
  }
}
