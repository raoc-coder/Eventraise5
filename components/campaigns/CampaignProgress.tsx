'use client'

import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target,
  Heart
} from 'lucide-react'

interface CampaignProgressProps {
  currentAmount: number
  goalAmount: number
  donorCount: number
  daysRemaining?: number
  showThermometer?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function CampaignProgress({
  currentAmount,
  goalAmount,
  donorCount,
  daysRemaining,
  showThermometer = true,
  size = 'md'
}: CampaignProgressProps) {
  const progressPercentage = Math.min((currentAmount / goalAmount) * 100, 100)
  const amountRemaining = Math.max(goalAmount - currentAmount, 0)
  
  const sizeClasses = {
    sm: {
      container: 'p-3',
      title: 'text-sm',
      amount: 'text-lg',
      progress: 'h-2',
      icon: 'h-3 w-3'
    },
    md: {
      container: 'p-4',
      title: 'text-base',
      amount: 'text-xl',
      progress: 'h-3',
      icon: 'h-4 w-4'
    },
    lg: {
      container: 'p-6',
      title: 'text-lg',
      amount: 'text-2xl',
      progress: 'h-4',
      icon: 'h-5 w-5'
    }
  }

  const classes = sizeClasses[size]

  return (
    <div className={`bg-gray-800/50 rounded-lg ${classes.container}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Heart className={`${classes.icon} text-cyan-400`} />
          <h3 className={`${classes.title} font-semibold text-white`}>Campaign Progress</h3>
        </div>
        <div className="text-right">
          <div className={`${classes.amount} font-bold text-cyan-400`}>
            {progressPercentage.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-400">Complete</div>
        </div>
      </div>

      {/* Thermometer Progress Bar */}
      {showThermometer && (
        <div className="mb-4">
          <div className="relative">
            <div className="w-full bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-orange-400 h-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            {/* Thermometer bulb effect */}
            <div className="absolute -bottom-1 left-0 w-3 h-3 bg-gradient-to-r from-cyan-400 to-orange-400 rounded-full transform -translate-x-1"></div>
          </div>
        </div>
      )}

      {/* Amount Display */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <DollarSign className={`${classes.icon} text-green-400 mr-1`} />
            <span className="text-xs text-gray-400">Raised</span>
          </div>
          <div className={`${classes.amount} font-bold text-green-400`}>
            ${currentAmount.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Target className={`${classes.icon} text-orange-400 mr-1`} />
            <span className="text-xs text-gray-400">Goal</span>
          </div>
          <div className={`${classes.amount} font-bold text-orange-400`}>
            ${goalAmount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-center p-2 bg-gray-700/30 rounded-lg">
          <Users className={`${classes.icon} text-cyan-400 mr-2`} />
          <div>
            <div className="text-xs text-gray-400">Donors</div>
            <div className="text-sm font-semibold text-white">{donorCount}</div>
          </div>
        </div>
        <div className="flex items-center justify-center p-2 bg-gray-700/30 rounded-lg">
          <TrendingUp className={`${classes.icon} text-orange-400 mr-2`} />
          <div>
            <div className="text-xs text-gray-400">Avg Donation</div>
            <div className="text-sm font-semibold text-white">
              ${donorCount > 0 ? (currentAmount / donorCount).toFixed(0) : '0'}
            </div>
          </div>
        </div>
      </div>

      {/* Days Remaining */}
      {daysRemaining !== undefined && (
        <div className="mt-4 text-center">
          <div className="text-xs text-gray-400 mb-1">Days Remaining</div>
          <div className="text-lg font-bold text-white">
            {daysRemaining > 0 ? daysRemaining : 'Ended'}
          </div>
        </div>
      )}

      {/* Amount Remaining */}
      {amountRemaining > 0 && (
        <div className="mt-4 text-center">
          <div className="text-xs text-gray-400 mb-1">Amount Needed</div>
          <div className="text-lg font-bold text-cyan-400">
            ${amountRemaining.toLocaleString()}
          </div>
        </div>
      )}

      {/* Completion Message */}
      {progressPercentage >= 100 && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-green-500/20 text-green-400 text-sm font-semibold rounded-full">
            <Target className="h-3 w-3 mr-1" />
            Goal Achieved!
          </div>
        </div>
      )}
    </div>
  )
}
