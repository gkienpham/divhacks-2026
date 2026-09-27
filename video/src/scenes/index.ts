import type React from 'react';
import type {SceneId} from '../script';
import {S01Hook} from './S01Hook';
import {S02Problem} from './S02Problem';
import {S03Reveal} from './S03Reveal';
import {S04QuizVoice} from './S04QuizVoice';
import {S05Contradiction} from './S05Contradiction';
import {S06Score} from './S06Score';
import {S07Shortlist} from './S07Shortlist';
import {S08Listings} from './S08Listings';
import {S09Agreement} from './S09Agreement';
import {S10End} from './S10End';

export const SCENES: Record<SceneId, React.FC> = {
  S01: S01Hook,
  S02: S02Problem,
  S03: S03Reveal,
  S04: S04QuizVoice,
  S05: S05Contradiction,
  S06: S06Score,
  S07: S07Shortlist,
  S08: S08Listings,
  S09: S09Agreement,
  S10: S10End,
};
