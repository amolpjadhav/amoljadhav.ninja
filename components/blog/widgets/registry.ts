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
import OhmsLawDemo from './OhmsLawDemo';
import BarCompare from './BarCompare';
import WaterTowerDiagram from './WaterTowerDiagram';
import VoltageDemo from './VoltageDemo';
import BirdWireDemo from './BirdWireDemo';
import AiPriceCalculator from './AiPriceCalculator';
import CurrentDemo from './CurrentDemo';
import ResistanceDemo from './ResistanceDemo';
import LossAversionScale from './LossAversionScale';
import ChessStepper from './ChessStepper';
import AnalysisBoard from './AnalysisBoard';
import WorldMap from './WorldMap';
import FamilyTree from './FamilyTree';
import StageTimeline from './StageTimeline';
import DecisionFlow from './DecisionFlow';
import SleepSystemDiagram from './SleepSystemDiagram';
import ElementaryMagnets from './ElementaryMagnets';
import MagnetPoles from './MagnetPoles';
import EarthMagnet from './EarthMagnet';
import Electromagnet from './Electromagnet';
import NeedsLevels from './NeedsLevels';
import NeedsBalance from './NeedsBalance';
import TftComps from './TftComps';
import TftDrill from './TftDrill';
import TftReference from './TftReference';
import TftGoldCurve from './TftGoldCurve';
import RegressionToMean from './RegressionToMean';
import GradientDescent from './GradientDescent';
import FlagBrowser from './FlagBrowser';
import FlagRow from './FlagRow';
// Local-only: these belong to unpublished drafts and are deliberately not
// committed. Commit them alongside the article that uses them.
import EqualTransitMyth from './EqualTransitMyth';
import DownwashPushback from './DownwashPushback';
import UpsideDownWing from './UpsideDownWing';
import HandWingStall from './HandWingStall';
import LindyCurves from './LindyCurves';
import SkillMoveFinder from './SkillMoveFinder';
import SkillInput from './SkillInput';
import SquareTrainer from './SquareTrainer';
import MoveTrainer from './MoveTrainer';
import FiveLetters from './FiveLetters';
import Game2048 from './Game2048';
import CodeBreaker from './CodeBreaker';
import Minesweeper from './Minesweeper';
import Sudoku from './Sudoku';
import GameScorecard from './GameScorecard';
import TftItemCombinator from './TftItemCombinator';
import TftItemsSheet from './TftItemsSheet';
import NewtonPlayground from './NewtonPlayground';
import StocksLookupWidget from './StocksLookupWidget';
import TransitLookup from './TransitLookup';
import BirthdayClassroom from './BirthdayClassroom';
import BookFinderWidget from './BookFinderWidget';
import PodcastTrendingWidget from './PodcastTrendingWidget';

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
  'ohms-law-demo': OhmsLawDemo,
  'bar-compare': BarCompare,
  'water-tower-diagram': WaterTowerDiagram,
  'voltage-demo': VoltageDemo,
  'bird-wire-demo': BirdWireDemo,
  'ai-price-calculator': AiPriceCalculator,
  'current-demo': CurrentDemo,
  'resistance-demo': ResistanceDemo,
  'loss-aversion-scale': LossAversionScale,
  'chess-stepper': ChessStepper,
  'analysis-board': AnalysisBoard,
  'world-map': WorldMap,
  'family-tree': FamilyTree,
  'stage-timeline': StageTimeline,
  'decision-flow': DecisionFlow,
  'sleep-system-diagram': SleepSystemDiagram,
  'elementary-magnets': ElementaryMagnets,
  'magnet-poles': MagnetPoles,
  'earth-magnet': EarthMagnet,
  'electromagnet': Electromagnet,
  'needs-levels': NeedsLevels,
  'needs-balance': NeedsBalance,
  'tft-comps': TftComps,
  'tft-drill': TftDrill,
  'tft-reference': TftReference,
  'tft-gold-curve': TftGoldCurve,
  'regression-to-mean': RegressionToMean,
  'gradient-descent': GradientDescent,
  'flag-browser': FlagBrowser,
  'flag-row': FlagRow,
  'equal-transit-myth': EqualTransitMyth,
  'downwash-pushback': DownwashPushback,
  'upside-down-wing': UpsideDownWing,
  'hand-wing-stall': HandWingStall,
  'lindy-curves': LindyCurves,
  'skill-move-finder': SkillMoveFinder,
  'skill-input': SkillInput,
  'square-trainer': SquareTrainer,
  'move-trainer': MoveTrainer,
  'five-letters': FiveLetters,
  'game-2048': Game2048,
  'code-breaker': CodeBreaker,
  'minesweeper': Minesweeper,
  'sudoku': Sudoku,
  'game-scorecard': GameScorecard,
  'tft-item-combinator': TftItemCombinator,
  'tft-items-sheet': TftItemsSheet,
  'newton-playground': NewtonPlayground,
  'stocks-lookup': StocksLookupWidget,
  'transit-lookup': TransitLookup,
  'birthday-classroom': BirthdayClassroom,
  'book-finder': BookFinderWidget,
  'podcast-trending': PodcastTrendingWidget,
};
