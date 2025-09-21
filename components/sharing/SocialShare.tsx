'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Mail, 
  MessageCircle,
  Link as LinkIcon,
  Copy,
  Check
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SocialShareProps {
  url: string
  title: string
  description?: string
  hashtags?: string[]
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'minimal' | 'expanded'
}

export default function SocialShare({
  url,
  title,
  description = '',
  hashtags = [],
  size = 'md',
  variant = 'default'
}: SocialShareProps) {
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  const shareData = {
    url,
    title,
    text: description,
    hashtags: hashtags.join(',')
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed')
      }
    } else {
      // Fallback to copy link
      handleCopyLink()
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
  }

  const handleTwitterShare = () => {
    const twitterText = `${title}${hashtags.length > 0 ? ` ${hashtags.map(tag => `#${tag}`).join(' ')}` : ''}`
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(twitterText)}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
  }

  const handleEmailShare = () => {
    const subject = `Check out: ${title}`
    const body = `${description}\n\n${url}`
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = emailUrl
  }

  const handleSMSShare = () => {
    const smsText = `${title}${description ? ` - ${description}` : ''}\n${url}`
    const smsUrl = `sms:?body=${encodeURIComponent(smsText)}`
    window.location.href = smsUrl
  }

  if (variant === 'minimal') {
    return (
      <Button
        onClick={handleNativeShare}
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/20"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    )
  }

  if (variant === 'expanded') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Share this campaign</h3>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-cyan-400"
          >
            {isExpanded ? 'Less' : 'More'}
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleNativeShare}
            variant="outline"
            size="sm"
            className="text-cyan-400 hover:bg-cyan-500/20"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            size="sm"
            className="text-gray-400 hover:bg-gray-500/20"
          >
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>

        {isExpanded && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleFacebookShare}
              variant="outline"
              size="sm"
              className="text-blue-400 hover:bg-blue-500/20"
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            <Button
              onClick={handleTwitterShare}
              variant="outline"
              size="sm"
              className="text-blue-400 hover:bg-blue-500/20"
            >
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            <Button
              onClick={handleEmailShare}
              variant="outline"
              size="sm"
              className="text-gray-400 hover:bg-gray-500/20"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button
              onClick={handleSMSShare}
              variant="outline"
              size="sm"
              className="text-gray-400 hover:bg-gray-500/20"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              SMS
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={handleNativeShare}
        variant="outline"
        size="sm"
        className="text-cyan-400 hover:bg-cyan-500/20"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
      
      <div className="flex space-x-1">
        <Button
          onClick={handleFacebookShare}
          variant="ghost"
          size="sm"
          className={`${sizeClasses[size]} text-blue-400 hover:bg-blue-500/20`}
        >
          <Facebook className={iconSizes[size]} />
        </Button>
        <Button
          onClick={handleTwitterShare}
          variant="ghost"
          size="sm"
          className={`${sizeClasses[size]} text-blue-400 hover:bg-blue-500/20`}
        >
          <Twitter className={iconSizes[size]} />
        </Button>
        <Button
          onClick={handleEmailShare}
          variant="ghost"
          size="sm"
          className={`${sizeClasses[size]} text-gray-400 hover:bg-gray-500/20`}
        >
          <Mail className={iconSizes[size]} />
        </Button>
        <Button
          onClick={handleSMSShare}
          variant="ghost"
          size="sm"
          className={`${sizeClasses[size]} text-gray-400 hover:bg-gray-500/20`}
        >
          <MessageCircle className={iconSizes[size]} />
        </Button>
        <Button
          onClick={handleCopyLink}
          variant="ghost"
          size="sm"
          className={`${sizeClasses[size]} text-gray-400 hover:bg-gray-500/20`}
        >
          {copied ? <Check className={iconSizes[size]} /> : <LinkIcon className={iconSizes[size]} />}
        </Button>
      </div>
    </div>
  )
}
