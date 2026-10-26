# F1 Race Intelligence

**Can historical race data predict who finishes in the top 10?**

This work is a machine learning project that estimates each Formula 1 driver's probability of finishing inside the top 10. It brings together a Python research workflow and an interactive Next.js dashboard, taking race results from data collection through feature engineering, model comparison, and race-by-race evaluation.

The experiment covers **68 Grands Prix across 2022–2024**, trains on **2022–2023**, and evaluates predictions on **2024**. APEX v1 identifies **202 of 240 top-10 finishers**, achieving **84.17% Precision@10**.

[Quick start](#quick-start) · [Results](#results) · [How it works](#how-it-works) · [Notebook workflow](#notebook-workflow) · [Project structure](#project-structure)

## What you can explore

- **All 24 races from 2024:** switch between Grands Prix and inspect driver probabilities, starting positions, and actual finishes.
- **Predictions versus results:** compare the model's ten picks with the actual top-10 finishers and see hits and misses.
- **Season performance:** explore race-level Precision@10 and compare models with a starting-grid baseline.
- **The research behind the dashboard:** inspect feature engineering, logistic regression, ensemble models, feature ablations, and error analysis in Jupyter notebooks.

The dashboard reads bundled prediction files. You can run it without training a model or starting a Python backend.

## Quick start

### Run the dashboard

You need **Node.js 20.9 or newer** and **npm**. From the project root:

```sh
cd apex-web
npm ci
npm run dev
```

Open **[localhost:3000](http://localhost:3000)** and select a race to explore its predictions.

Other commands, run from `apex-web/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run lint` | Run ESLint. |
| `npm run build` | Create a production build. |
| `npm start` | Serve the production build after building it. |

No environment variables or API keys are required by the current dashboard. Installing dependencies requires internet access; Next.js also downloads the Google fonts used by the app during compilation.

## Results

The following results are recorded in [the main modeling notebook](notebooks/preparation_of_dataset.ipynb). After excluding rows with an unknown finishing position, the training set contains **878 driver-race records** and the 2024 evaluation set contains **479**.

| Model | Accuracy | F1 score | ROC-AUC | Precision@10 | Correct picks |
| --- | ---: | ---: | ---: | ---: | ---: |
| Grid baseline | — | — | — | 83.33% | 200 / 240 |
| **APEX v1 · Logistic Regression** | **83.72%** | **83.33%** | **0.9050** | **84.17%** | **202 / 240** |
| Random Forest | 82.05% | 81.70% | 0.8964 | 81.25% | 195 / 240 |
| HistGradientBoosting | 78.91% | 79.26% | 0.8657 | — | — |
| APEX + teammate grid feature | 84.34% | 84.08% | 0.9044 | 84.17% | 202 / 240 |

Here, **Precision@10** means sorting drivers by predicted top-10 probability, selecting ten per race, and counting how many actually finished in the top 10:

```text
Precision@10 = correct picks / (number of races × 10)
             = 202 / (24 × 10)
             = 84.17%
```

This is a measure of selecting the right drivers, not predicting their exact finishing order. Accuracy and F1 use the classifier's binary predictions, which do not necessarily select exactly ten drivers per race.

APEX v1 makes **two more correct picks** than the grid baseline over the season. The teammate feature improves classification metrics slightly but leaves the total top-10 picks unchanged. These are exploratory comparisons on one evaluation season; the same 2024 data is also used to compare feature variants.

## How it works

```text
FastF1 race results, 2022–2024
              |
      Clean data and build historical features
              |
      Train: 2022–2023  /  Evaluate: 2024
              |
      Median imputation → Scaling → Logistic regression
              |
      Rank each race by top-10 probability
              |
      Export JSON → APEX dashboard
```

### Prediction target

Each row represents one driver in one race. The target is `1` when the recorded finishing position is 10 or better and `0` otherwise. Rows without a known finishing position are excluded from model fitting and evaluation.

### Features

APEX v1 uses **13 features** available before the race:

| Group | Inputs |
| --- | --- |
| Starting grid | Driver's starting position. |
| Previous race | Driver's finishing position and points. |
| Recent driver form | Average finish over the last 3 and 5 races; average points and top-10 rate over the last 5 races. |
| Recent team form | Average finish over the last 3 and 5 races; average team points over the last 5 races. |
| Circuit history | Driver's average finish and previous appearance count at the event; team's average finish at the event. |

Historical averages are shifted to use earlier races. Team history is aggregated at the team-and-race level before calculating rolling features. Circuit history is grouped by event name.

The model is fitted on 2022–2023 only. During the 2024 evaluation, historical features can include results from earlier 2024 rounds, reflecting the information available before each race.

### Model pipeline

The baseline uses a scikit-learn `Pipeline` with:

1. `SimpleImputer(strategy="median")` for missing feature values.
2. `StandardScaler()` for feature scaling.
3. `LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42)` for top-10 probabilities.

The notebook also evaluates Random Forest, histogram gradient boosting, retirement-rate features, positions gained, and grid position relative to a teammate.

## Notebook workflow

### Set up Python

Use Python 3 with `pip` and `venv`. Python dependencies are not currently pinned in a requirements or lock file, so an exact reproduction of the saved results may depend on package versions.

From the project root, create a virtual environment:

```sh
python -m venv .venv
```

Activate it in **Windows PowerShell**:

```powershell
.\.venv\Scripts\Activate.ps1
```

Or in **macOS / Linux**:

```sh
source .venv/bin/activate
```

Install the notebook dependencies and start JupyterLab:

```sh
python -m pip install fastf1 pandas numpy scikit-learn matplotlib jupyterlab ipykernel
cd notebooks
python -m jupyterlab
```

Run the notebook kernels with **`notebooks/` as the working directory**. Paths such as `data/processed/...` then resolve to `notebooks/data/processed/`.

### Explore or regenerate predictions

1. **Start with [preparation_of_dataset.ipynb](notebooks/preparation_of_dataset.ipynb).** It reads the included `data/processed/f1_race_results_2022_2024.csv`, creates features, trains and compares models, and exports the season predictions. Run its cells in order in a fresh kernel.
2. **Rebuild the source dataset only if needed.** [combine_datasets.ipynb](notebooks/combine_datasets.ipynb) loads race sessions for all three seasons and writes the combined CSV. Ensure the `notebooks/cache/` directory exists before running it. Check that the output contains all 68 races; failed downloads are logged and skipped.
3. **Inspect the earlier experiments for context.** `data_explor.ipynb`, `dataset_creation.ipynb`, and `feature_design.ipynb` contain exploratory work. They include intermediate state and saved errors, so they are not prerequisites for the main workflow.

FastF1 calls may require internet access even when the combined CSV is already present: the modeling notebook loads sessions to obtain event names. Downloading a full dataset can take time and encounter rate limits; the local cache helps avoid repeated downloads.

### Update the dashboard data

The final export cell writes `notebooks/data/processed/f1_2024_predictions.json`. After generating it, copy it to the dashboard's `public/` directory. Run this from the project root in PowerShell:

```powershell
Copy-Item notebooks/data/processed/f1_2024_predictions.json apex-web/public/f1_2024_predictions.json
```

On macOS / Linux:

```sh
cp notebooks/data/processed/f1_2024_predictions.json apex-web/public/f1_2024_predictions.json
```

Refresh the browser to load the new data. Each race contains a `round` and a `drivers` array sorted by decreasing probability. Driver records contain `rank`, `driver`, `name`, `team`, `probability`, `grid`, `finish`, and `top10`; probabilities are exported as percentages from 0 to 100.

**Model version note:** the current export uses `tm_predictions` from the teammate-feature experiment, which adds a fourteenth feature. The dashboard's headline metrics, feature list, and season chart are hard-coded for APEX v1 in [app/page.tsx](apex-web/app/page.tsx). Both models have 202 correct picks overall, but their individual probabilities, race-level scores, and classification metrics can differ. When changing the exported model, update those dashboard summaries as well.

## Project structure

```text
f1model/
├── README.md
├── apex-web/                         # Next.js dashboard
│   ├── app/
│   │   ├── page.tsx                  # Race explorer and model summaries
│   │   ├── globals.css               # Dashboard styling
│   │   └── layout.tsx                # App layout and fonts
│   ├── public/
│   │   ├── f1_2024_predictions.json  # Full-season data loaded by the UI
│   │   └── bahrain_2024_predictions.json
│   └── package.json
├── notebooks/
│   ├── preparation_of_dataset.ipynb  # Main modeling and export workflow
│   ├── combine_datasets.ipynb        # Collect the 2022–2024 dataset
│   ├── dataset_creation.ipynb        # Earlier data collection experiments
│   ├── data_explor.ipynb             # Initial race-data exploration
│   ├── feature_design.ipynb          # Early feature planning
│   ├── data/
│   │   ├── raw/                     # Downloaded results and loader helper
│   │   └── processed/               # Combined CSV and prediction exports
│   └── cache/                       # Local FastF1 cache
├── data/                            # Additional data from early experiments
├── src/                             # Currently empty
└── tests/                           # Currently empty
```

## Technology

| Layer | Tools |
| --- | --- |
| Data collection | FastF1 |
| Data preparation | pandas, NumPy |
| Modeling and evaluation | scikit-learn |
| Research and plots | Jupyter notebooks, Matplotlib |
| Dashboard | Next.js 16.3.4, React 19.2.8, TypeScript |
| Styling | CSS, Tailwind CSS 4 |

The project currently runs as a notebook-based experiment with a dashboard of saved results. There is no live prediction API, automated training command, or automated test suite yet.
