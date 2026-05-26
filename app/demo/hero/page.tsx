import Image from 'next/image'
import { HeroDemo } from './hero-demo'

export default function HeroDemoPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1920&q=80"
          alt=""
          fill
          className="object-cover opacity-[0.07]"
          sizes="100vw"
          priority
        />
      </div>
      <HeroDemo />
    </div>
  )
}
