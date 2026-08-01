import type { ComponentType } from 'react';
import PrisonersDilemma from './PrisonersDilemma';
import NashEquilibrium from './NashEquilibrium';
import ZeroSum from './ZeroSum';
import TitForTat from './TitForTat';
import SchellingPoint from './SchellingPoint';
import UltimatumGame from './UltimatumGame';
import GameOfChicken from './GameOfChicken';
import TragedyOfCommons from './TragedyOfCommons';
import FirstMoverAdvantage from './FirstMoverAdvantage';
import WinnersCurse from './WinnersCurse';
import StatementComparison from './StatementComparison';
import BalanceSheetBuilder from './BalanceSheetBuilder';
import IncomeWaterfall from './IncomeWaterfall';
import AlphabetBalanceSheet from './AlphabetBalanceSheet';
import AlphabetIncomeWaterfall from './AlphabetIncomeWaterfall';
import SkyScattering from './SkyScattering';
import WavelengthWave from './WavelengthWave';
import ScatteringDemo from './ScatteringDemo';
import AtmosphereZoom from './AtmosphereZoom';
import AirDensityPaths from './AirDensityPaths';
import RatingScorecard from './RatingScorecard';
import GrowthVsMarginTrend from './GrowthVsMarginTrend';
import LineTrend from './LineTrend';

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
  'first-mover-advantage': FirstMoverAdvantage,
  'winners-curse': WinnersCurse,
  'statement-comparison': StatementComparison,
  'balance-sheet-builder': BalanceSheetBuilder,
  'income-waterfall': IncomeWaterfall,
  'alphabet-balance-sheet': AlphabetBalanceSheet,
  'alphabet-income-waterfall': AlphabetIncomeWaterfall,
  'sky-scattering': SkyScattering,
  'wavelength-wave': WavelengthWave,
  'scattering-demo': ScatteringDemo,
  'atmosphere-zoom': AtmosphereZoom,
  'air-density-paths': AirDensityPaths,
  'rating-scorecard': RatingScorecard,
  'growth-vs-margin-trend': GrowthVsMarginTrend,
  'line-trend': LineTrend,
};
