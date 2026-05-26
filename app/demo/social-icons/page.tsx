import Image from 'next/image'
import {
  SocialIcons,
  creatorSocialLinks,
} from '@/components/ui/social-icons'

export default function SocialIconsDemoPage() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-neutral-900">
      <div className="absolute inset-0 -z-10 opacity-25">
        <Image
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1920&q=80"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>

      <div className="flex flex-col items-center gap-12 px-4">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Connect with EventraiseHub
          </h1>
          <p className="text-sm text-neutral-400">
            Hover or focus the icons below
          </p>
        </div>

        <SocialIcons />

        <div className="space-y-2 text-center">
          <p className="text-xs text-neutral-500">Creator icon set</p>
          <SocialIcons items={creatorSocialLinks} />
        </div>
      </div>
    </main>
  )
}
