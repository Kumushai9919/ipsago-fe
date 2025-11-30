'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, AlertCircle, Play, Pause } from 'lucide-react'

interface InterviewTimerProps {
  duration?: number // minutes
  onTimeUp?: () => void
  phase?: string
  onPhaseChange?: (phase: string) => void
}

export function InterviewTimer({ 
  duration = 30, 
  onTimeUp, 
  phase = 'interview',
  onPhaseChange 
}: InterviewTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60) // convert to seconds
  const [isActive, setIsActive] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const hasCalledTimeUp = useRef(false) // Add this to prevent multiple calls

  useEffect(() => {
    if (!isActive || isPaused || timeLeft <= 0) {
      // Only call onTimeUp once when time reaches 0
      if (timeLeft <= 0 && onTimeUp && !hasCalledTimeUp.current) {
        hasCalledTimeUp.current = true // Mark as called
        onTimeUp()
      }
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, isPaused, timeLeft, onTimeUp])

  // Reset the flag when timer is reset/restarted
  useEffect(() => {
    if (timeLeft > 0) {
      hasCalledTimeUp.current = false
    }
  }, [timeLeft])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  
  const isLowTime = timeLeft < 300 // less than 5 minutes
  const isCritical = timeLeft < 60 // less than 1 minute

  const formatTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  const handlePhaseSkip = () => {
    const phases = ['intro', 'technical', 'behavioral', 'closing', 'feedback']
    const currentIndex = phases.indexOf(phase)
    const nextPhase = phases[currentIndex + 1] || 'feedback'
    onPhaseChange?.(nextPhase)
  }

  // Add restart function
  const handleRestart = () => {
    setTimeLeft(duration * 60)
    setIsActive(true)
    setIsPaused(false)
    hasCalledTimeUp.current = false
  }

  return (
    <Card className={`p-3 transition-all duration-300 ${
      isCritical 
        ? 'bg-slate-900/50 border-red-500/20' 
        : isLowTime 
        ? 'bg-slate-900/50 border-orange-500/20'
        : 'bg-slate-900/50 border-slate-700/30'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${
            isCritical ? 'text-red-400' : isLowTime ? 'text-orange-400' : 'text-slate-400'
          }`} />
          <span className="text-xs font-medium text-slate-400">Interview Timer</span>
        </div>
        
        <div className="flex items-center gap-2">
          {timeLeft > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className="h-6 w-6 p-0 hover:bg-slate-800"
            >
              {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestart}
              className="h-6 px-2 text-[10px] bg-slate-800/50 border-slate-700"
            >
              Restart
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <span className={`font-mono text-xl font-semibold ${
          timeLeft <= 0
            ? 'text-red-400'
            : isCritical 
            ? 'text-red-400' 
            : isLowTime 
            ? 'text-orange-400' 
            : 'text-slate-300'
        }`}>
          {timeLeft <= 0 ? '00:00' : formatTime}
        </span>
        
        {isLowTime && timeLeft > 0 && (
          <AlertCircle className={`w-4 h-4 ${
            isCritical ? 'text-red-400 animate-pulse' : 'text-orange-400'
          }`} />
        )}
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <Badge className={`text-[10px] font-medium px-2 py-0.5 ${
          timeLeft <= 0 
            ? 'bg-red-500/10 text-red-400 border-red-500/20'
            : isCritical 
            ? 'bg-red-500/10 text-red-400 border-red-500/20'
            : isLowTime 
            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
            : 'bg-slate-700/30 text-slate-400 border-slate-600/30'
        }`}>
          {timeLeft <= 0 ? 'Time Up' : phase.charAt(0).toUpperCase() + phase.slice(1)} Phase
        </Badge>
        
        {onPhaseChange && timeLeft > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handlePhaseSkip}
            className="h-6 text-[10px] px-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800"
          >
            Next Phase
          </Button>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-slate-800/30 rounded-full h-1.5">
        <div 
          className={`h-1.5 rounded-full transition-all duration-300 ${
            timeLeft <= 0
              ? 'bg-red-500'
              : isCritical 
              ? 'bg-red-500' 
              : isLowTime 
              ? 'bg-orange-500'
              : 'bg-slate-600'
          }`}
          style={{ 
            width: `${Math.max(0, (timeLeft / (duration * 60)) * 100)}%` 
          }}
        />
      </div>
      
      {isPaused && timeLeft > 0 && (
        <div className="text-center mt-2">
          <span className="text-[10px] text-slate-500 bg-slate-800/40 px-2 py-0.5 rounded">
            ⏸️ Paused
          </span>
        </div>
      )}
      
      {timeLeft <= 0 && (
        <div className="text-center mt-2">
          <span className="text-[10px] font-medium text-red-400 bg-red-950/30 px-2 py-0.5 rounded border border-red-500/20">
            ⏰ Complete
          </span>
        </div>
      )}
    </Card>
  )
}