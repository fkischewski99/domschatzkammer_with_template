'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';

import { APP_NAME } from '@workspace/common/app';
import { cn } from '@workspace/ui/lib/utils';

import { GridSection } from '~/components/fragments/grid-section';
import { Marquee } from '~/components/fragments/marquee';

const TESTIMONIAL_KEYS = [
  'davidZhang',
  'mariaRodriguez',
  'jamesWilson',
  'sarahKim',
  'marcusJohnson',
  'priyaSharma',
  'miguelSantos',
  'lisaThompson',
  'danielPark',
  'emmaAnderson',
  'robertChen',
  'mayaPatel',
  'thomasOBrien'
] as const;

const TESTIMONIAL_IMAGES: Record<typeof TESTIMONIAL_KEYS[number], string> = {
  davidZhang: 'https://randomuser.me/api/portraits/men/91.jpg',
  mariaRodriguez: 'https://randomuser.me/api/portraits/women/12.jpg',
  jamesWilson: 'https://randomuser.me/api/portraits/men/45.jpg',
  sarahKim: 'https://randomuser.me/api/portraits/women/83.jpg',
  marcusJohnson: 'https://randomuser.me/api/portraits/men/1.jpg',
  priyaSharma: 'https://randomuser.me/api/portraits/women/5.jpg',
  miguelSantos: 'https://randomuser.me/api/portraits/men/14.jpg',
  lisaThompson: 'https://randomuser.me/api/portraits/women/56.jpg',
  danielPark: 'https://randomuser.me/api/portraits/men/18.jpg',
  emmaAnderson: 'https://randomuser.me/api/portraits/women/73.jpg',
  robertChen: 'https://randomuser.me/api/portraits/men/25.jpg',
  mayaPatel: 'https://randomuser.me/api/portraits/women/78.jpg',
  thomasOBrien: 'https://randomuser.me/api/portraits/men/54.jpg'
};


export function Testimonials(): React.JSX.Element {
  const t = useTranslations('testimonials');

  const DATA = TESTIMONIAL_KEYS.map((key) => ({
    name: t(`items.${key}.name`),
    role: t(`items.${key}.role`),
    img: TESTIMONIAL_IMAGES[key],
    description: (
      <p>
        {APP_NAME} {t(`items.${key}.text`)}{' '}
        <strong>{t(`items.${key}.highlight`)}</strong>{' '}
        {t(`items.${key}.conclusion`)}
      </p>
    )
  }));

  return (
    <GridSection hideVerticalGridLines>
      <div className="container border-x py-20 md:border-none">
        <h2 className="mb-8 text-center text-3xl font-semibold md:text-5xl lg:text-left">
          {t('title')}
        </h2>
        <div className="relative mt-6 max-h-[640px] overflow-hidden">
          <div className="gap-4 md:columns-2 xl:columns-3 2xl:columns-4">
            {Array(Math.ceil(DATA.length / 3))
              .fill(0)
              .map((_, i) => (
                <Marquee
                  vertical
                  key={i}
                  className={cn({
                    '[--duration:60s]': i === 1,
                    '[--duration:30s]': i === 2,
                    '[--duration:70s]': i === 3
                  })}
                >
                  {DATA.slice(i * 3, (i + 1) * 3).map((testimonial, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: Math.random() * 0.4,
                        duration: 1
                      }}
                      className="mb-4 flex w-full break-inside-avoid flex-col items-center justify-between gap-6 rounded-xl border bg-background p-4 dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]"
                    >
                      <div className="select-none text-sm font-normal text-muted-foreground">
                        {testimonial.description}
                        <div className="flex flex-row py-1">
                          <Star className="size-4 fill-yellow-500 text-yellow-500" />
                          <Star className="size-4 fill-yellow-500 text-yellow-500" />
                          <Star className="size-4 fill-yellow-500 text-yellow-500" />
                          <Star className="size-4 fill-yellow-500 text-yellow-500" />
                          <Star className="size-4 fill-yellow-500 text-yellow-500" />
                        </div>
                      </div>
                      <div className="flex w-full select-none items-center justify-start gap-5">
                        <Image
                          width={40}
                          height={40}
                          src={testimonial.img || ''}
                          alt={testimonial.name}
                          className="size-8 rounded-full ring-1 ring-border ring-offset-4"
                        />
                        <div>
                          <p className="text-sm font-medium">
                            {testimonial.name}
                          </p>
                          <p className="text-xs font-normal text-muted-foreground">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </Marquee>
              ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 w-full bg-linear-to-t from-background from-20%" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 w-full bg-linear-to-b from-background from-20%" />
        </div>
      </div>
    </GridSection>
  );
}
