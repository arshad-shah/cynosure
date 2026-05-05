import {
  AreaChart,
  BarChart,
  DonutChart,
  HBarChart,
  LineChart,
  PieChart,
  RadarChart,
  ScatterChart,
  Sparkline,
  StackedAreaChart,
  StackedBarChart,
  WaterfallChart,
} from '@arshad-shah/cynosure-react/chart';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const monthly = months.map((m, i) => ({
  month: m,
  revenue: 800 + Math.round(Math.sin(i / 2) * 400 + i * 120),
  cost: 400 + Math.round(Math.cos(i / 2) * 200 + i * 60),
  signups: 80 + Math.round(Math.sin(i / 3) * 60 + i * 8),
}));

const traffic = [
  { source: 'Direct', visits: 4200 },
  { source: 'Search', visits: 6800 },
  { source: 'Referral', visits: 1900 },
  { source: 'Social', visits: 2400 },
  { source: 'Email', visits: 1100 },
];

const radarData = [
  { axis: 'Speed', tigers: 80, dragons: 60, foxes: 70 },
  { axis: 'Power', tigers: 70, dragons: 90, foxes: 65 },
  { axis: 'Range', tigers: 90, dragons: 50, foxes: 80 },
  { axis: 'Stealth', tigers: 50, dragons: 80, foxes: 95 },
  { axis: 'Cost', tigers: 60, dragons: 70, foxes: 50 },
];

const scatter = Array.from({ length: 60 }, (_, i) => ({
  x: i,
  y: Math.round(Math.sin(i / 4) * 50 + 100 + Math.random() * 30),
  group: i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C',
}));

const waterfall = [
  { label: 'Start', value: 1000 },
  { label: 'Q1', value: 250 },
  { label: 'Q2', value: -120 },
  { label: 'Q3', value: 380 },
  { label: 'Q4', value: -90 },
];

export function ChartsPlayground() {
  return (
    <div className="pg-stack">
      <p className="pg-section-lede">
        Cynosure charts are thin wrappers around{' '}
        <a
          href="https://swiftchart.arshadshah.com"
          target="_blank"
          rel="noreferrer noopener"
          style={{ color: 'var(--cynosure-color-accent-solid)' }}
        >
          @arshad-shah/swift-chart
        </a>{' '}
        — a tiny (≈20 KB), zero-dependency Canvas 2D library. We register two themes via
        SwiftChart's <code>addTheme</code> API — <code>cynosure-light</code> and{' '}
        <code>cynosure-dark</code> — built from the same iris/feedback tokens the rest of the
        library uses. The wrapper picks one based on the active scheme; pass <code>theme</code> (any
        name or full <code>Theme</code>) to override. Toggle the page theme to verify charts repaint
        with the new palette.
      </p>

      <div className="pg-grid-2">
        <div className="pg-card">
          <h3 className="pg-card-title">Line · revenue vs. cost</h3>
          <LineChart
            data={monthly}
            mapping={{ x: 'month', y: ['revenue', 'cost'], seriesNames: ['Revenue', 'Cost'] }}
            smooth
            dots
            aspectRatio="16 / 9"
          />
        </div>

        <div className="pg-card">
          <h3 className="pg-card-title">Area · monthly revenue</h3>
          <AreaChart
            data={monthly}
            mapping={{ x: 'month', y: 'revenue', seriesNames: ['Revenue'] }}
            smooth
            aspectRatio="16 / 9"
          />
        </div>

        <div className="pg-card">
          <h3 className="pg-card-title">Bar · monthly signups</h3>
          <BarChart
            data={monthly}
            mapping={{ x: 'month', y: 'signups', seriesNames: ['Signups'] }}
            aspectRatio="16 / 9"
          />
        </div>

        <div className="pg-card">
          <h3 className="pg-card-title">Stacked bar · revenue + cost</h3>
          <StackedBarChart
            data={monthly}
            mapping={{ x: 'month', y: ['revenue', 'cost'], seriesNames: ['Revenue', 'Cost'] }}
            aspectRatio="16 / 9"
          />
        </div>

        <div className="pg-card">
          <h3 className="pg-card-title">Stacked area</h3>
          <StackedAreaChart
            data={monthly}
            mapping={{ x: 'month', y: ['revenue', 'cost'], seriesNames: ['Revenue', 'Cost'] }}
            aspectRatio="16 / 9"
          />
        </div>

        <div className="pg-card">
          <h3 className="pg-card-title">Horizontal bar · traffic</h3>
          <HBarChart data={traffic} mapping={{ x: 'source', y: 'visits' }} aspectRatio="4 / 3" />
        </div>

        <div className="pg-card">
          <h3 className="pg-card-title">Pie · share of traffic</h3>
          <PieChart
            data={traffic}
            mapping={{ labelField: 'source', valueField: 'visits' }}
            aspectRatio="1 / 1"
          />
        </div>

        <div className="pg-card">
          <h3 className="pg-card-title">Donut · share of traffic</h3>
          <DonutChart
            data={traffic}
            mapping={{ labelField: 'source', valueField: 'visits' }}
            donutWidth={0.55}
            aspectRatio="1 / 1"
          />
        </div>

        <div className="pg-card">
          <h3 className="pg-card-title">Scatter · grouped samples</h3>
          <ScatterChart
            data={scatter}
            mapping={{ x: 'x', y: 'y', groupField: 'group' }}
            aspectRatio="16 / 9"
          />
        </div>

        <div className="pg-card">
          <h3 className="pg-card-title">Radar · capability comparison</h3>
          <RadarChart
            data={radarData}
            mapping={{
              x: 'axis',
              y: ['tigers', 'dragons', 'foxes'],
              seriesNames: ['Tigers', 'Dragons', 'Foxes'],
            }}
            aspectRatio="1 / 1"
          />
        </div>

        <div className="pg-card">
          <h3 className="pg-card-title">Waterfall · quarterly deltas</h3>
          <WaterfallChart
            data={waterfall}
            mapping={{ x: 'label', y: 'value' }}
            aspectRatio="16 / 9"
          />
        </div>

        <div className="pg-card">
          <h3 className="pg-card-title">Sparkline · KPI trend</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 600 }}>$84.2k</div>
              <div style={{ color: 'var(--cynosure-color-feedback-success-solid, #22c55e)' }}>
                +12.4% MoM
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <Sparkline
                data={[12, 14, 13, 18, 22, 24, 21, 26, 30, 32, 28, 35]}
                height={56}
                filled
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
