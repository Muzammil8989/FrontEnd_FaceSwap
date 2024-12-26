'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Typewriter } from 'react-simple-typewriter'
import { Button } from '@/components/ui/button'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'
import { celebrities, Celebrity } from '@/lib/data/celebrity'

export default function Home() {
  const router = useRouter()
 
  const comingSoon = Array(6).fill(null)

  return (
    <div className="min-h-screen lg:h-screen bg-background mx-auto flex flex-col">
      <main className="flex-1 container px-4 py-12 md:px-6 mx-auto flex flex-col justify-center space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-10"
        >
          <h1 className="text-4xl md:text-5xl font-black max-w-3xl mx-auto">
            Generate realistic selfies with famous personalities
          </h1>
          <p className="text-lg text-muted-foreground max-w-6xl mx-auto">
            <Typewriter
              words={[
                'Capture moments with actors, politicians, or historical figures in just a click.',
                'Experience the excitement of a personalized photo with your favorite stars!',
                'Generate realistic selfies with famous personalities using our AI tool.',
              ]}
              loop={true}
              cursor
              cursorStyle="|"
              typeSpeed={50}
              deleteSpeed={30}
              delaySpeed={2000}
            />
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => router.push('/celebrities')}
              className="bg-zinc-900 hover:bg-zinc-800 text-white px-7 py-6 rounded-lg text-lg"
            >
              Start Creating
            </Button>
          </motion.div>
        </motion.div>

        {/* Celebrities Carousel Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold">Celebrities</h2>
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full mx-auto"
          >
            <CarouselContent className="flex space-x-4">
              {celebrities.map((celebrity: Celebrity) => (
                <CarouselItem
                  key={celebrity.id}
                  className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card
                      className="cursor-pointer transition-transform"
                      onClick={() => router.push(`/celebrity/${celebrity.id}`)}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-4">
                        <img
                          src={celebrity.image}
                          alt={`Image of ${celebrity.name}`}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <h3 className="mt-4 text-lg font-medium">
                          {celebrity.name}
                        </h3>
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </motion.section>

        {/* Coming Soon Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 },
            },
          }}
        >
          <h2 className="mb-6 text-2xl font-semibold">Coming Soon</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {comingSoon.map((_, index) => (
              <motion.div
                key={`coming-soon-${index}`}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="aspect-square overflow-hidden rounded-lg border bg-muted"
              >
                <img
                  src="/placeholder.svg"
                  alt={`Coming Soon ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  )
}
