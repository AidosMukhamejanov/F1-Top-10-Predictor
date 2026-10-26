"use client";

import { useEffect, useMemo, useState } from "react";

type Prediction = {
  rank: number;
  driver: string;
  name: string;
  team: string;
  probability: number;
  grid: number | null;
  finish: number | null;
  top10: number;
};

type RacePrediction = {
  round: number;
  drivers: Prediction[];
};

const raceMeta: Record<
  number,
  {
    code: string;
    name: string;
  }
> = {
  1: { code: "BHR", name: "Bahrain Grand Prix" },
  2: { code: "SAU", name: "Saudi Arabian Grand Prix" },
  3: { code: "AUS", name: "Australian Grand Prix" },
  4: { code: "JPN", name: "Japanese Grand Prix" },
  5: { code: "CHN", name: "Chinese Grand Prix" },
  6: { code: "MIA", name: "Miami Grand Prix" },
  7: { code: "EMI", name: "Emilia Romagna Grand Prix" },
  8: { code: "MON", name: "Monaco Grand Prix" },
  9: { code: "CAN", name: "Canadian Grand Prix" },
  10: { code: "ESP", name: "Spanish Grand Prix" },
  11: { code: "AUT", name: "Austrian Grand Prix" },
  12: { code: "GBR", name: "British Grand Prix" },
  13: { code: "HUN", name: "Hungarian Grand Prix" },
  14: { code: "BEL", name: "Belgian Grand Prix" },
  15: { code: "NED", name: "Dutch Grand Prix" },
  16: { code: "ITA", name: "Italian Grand Prix" },
  17: { code: "AZE", name: "Azerbaijan Grand Prix" },
  18: { code: "SGP", name: "Singapore Grand Prix" },
  19: { code: "USA", name: "United States Grand Prix" },
  20: { code: "MEX", name: "Mexico City Grand Prix" },
  21: { code: "BRA", name: "São Paulo Grand Prix" },
  22: { code: "LVG", name: "Las Vegas Grand Prix" },
  23: { code: "QAT", name: "Qatar Grand Prix" },
  24: { code: "ABU", name: "Abu Dhabi Grand Prix" },
};

const precisionByRound: Record<number, number> = {
  1: 10,
  2: 9,
  3: 7,
  4: 10,
  5: 9,
  6: 8,
  7: 9,
  8: 9,
  9: 7,
  10: 10,
  11: 7,
  12: 7,
  13: 9,
  14: 8,
  15: 9,
  16: 8,
  17: 7,
  18: 10,
  19: 7,
  20: 8,
  21: 8,
  22: 9,
  23: 8,
  24: 9,
};

const features = [
  "Grid position",
  "Previous race finish",
  "Previous race points",
  "Driver average finish — last 3",
  "Driver average finish — last 5",
  "Driver average points — last 5",
  "Driver Top-10 rate — last 5",
  "Team average finish — last 3",
  "Team average finish — last 5",
  "Team average points — last 5",
  "Driver circuit history",
  "Circuit experience",
  "Team circuit history",
];

export default function Home() {
  const [races, setRaces] = useState<RacePrediction[]>([]);
  const [selectedRound, setSelectedRound] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/f1_2024_predictions.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load prediction data");
        }

        return response.json();
      })
      .then((data: RacePrediction[]) => {
        setRaces(data);

        if (data.length > 0) {
          setSelectedRound(data[0].round);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const selectedRace = useMemo(
    () => races.find((race) => race.round === selectedRound),
    [races, selectedRound]
  );

  const predictions = selectedRace?.drivers ?? [];

  const predictedTop10 = predictions.slice(0, 10);

  const correctTop10 = predictedTop10.filter(
    (prediction) => prediction.top10 === 1
  ).length;

  const averageConfidence =
    predictedTop10.length > 0
      ? predictedTop10.reduce(
          (sum, prediction) => sum + prediction.probability,
          0
        ) / predictedTop10.length
      : 0;

  const actualTop10 = [...predictions]
    .filter((prediction) => prediction.top10 === 1)
    .sort(
      (a, b) =>
        (a.finish ?? Number.POSITIVE_INFINITY) -
        (b.finish ?? Number.POSITIVE_INFINITY)
    )
    .slice(0, 10);

  const raceName =
    raceMeta[selectedRound]?.name ?? `Round ${selectedRound}`;

  const raceCode =
    raceMeta[selectedRound]?.code ?? `R${selectedRound}`;

  return (
    <main className="apex-page">
      <div className="telemetry-grid" />

      <header className="topbar">
        <div className="shell topbar-inner">
          <div className="brand">
            <span className="brand-mark" />
            <span>APEX</span>
          </div>

          <div className="topbar-center">
            RACE INTELLIGENCE SYSTEM
          </div>

          <div className="session-state">
            <span className="session-dot" />
            MODEL ONLINE
          </div>
        </div>
      </header>

      <section className="hero shell">
        <div className="hero-kicker">
          MACHINE LEARNING / FORMULA 1
        </div>

        <div className="hero-layout">
          <div>
            <h1 className="hero-title">
              APEX
              <span>RACE INTELLIGENCE</span>
            </h1>

            <p className="hero-question">
              CAN DATA PREDICT
              <br />
              THE TOP 10?
            </p>

            <p className="hero-copy">
              A machine learning experiment using historical
              Formula 1 race data to predict whether each driver
              will finish inside the Top 10.
            </p>
          </div>

          <div className="hero-panel">
            <div className="hero-panel-label">
              DATA WINDOW
            </div>

            <div className="timeline">
              <div className="timeline-row">
                <span>2022</span>
                <div className="timeline-line active" />
                <span className="timeline-tag">TRAIN</span>
              </div>

              <div className="timeline-row">
                <span>2023</span>
                <div className="timeline-line active" />
                <span className="timeline-tag">TRAIN</span>
              </div>

              <div className="timeline-row">
                <span>2024</span>
                <div className="timeline-line test" />
                <span className="timeline-tag test-tag">
                  TEST
                </span>
              </div>
            </div>

            <div className="hero-score">
              <div>
                <strong>84.17%</strong>
                <span>PRECISION@10</span>
              </div>

              <div>
                <strong>202 / 240</strong>
                <span>CORRECT PICKS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="metric-strip">
        <div className="shell metric-grid">
          <Metric value="83.72%" label="Accuracy" />
          <Metric value="83.33%" label="F1 score" />
          <Metric value="90.50%" label="ROC-AUC" />
          <Metric value="84.17%" label="Precision@10" />
        </div>
      </section>

      <section className="race-section shell">
        <div className="section-heading-row">
          <div>
            <span className="section-index">01</span>
            <span className="section-kicker">
              RACE PREDICTION
            </span>

            <h2>2024 SEASON</h2>
          </div>

          <p>
            Select any race to inspect the model&apos;s
            pre-race Top-10 probabilities.
          </p>
        </div>

        <div className="race-selector">
          {races.map((race) => {
            const meta = raceMeta[race.round];

            return (
              <button
                key={race.round}
                onClick={() => setSelectedRound(race.round)}
                className={
                  selectedRound === race.round
                    ? "race-tab active"
                    : "race-tab"
                }
              >
                <span className="race-tab-round">
                  {String(race.round).padStart(2, "0")}
                </span>

                <span className="race-tab-code">
                  {meta?.code ?? `R${race.round}`}
                </span>
              </button>
            );
          })}
        </div>

        <div className="race-header">
          <div>
            <div className="race-small">
              ROUND {String(selectedRound).padStart(2, "0")} /
              24
            </div>

            <h3>{raceName}</h3>

            <div className="race-code">
              {raceCode}
            </div>
          </div>

          <div className="race-summary">
            <RaceStat
              label="APEX SCORE"
              value={`${correctTop10}/10`}
            />

            <RaceStat
              label="RACE PRECISION"
              value={`${correctTop10 * 10}%`}
            />

            <RaceStat
              label="AVG CONFIDENCE"
              value={`${averageConfidence.toFixed(1)}%`}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-panel">
            READING MODEL OUTPUT...
          </div>
        ) : predictions.length === 0 ? (
          <div className="loading-panel error">
            NO PREDICTION DATA
          </div>
        ) : (
          <div className="leaderboard">
            <div className="leaderboard-head">
              <span>RANK</span>
              <span>DRIVER</span>
              <span>MODEL OUTPUT</span>
              <span>GRID</span>
              <span>ACTUAL</span>
              <span>STATUS</span>
            </div>

            {predictions.map((prediction) => {
              const picked = prediction.rank <= 10;
              const correct =
                picked && prediction.top10 === 1;

              return (
                <div
                  className={
                    picked
                      ? "leaderboard-row picked"
                      : "leaderboard-row"
                  }
                  key={`${selectedRound}-${prediction.driver}`}
                >
                  <div className="rank-cell">
                    {String(prediction.rank).padStart(2, "0")}
                  </div>

                  <div className="driver-cell">
                    <strong>{prediction.driver}</strong>

                    <div>
                      <span>{prediction.name}</span>
                      <small>{prediction.team}</small>
                    </div>
                  </div>

                  <div className="probability-cell">
                    <div className="probability-label">
                      <span>
                        {prediction.probability.toFixed(1)}%
                      </span>

                      {picked && <em>TOP 10 PICK</em>}
                    </div>

                    <div className="probability-track">
                      <div
                        className="probability-fill"
                        style={{
                          width: `${Math.min(
                            prediction.probability,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="position-cell">
                    {prediction.grid === null
                      ? "—"
                      : `P${prediction.grid}`}
                  </div>

                  <div className="position-cell">
                    {prediction.finish === null
                      ? "—"
                      : `P${prediction.finish}`}
                  </div>

                  <div>
                    {correct ? (
                      <span className="status correct">
                        ✓ HIT
                      </span>
                    ) : picked ? (
                      <span className="status miss">
                        × MISS
                      </span>
                    ) : prediction.top10 === 1 ? (
                      <span className="status recovery">
                        ↑ TOP 10
                      </span>
                    ) : (
                      <span className="status neutral">
                        —
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="comparison-section">
        <div className="shell">
          <div className="section-heading-row">
            <div>
              <span className="section-index">02</span>
              <span className="section-kicker">
                PREDICTION VS ACTUAL
              </span>

              <h2>WHO MADE THE CUT?</h2>
            </div>
          </div>

          <div className="versus-grid">
            <RankingColumn
              title="APEX PICK"
              predictions={predictedTop10}
              mode="prediction"
            />

            <div className="versus-center">
              <span>VS</span>
            </div>

            <RankingColumn
              title="ACTUAL TOP 10"
              predictions={actualTop10}
              mode="actual"
            />
          </div>
        </div>
      </section>

      <section className="season-section shell">
        <div className="section-heading-row">
          <div>
            <span className="section-index">03</span>
            <span className="section-kicker">
              SEASON PERFORMANCE
            </span>

            <h2>PRECISION@10 / 2024</h2>
          </div>

          <p>
            Number of correctly identified Top-10 drivers in
            each Grand Prix.
          </p>
        </div>

        <SeasonChart
          selectedRound={selectedRound}
          onSelectRound={setSelectedRound}
        />
      </section>

      <section className="model-section">
        <div className="shell">
          <div className="section-heading-row">
            <div>
              <span className="section-index">04</span>
              <span className="section-kicker">
                MODEL BENCHMARK
              </span>

              <h2>WHY LOGISTIC REGRESSION?</h2>
            </div>

            <p>
              More complex models were tested, but the simpler
              baseline remained the strongest race-ranking model.
            </p>
          </div>

          <div className="benchmark-grid">
            <BenchmarkCard
              model="APEX v1"
              type="Logistic Regression"
              precision="84.17%"
              correct="202 / 240"
              selected
            />

            <BenchmarkCard
              model="Grid Baseline"
              type="No ML"
              precision="83.33%"
              correct="200 / 240"
            />

            <BenchmarkCard
              model="Random Forest"
              type="Ensemble ML"
              precision="81.25%"
              correct="195 / 240"
            />
          </div>
        </div>
      </section>

      <section className="features-section shell">
        <div className="section-heading-row">
          <div>
            <span className="section-index">05</span>
            <span className="section-kicker">
              MODEL INPUT
            </span>

            <h2>13 PRE-RACE FEATURES</h2>
          </div>
        </div>

        <div className="feature-grid">
          {features.map((feature, index) => (
            <div className="feature-row" key={feature}>
              <span>
                {String(index + 1).padStart(2, "0")}
              </span>

              <strong>{feature}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="pipeline-section">
        <div className="shell">
          <div className="section-heading-row">
            <div>
              <span className="section-index">06</span>
              <span className="section-kicker">
                PIPELINE
              </span>

              <h2>FROM DATA TO PREDICTION</h2>
            </div>
          </div>

          <div className="pipeline">
            <PipelineStep
              index="01"
              title="FASTF1 DATA"
              body="68 Grand Prix events across the 2022–2024 seasons."
            />

            <PipelineArrow />

            <PipelineStep
              index="02"
              title="FEATURE ENGINEERING"
              body="Driver form, team form, grid position and circuit history."
            />

            <PipelineArrow />

            <PipelineStep
              index="03"
              title="TEMPORAL SPLIT"
              body="2022–2023 for training. Full 2024 season held out for testing."
            />

            <PipelineArrow />

            <PipelineStep
              index="04"
              title="APEX OUTPUT"
              body="Probability of each driver finishing inside the Top 10."
            />
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="shell footer-inner">
          <strong>APEX</strong>
          <span>F1 RACE INTELLIGENCE</span>
          <span>ML PROJECT / 2026</span>
        </div>
      </footer>
    </main>
  );
}

function Metric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function RaceStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="race-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RankingColumn({
  title,
  predictions,
  mode,
}: {
  title: string;
  predictions: Prediction[];
  mode: "prediction" | "actual";
}) {
  return (
    <div className="ranking-column">
      <div className="ranking-title">
        {title}
      </div>

      {predictions.map((prediction, index) => {
        const rank =
          mode === "actual"
            ? prediction.finish ?? index + 1
            : index + 1;

        return (
          <div
            className="ranking-entry"
            key={`${mode}-${prediction.driver}`}
          >
            <span>
              {String(rank).padStart(2, "0")}
            </span>

            <strong>{prediction.driver}</strong>

            <small>{prediction.team}</small>

            {mode === "prediction" && (
              <em>
                {prediction.probability.toFixed(1)}%
              </em>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SeasonChart({
  selectedRound,
  onSelectRound,
}: {
  selectedRound: number;
  onSelectRound: (round: number) => void;
}) {
  return (
    <div className="season-chart">
      <div className="chart-axis">
        <span>10</span>
        <span>9</span>
        <span>8</span>
        <span>7</span>
      </div>

      <div className="chart-bars">
        {Object.entries(precisionByRound).map(
          ([roundString, score]) => {
            const round = Number(roundString);
            const height =
              ((score - 6) / 4) * 100;

            return (
              <button
                className={
                  selectedRound === round
                    ? "season-bar selected"
                    : "season-bar"
                }
                key={round}
                onClick={() => onSelectRound(round)}
                title={`${raceMeta[round]?.name}: ${score}/10`}
              >
                <div className="bar-area">
                  <div
                    className="bar-fill"
                    style={{
                      height: `${height}%`,
                    }}
                  >
                    <span>{score}</span>
                  </div>
                </div>

                <small>
                  {raceMeta[round]?.code}
                </small>
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}

function BenchmarkCard({
  model,
  type,
  precision,
  correct,
  selected = false,
}: {
  model: string;
  type: string;
  precision: string;
  correct: string;
  selected?: boolean;
}) {
  return (
    <div
      className={
        selected
          ? "benchmark-card selected"
          : "benchmark-card"
      }
    >
      <div className="benchmark-top">
        <div>
          <span>{type}</span>
          <h3>{model}</h3>
        </div>

        {selected && <em>SELECTED</em>}
      </div>

      <strong className="benchmark-value">
        {precision}
      </strong>

      <span className="benchmark-label">
        PRECISION@10
      </span>

      <div className="benchmark-footer">
        <span>CORRECT PICKS</span>
        <strong>{correct}</strong>
      </div>
    </div>
  );
}

function PipelineStep({
  index,
  title,
  body,
}: {
  index: string;
  title: string;
  body: string;
}) {
  return (
    <div className="pipeline-step">
      <span>{index}</span>
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}

function PipelineArrow() {
  return <div className="pipeline-arrow">→</div>;
}