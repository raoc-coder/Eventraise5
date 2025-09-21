'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Heart, 
  Share2, 
  DollarSign, 
  Users, 
  Calendar,
  Star,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

interface CampaignCardProps {
  id: string
  title: string
  description: string
  organization_name: string
  goal_amount: number
  current_amount: number
  end_date: string
  category: string
  is_featured?: boolean
  donor_count?: number
  image_url?: string
}

export default function CampaignCard({
  id,
  title,
  description,
  organization_name,
  goal_amount,
  current_amount,
  end_date,
  category,
  is_featured = false,
  donor_count = 0,
  image_url
}: CampaignCardProps) {
  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const progressPercentage = getProgressPercentage(current_amount, goal_amount)

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Support ${title} on EventraiseHub`,
        url: `/campaigns/${id}`
      })
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/campaigns/${id}`)
    }
  }

  return (
    <Card className="card-soft hover:card-elevated transition-all duration-300 group">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <CardTitle className="text-lg text-white group-hover:text-cyan-400 transition-colors">
                {title}
              </CardTitle>
              {is_featured && (
                <Star className="h-4 w-4 text-orange-400" />
              )}
            </div>
            <p className="text-sm text-gray-400">{organization_name}</p>
            <span className="inline-block px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full font-semibold mt-2">
              {category}
            </span>
          </div>
          <Button
            onClick={handleShare}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/20"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-gray-300 line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-cyan-400 font-semibold">Progress</span>
              <span className="text-cyan-400 font-semibold">{progressPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-orange-400 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-1">
              <span className="font-semibold">${current_amount.toLocaleString()}</span>
              <span>${goal_amount.toLocaleString()} goal</span>
            </div>
          </div>

          {/* Campaign Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center p-2 rounded-lg bg-gray-800/30">
              <Users className="h-4 w-4 text-orange-400 mr-2" />
              <div>
                <p className="text-xs text-gray-400">Donors</p>
                <p className="text-sm font-semibold text-white">{donor_count}</p>
              </div>
            </div>
            <div className="flex items-center p-2 rounded-lg bg-gray-800/30">
              <Calendar className="h-4 w-4 text-cyan-400 mr-2" />
              <div>
                <p className="text-xs text-gray-400">Ends</p>
                <p className="text-sm font-semibold text-white">{formatDate(end_date)}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Link href={`/campaigns/${id}`} className="flex-1">
              <Button className="w-full btn-primary">
                <Heart className="h-4 w-4 mr-2" />
                Support
              </Button>
            </Link>
            <Button variant="outline" className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/20">
              <TrendingUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
