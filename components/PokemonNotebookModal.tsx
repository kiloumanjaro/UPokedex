'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';

import { imageUrl } from '../config/app.config.js';
import { STAT_COLORS, STAT_LABELS } from '../constants/statMeta.js';
import { TYPE_BG } from '../constants/typeColors.js';
import { FALLBACK_IMAGE } from '../utils/fallbackImage.js';
import { formatId } from '../utils/formatId.js';
import { capitalize } from '../utils/capitalize.js';
import {
  coverLeftVariants,
  coverRightVariants,
  rightPageFlipVariants,
  leftPageFlipVariants,
  chevronVariants,
  overlayVariants,
  BOOK_OPEN_DURATION,
  BOOK_CLOSE_DURATION,
} from './memory-modal-animations';

type PokemonTypeSlot = {
  type: { name: string };
};

type PokemonStat = {
  base_stat: number;
  stat: { name: string };
};

type PokemonAbility = {
  is_hidden: boolean;
  ability: { name: string };
};

type PokemonMove = {
  move: { name: string };
};

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience?: number | null;
  types: PokemonTypeSlot[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  moves: PokemonMove[];
}

export interface PokemonSpecies {
  genera?: Array<{ genus: string; language: { name: string } }>;
  flavor_text_entries?: Array<{ flavor_text: string; language: { name: string } }>;
  generation?: { name: string } | null;
  habitat?: { name: string } | null;
  shape?: { name: string } | null;
}

interface PokemonNotebookModalProps {
  pokemon: PokemonDetail | null;
  species?: PokemonSpecies | null;
  weaknesses?: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  totalCount?: number;
}

type AnimationPhase = 'closed' | 'opening' | 'open' | 'closing';
type FlipDirection = 'next' | 'prev' | null;

const PAGE_BASE_STYLES =
  'flex h-full flex-col gap-4 rounded-xl bg-[#f8f0db] p-5 shadow-[1px_2px_3px_0px_rgba(0,0,0,0.25)]';

const PAGE_FACE_STYLES =
  'absolute left-0 top-0 flex h-full w-full flex-col gap-4 overflow-hidden rounded-xl bg-[#f8f0db] p-5';

function cleanText(value = '') {
  return value.replace(/[\f\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function getEnglishGenus(species?: PokemonSpecies | null) {
  const genus = species?.genera?.find(entry => entry.language.name === 'en');
  return genus?.genus ?? 'Pokemon';
}

function getEnglishFlavor(species?: PokemonSpecies | null) {
  const entry = species?.flavor_text_entries?.find(
    item => item.language.name === 'en'
  );

  return entry
    ? cleanText(entry.flavor_text)
    : 'A page is waiting to be filled with more field notes.';
}

function getGenerationLabel(species?: PokemonSpecies | null) {
  const raw = species?.generation?.name;
  if (!raw) return 'Unknown';
  return `Gen ${raw.replace('generation-', '').toUpperCase()}`;
}

function getHabitatLabel(species?: PokemonSpecies | null) {
  return species?.habitat ? capitalize(species.habitat.name) : 'Unknown';
}

function getShapeLabel(species?: PokemonSpecies | null) {
  return species?.shape ? capitalize(species.shape.name) : 'Unknown';
}

function getStatTotal(stats: PokemonStat[] = []) {
  return stats.reduce((total, stat) => total + stat.base_stat, 0);
}

function formatHeight(height?: number) {
  if (typeof height !== 'number') return 'Unknown';
  return `${(height / 10).toFixed(1)} m`;
}

function formatWeight(weight?: number) {
  if (typeof weight !== 'number') return 'Unknown';
  return `${(weight / 10).toFixed(1)} kg`;
}

function PokemonArt({
  id,
  name,
  size = 220,
}: {
  id: number;
  name: string;
  size?: number;
}) {
  const [src, setSrc] = useState(imageUrl(id));

  useEffect(() => {
    setSrc(imageUrl(id));
  }, [id]);

  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      unoptimized
      className="object-contain drop-shadow-[0_18px_20px_rgba(15,23,42,0.24)]"
      onError={() => setSrc(FALLBACK_IMAGE)}
    />
  );
}

function LeftPageSpineRings({
  shouldScale = false,
  delay = 0,
}: {
  shouldScale?: boolean;
  delay?: number;
}) {
  return (
    <div
      className="pointer-events-none absolute -right-1 top-0 flex h-full flex-col items-end justify-around py-4"
      style={{ transformStyle: 'flat' }}
    >
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="relative flex h-4 w-8 items-center"
          animate={{ scale: shouldScale && i !== 0 ? [1, 1.08, 1] : 1 }}
          transition={{
            duration: 0.5,
            times: [0, 0.3, 1],
            ease: 'easeOut',
            delay,
          }}
          style={{ transformOrigin: 'center center' }}
        >
          <div className="absolute right-3 h-3.5 w-3.5 rounded-full bg-black" />
          <div className="absolute right-0 z-10 h-1.5 w-5 rounded-l bg-zinc-400" />
        </motion.div>
      ))}
    </div>
  );
}

function RightPageSpineRings({
  shouldScale = false,
  delay = 0,
}: {
  shouldScale?: boolean;
  delay?: number;
}) {
  return (
    <div
      className="pointer-events-none absolute -left-1 top-0 flex h-full flex-col items-start justify-around py-4"
      style={{ transformStyle: 'flat' }}
    >
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="relative flex h-4 w-8 items-center"
          animate={{ scale: shouldScale && i !== 0 ? [1, 1.08, 1] : 1 }}
          transition={{
            duration: 0.5,
            times: [0, 0.3, 1],
            ease: 'easeOut',
            delay,
          }}
          style={{ transformOrigin: 'center center' }}
        >
          <div className="absolute left-3 h-3.5 w-3.5 rounded-full bg-black" />
          <div className="absolute left-0 z-10 h-1.5 w-5 rounded-r bg-zinc-400" />
        </motion.div>
      ))}
    </div>
  );
}

function TypePills({ types }: { types: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {types.map(type => (
        <span
          key={type}
          className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white shadow-sm"
          style={{ background: TYPE_BG[type] ?? '#64748b' }}
        >
          {capitalize(type)}
        </span>
      ))}
    </div>
  );
}

function LeftPage({
  pokemon,
  species,
  totalCount,
  showRings,
}: {
  pokemon: PokemonDetail;
  species?: PokemonSpecies | null;
  totalCount?: number;
  showRings?: boolean;
}) {
  const types = pokemon.types.map(entry => entry.type.name);
  const mainColor = TYPE_BG[types[0]] ?? '#8b5e34';
  const flavor = getEnglishFlavor(species);
  const genus = getEnglishGenus(species);
  const statTotal = getStatTotal(pokemon.stats);
  const progress = totalCount
    ? Math.max(1, Math.round((pokemon.id / totalCount) * 100))
    : 0;

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-book text-[34px] font-semibold tracking-[0.08em] text-amber-900/90">
            Field Journal
          </p>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.32em] text-slate-500">
            Pokemon Archive
          </p>
        </div>
        <div className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-600 shadow-sm">
          {formatId(pokemon.id)}
        </div>
      </div>

      <div className="rounded-[22px] border border-amber-900/10 bg-white/70 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
        <div className="flex h-[260px] gap-4">
          <div
            className="relative flex w-[280px] shrink-0 items-center justify-center overflow-hidden rounded-[28px] border border-white/70 shadow-inner"
            style={{
              background: `radial-gradient(circle at top, ${mainColor}33, transparent 55%), linear-gradient(135deg, rgba(255,255,255,0.94), rgba(241,245,249,0.88))`,
            }}
          >
            <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle,rgba(255,255,255,0.9)_0.8px,transparent_0.8px)] [background-size:18px_18px]" />
            <div className="relative z-10">
              <PokemonArt id={pokemon.id} name={pokemon.name} size={220} />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-end gap-3">
                <h2 className="font-book text-[52px] leading-none text-slate-900">
                  {capitalize(pokemon.name)}
                </h2>
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white shadow-sm"
                  style={{ background: mainColor }}
                >
                  {capitalize(types[0] ?? 'Unknown')}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-600">{genus}</p>
              <div className="mt-3">
                <TypePills types={types} />
              </div>
            </div>

            <div className="rounded-[22px] border border-amber-900/10 bg-[#fff8eb] px-4 py-3 text-sm leading-6 text-slate-600">
              {flavor}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          ['Height', formatHeight(pokemon.height)],
          ['Weight', formatWeight(pokemon.weight)],
          ['Stat Total', String(statTotal)],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-[18px] border border-white/70 bg-white/75 p-4 shadow-[0_10px_20px_rgba(15,23,42,0.06)]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
              {label}
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
            <div
              className="mt-3 h-1.5 w-14 rounded-full"
              style={{ background: mainColor }}
            />
          </div>
        ))}
      </div>

      <div className="mt-auto rounded-[22px] border border-amber-900/10 bg-[#fff7e3] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
              Notebook Progress
            </p>
            <p className="mt-1 font-book text-[28px] text-slate-900">
              {totalCount ? `Page ${pokemon.id} of ${totalCount}` : `Entry ${formatId(pokemon.id)}`}
            </p>
          </div>
          {totalCount ? (
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Coverage
              </p>
              <p className="text-[28px] font-black text-slate-900">{progress}%</p>
            </div>
          ) : null}
        </div>
        {totalCount ? (
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full"
              style={{ width: `${progress}%`, background: mainColor }}
            />
          </div>
        ) : null}
      </div>

      <LeftPageSpineRings shouldScale={showRings} />
    </>
  );
}

function RightPage({
  pokemon,
  species,
  weaknesses,
  showRings,
}: {
  pokemon: PokemonDetail;
  species?: PokemonSpecies | null;
  weaknesses: string[];
  showRings?: boolean;
}) {
  const statTotal = getStatTotal(pokemon.stats);
  const generation = getGenerationLabel(species);
  const shape = getShapeLabel(species);
  const habitat = getHabitatLabel(species);
  const moves = pokemon.moves.slice(0, 4);

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500">
            Battle Ledger
          </p>
          <h3 className="mt-1 font-book text-[40px] text-slate-900">
            Combat Notes
          </h3>
        </div>
        <div className="rounded-[20px] border border-white/70 bg-white/80 px-4 py-3 text-right shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Stat Total
          </p>
          <p className="text-[34px] font-black leading-none text-slate-900">
            {statTotal}
          </p>
        </div>
      </div>

      <div className="rounded-[22px] border border-amber-900/10 bg-white/80 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
            Base Stats
          </p>
          <p className="text-xs font-medium text-slate-500">
            Scaled against the 255 max benchmark
          </p>
        </div>
        <div className="mt-3 space-y-2.5">
          {pokemon.stats.map(stat => {
            const pct = Math.min(100, Math.round((stat.base_stat / 255) * 100));
            const label = STAT_LABELS[stat.stat.name] ?? capitalize(stat.stat.name);
            const color = STAT_COLORS[stat.stat.name] ?? '#64748b';

            return (
              <div
                key={stat.stat.name}
                className="grid grid-cols-[84px_34px_minmax(0,1fr)] items-center gap-2"
              >
                <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {label}
                </div>
                <div className="text-sm font-black text-slate-900">{stat.base_stat}</div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[22px] border border-amber-900/10 bg-[#fff7e7] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
            Abilities
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {pokemon.abilities.slice(0, 4).map(entry => (
              <span
                key={entry.ability.name}
                className="inline-flex items-center rounded-full border border-amber-900/10 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
              >
                {capitalize(entry.ability.name)}
                {entry.is_hidden ? ' (Hidden)' : ''}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[22px] border border-amber-900/10 bg-[#fff7e7] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
            Weaknesses
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {weaknesses.length ? (
              weaknesses.map(type => (
                <span
                  key={type}
                  className="inline-flex items-center rounded-full px-3 py-2 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-sm"
                  style={{ background: TYPE_BG[type] ?? '#64748b' }}
                >
                  {capitalize(type)}
                </span>
              ))
            ) : (
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                No major weakness data
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          ['Generation', generation],
          ['Shape', shape],
          ['Habitat', habitat],
          ['Base EXP', String(pokemon.base_experience ?? 'Unknown')],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-[22px] border border-amber-900/10 bg-white/80 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
              {label}
            </p>
            <p className="mt-2 text-base font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[22px] border border-amber-900/10 bg-white/80 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
          Moves To Remember
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {moves.map(move => (
            <div
              key={move.move.name}
              className="rounded-2xl border border-white/70 bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 shadow-sm"
            >
              {capitalize(move.move.name)}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto rounded-[24px] border border-amber-900/10 bg-[#f5e8c8]/95 px-4 py-4 text-center shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
          Endless Notebook
        </p>
        <p className="mt-1 text-xs text-slate-600">
          Turn the side pages to move through the dex and keep the hardcover effect intact.
        </p>
      </div>

      <RightPageSpineRings shouldScale={showRings} />
    </>
  );
}

export function PokemonNotebookModal({
  pokemon,
  species = null,
  weaknesses = [],
  open,
  onOpenChange,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  totalCount = 0,
}: PokemonNotebookModalProps) {
  const [animationPhase, setAnimationPhase] =
    useState<AnimationPhase>('closed');
  const [isRightPageFlipped, setIsRightPageFlipped] = useState(false);
  const [isLeftPageFlipped, setIsLeftPageFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [cachedPokemon, setCachedPokemon] = useState<PokemonDetail | null>(null);
  const [cachedSpecies, setCachedSpecies] = useState<PokemonSpecies | null>(null);
  const [cachedWeaknesses, setCachedWeaknesses] = useState<string[]>([]);
  const [flipDirection, setFlipDirection] = useState<FlipDirection>(null);

  useEffect(() => {
    if (open) {
      setAnimationPhase('opening');
      const timer = window.setTimeout(() => {
        setAnimationPhase('open');
      }, BOOK_OPEN_DURATION * 1000);
      return () => window.clearTimeout(timer);
    }

    setAnimationPhase('closing');
    const timer = window.setTimeout(() => {
      setAnimationPhase('closed');
    }, BOOK_CLOSE_DURATION * 1000);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setIsRightPageFlipped(false);
      setIsLeftPageFlipped(false);
      setIsFlipping(false);
      setCachedPokemon(null);
      setCachedSpecies(null);
      setCachedWeaknesses([]);
      setFlipDirection(null);
    }
  }, [open]);

  const currentData = useMemo(() => {
    if (!pokemon) return null;
    return {
      pokemon,
      species,
      weaknesses,
    };
  }, [pokemon, species, weaknesses]);

  const cachedData = useMemo(() => {
    if (!cachedPokemon) return null;
    return {
      pokemon: cachedPokemon,
      species: cachedSpecies,
      weaknesses: cachedWeaknesses,
    };
  }, [cachedPokemon, cachedSpecies, cachedWeaknesses]);

  const handleNext = () => {
    if (!pokemon || !hasNext || isFlipping || !onNext) return;

    setCachedPokemon(pokemon);
    setCachedSpecies(species);
    setCachedWeaknesses(weaknesses);
    setFlipDirection('next');
    setIsFlipping(true);
    onNext();
    setIsRightPageFlipped(true);

    window.setTimeout(() => {
      setCachedPokemon(null);
      setCachedSpecies(null);
      setCachedWeaknesses([]);
      setFlipDirection(null);
      setIsRightPageFlipped(false);
      setIsFlipping(false);
    }, 610);
  };

  const handlePrevious = () => {
    if (!pokemon || !hasPrevious || isFlipping || !onPrevious) return;

    setCachedPokemon(pokemon);
    setCachedSpecies(species);
    setCachedWeaknesses(weaknesses);
    setFlipDirection('prev');
    setIsFlipping(true);
    onPrevious();
    setIsLeftPageFlipped(true);

    window.setTimeout(() => {
      setCachedPokemon(null);
      setCachedSpecies(null);
      setCachedWeaknesses([]);
      setFlipDirection(null);
      setIsLeftPageFlipped(false);
      setIsFlipping(false);
    }, 610);
  };

  if (!currentData) return null;

  const showCovers = animationPhase !== 'open';
  const baseLeft =
    isFlipping && flipDirection === 'next' && cachedData ? cachedData : currentData;
  const baseRight =
    isFlipping && flipDirection === 'prev' && cachedData ? cachedData : currentData;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <motion.div
              className="fixed inset-0 z-50 bg-[#2d2d2d]/50"
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={() => onOpenChange(false)}
            />

            <DialogPrimitive.Content asChild forceMount>
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <DialogPrimitive.Title className="sr-only">
                  {capitalize(currentData.pokemon.name)}
                </DialogPrimitive.Title>

                <div
                  className="flex items-center gap-6"
                  style={{ perspective: '2000px' }}
                >
                  <motion.button
                    onClick={handlePrevious}
                    disabled={!hasPrevious || isFlipping}
                    className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-card text-foreground shadow-[3px_3px_0px_0px_#2d2d2d] transition-colors hover:shadow-[4px_4px_0px_0px_#2d2d2d] disabled:cursor-not-allowed disabled:opacity-30"
                    variants={chevronVariants}
                    initial="idle"
                    whileHover={hasPrevious ? 'hover' : 'disabled'}
                    whileTap={hasPrevious ? 'tap' : 'disabled'}
                    aria-label="Previous Pokemon"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </motion.button>

                  <div
                    className="relative"
                    style={{
                      width: '968px',
                      height: '650px',
                      overflow: 'visible',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onOpenChange(false)}
                      className="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-card text-foreground shadow-[3px_3px_0px_0px_#2d2d2d] transition-colors hover:shadow-[4px_4px_0px_0px_#2d2d2d]"
                      aria-label="Close Pokemon details"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    <div
                      className="absolute inset-0 rounded-2xl bg-amber-200 p-2 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)]"
                      style={{
                        overflow: 'visible',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <div
                        className="relative flex h-full gap-2"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <div className={`${PAGE_BASE_STYLES} relative`} style={{ width: '472px', zIndex: 1 }}>
                          <LeftPage
                            pokemon={baseLeft.pokemon}
                            species={baseLeft.species}
                            totalCount={totalCount}
                            showRings={isFlipping && flipDirection === 'next'}
                          />
                        </div>

                        <div className={`${PAGE_BASE_STYLES} relative`} style={{ width: '472px', zIndex: 1 }}>
                          <RightPage
                            pokemon={baseRight.pokemon}
                            species={baseRight.species}
                            weaknesses={baseRight.weaknesses}
                            showRings={isFlipping && flipDirection === 'prev'}
                          />
                        </div>
                        {cachedData && flipDirection === 'prev' && (
                          <motion.div
                            className="absolute top-0"
                            style={{
                              left: '8px',
                              width: '472px',
                              height: '100%',
                              transformStyle: 'preserve-3d',
                              transformOrigin: '472px 50%',
                              willChange: 'transform',
                              zIndex: 20,
                            }}
                            variants={leftPageFlipVariants}
                            initial="flat"
                            animate={isLeftPageFlipped ? 'flipped' : 'flat'}
                          >
                            <div
                              className={PAGE_FACE_STYLES}
                              style={{ backfaceVisibility: 'hidden' }}
                            >
                              <LeftPage
                                pokemon={cachedData.pokemon}
                                species={cachedData.species}
                                totalCount={totalCount}
                              />
                            </div>
                            <div
                              className={PAGE_FACE_STYLES}
                              style={{
                                transform: 'rotateY(180deg)',
                                backfaceVisibility: 'hidden',
                              }}
                            >
                              <RightPage
                                pokemon={currentData.pokemon}
                                species={currentData.species}
                                weaknesses={currentData.weaknesses}
                              />
                            </div>
                          </motion.div>
                        )}

                        {cachedData && flipDirection === 'next' && (
                          <motion.div
                            className="absolute top-0"
                            style={{
                              right: '8px',
                              width: '472px',
                              height: '100%',
                              transformStyle: 'preserve-3d',
                              transformOrigin: '0px 50%',
                              willChange: 'transform',
                              zIndex: 20,
                            }}
                            variants={rightPageFlipVariants}
                            initial="flat"
                            animate={isRightPageFlipped ? 'flipped' : 'flat'}
                          >
                            <div
                              className={PAGE_FACE_STYLES}
                              style={{ backfaceVisibility: 'hidden' }}
                            >
                              <RightPage
                                pokemon={cachedData.pokemon}
                                species={cachedData.species}
                                weaknesses={cachedData.weaknesses}
                              />
                            </div>
                            <div
                              className={PAGE_FACE_STYLES}
                              style={{
                                transform: 'rotateY(180deg)',
                                backfaceVisibility: 'hidden',
                              }}
                            >
                              <LeftPage
                                pokemon={currentData.pokemon}
                                species={currentData.species}
                                totalCount={totalCount}
                              />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {showCovers && (
                      <>
                        <motion.div
                          className="absolute left-0 top-0 h-full w-1/2 rounded-l-2xl bg-amber-300 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.3)]"
                          style={{
                            transformOrigin: 'right center',
                            transformStyle: 'preserve-3d',
                          }}
                          variants={coverLeftVariants}
                          initial="closed"
                          animate={animationPhase}
                        >
                          <div
                            className="relative flex h-full items-center justify-center rounded-l-2xl bg-amber-300"
                            style={{ backfaceVisibility: 'hidden' }}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="h-24 w-1 rounded-full bg-amber-400" />
                              <p className="font-book text-sm tracking-[0.22em] text-amber-900">
                                Pokedex
                              </p>
                            </div>
                            <div className="pointer-events-none absolute right-0 top-0 flex h-full flex-col items-end justify-around py-4">
                              {[0, 1, 2].map(i => (
                                <div
                                  key={i}
                                  className="relative flex h-4 w-7 items-center"
                                >
                                  <div className="absolute right-0 h-3.5 w-[7px] rounded-r-full bg-amber-500" />
                                  <div className="absolute right-0.5 h-1.5 w-5 rounded-l bg-amber-200" />
                                </div>
                              ))}
                            </div>
                          </div>
                          <div
                            className="absolute inset-0 rounded-r-2xl bg-amber-100"
                            style={{
                              transform: 'rotateY(180deg)',
                              backfaceVisibility: 'hidden',
                            }}
                          />
                        </motion.div>

                        <motion.div
                          className="absolute right-0 top-0 h-full w-1/2 rounded-r-2xl bg-amber-300 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.3)]"
                          style={{
                            transformOrigin: 'left center',
                            transformStyle: 'preserve-3d',
                          }}
                          variants={coverRightVariants}
                          initial="closed"
                          animate={animationPhase}
                        >
                          <div
                            className="relative flex h-full items-center justify-center rounded-r-2xl bg-amber-300"
                            style={{ backfaceVisibility: 'hidden' }}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="h-24 w-1 rounded-full bg-amber-400" />
                              <p className="font-book text-sm tracking-[0.22em] text-amber-900">
                                Archive
                              </p>
                            </div>
                            <div className="pointer-events-none absolute left-0 top-0 flex h-full flex-col items-start justify-around py-4">
                              {[0, 1, 2].map(i => (
                                <div
                                  key={i}
                                  className="relative flex h-4 w-7 items-center"
                                >
                                  <div className="absolute left-0 h-3.5 w-[7px] rounded-l-full bg-amber-500" />
                                  <div className="absolute left-0.5 h-1.5 w-5 rounded-r bg-amber-200" />
                                </div>
                              ))}
                            </div>
                          </div>
                          <div
                            className="absolute inset-0 rounded-l-2xl bg-amber-100"
                            style={{
                              transform: 'rotateY(180deg)',
                              backfaceVisibility: 'hidden',
                            }}
                          />
                        </motion.div>
                      </>
                    )}
                  </div>

                  <motion.button
                    onClick={handleNext}
                    disabled={!hasNext || isFlipping}
                    className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-card text-foreground shadow-[3px_3px_0px_0px_#2d2d2d] transition-colors hover:shadow-[4px_4px_0px_0px_#2d2d2d] disabled:cursor-not-allowed disabled:opacity-30"
                    variants={chevronVariants}
                    initial="idle"
                    whileHover={hasNext ? 'hover' : 'disabled'}
                    whileTap={hasNext ? 'tap' : 'disabled'}
                    aria-label="Next Pokemon"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </motion.button>
                </div>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

export default PokemonNotebookModal;
