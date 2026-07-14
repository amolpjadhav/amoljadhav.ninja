import type { ComponentType } from 'react';
import PrisonersDilemma from './PrisonersDilemma';
import NashEquilibrium from './NashEquilibrium';

// Article content (stored as HTML in Supabase) can embed a widget by
// including a placeholder element with a matching data-widget value, e.g.:
//   <div data-widget="prisoners-dilemma"></div>
// ArticleContent finds these after the HTML renders and portals the
// matching component from this registry into place.
export const WIDGET_REGISTRY: Record<string, ComponentType> = {
  'prisoners-dilemma': PrisonersDilemma,
  'nash-equilibrium': NashEquilibrium,
};
