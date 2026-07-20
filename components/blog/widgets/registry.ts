import type { ComponentType } from 'react';
import PrisonersDilemma from './PrisonersDilemma';
import NashEquilibrium from './NashEquilibrium';
import ZeroSum from './ZeroSum';
import TitForTat from './TitForTat';
import SchellingPoint from './SchellingPoint';
import UltimatumGame from './UltimatumGame';
import GameOfChicken from './GameOfChicken';
import TragedyOfCommons from './TragedyOfCommons';

// Article content (stored as HTML in Supabase) can embed a widget by
// including a placeholder element with a matching data-widget value, e.g.:
//   <div data-widget="prisoners-dilemma"></div>
// ArticleContent finds these after the HTML renders and portals the
// matching component from this registry into place.
export const WIDGET_REGISTRY: Record<string, ComponentType> = {
  'prisoners-dilemma': PrisonersDilemma,
  'nash-equilibrium': NashEquilibrium,
  'zero-sum': ZeroSum,
  'tit-for-tat': TitForTat,
  'schelling-point': SchellingPoint,
  'ultimatum-game': UltimatumGame,
  'game-of-chicken': GameOfChicken,
  'tragedy-of-commons': TragedyOfCommons,
};
