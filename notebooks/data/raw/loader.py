import os
import time
import pandas as pd
import fastf1


RAW_DIR = "data/raw"


def load_race_results(year, round_number):
    session = fastf1.get_session(
        year,
        round_number,
        "R"
    )

    session.load()

    results = session.results.copy()

    results["Year"] = year
    results["Round"] = round_number

    return results


def load_season(year, start_round=1):
    os.makedirs(RAW_DIR, exist_ok=True)

    all_races = []

    schedule = fastf1.get_event_schedule(year)

    for _, event in schedule.iterrows():

        round_number = int(event["RoundNumber"])

        if round_number < start_round:
            continue

        try:

            print(
                f"Loading {year} | "
                f"Round {round_number} | "
                f"{event['EventName']}"
            )

            race = load_race_results(
                year,
                round_number
            )

            race["EventName"] = event["EventName"]

            all_races.append(race)

            print("SUCCESS")

            time.sleep(2)

        except Exception as e:

            print(
                f"FAILED | "
                f"{year} | "
                f"Round {round_number}"
            )

            print(e)

            break

    if not all_races:
        return None

    season = pd.concat(
        all_races,
        ignore_index=True
    )

    output_path = (
        f"{RAW_DIR}/f1_{year}.csv"
    )

    season.to_csv(
        output_path,
        index=False
    )

    print(
        f"Saved {len(season)} rows "
        f"to {output_path}"
    )

    return season