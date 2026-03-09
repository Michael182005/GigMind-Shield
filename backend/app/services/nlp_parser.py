import re


def parse_worker_text(text: str):

    text = text.lower()

    hours = re.search(r"(\d+)\s*hours?", text)
    jobs = re.search(r"(\d+)\s*(jobs|deliveries|rides|tasks)", text)
    breaks = re.search(r"(\d+)\s*(days?|breaks?)", text)

    hours_worked = int(hours.group(1)) if hours else 8
    jobs_completed = int(jobs.group(1)) if jobs else 10
    days_without_break = int(breaks.group(1)) if breaks else 1

    stress_level = 5

    if "very stressed" in text or "extremely stressed" in text:
        stress_level = 9
    elif "stressed" in text or "tired" in text:
        stress_level = 7
    elif "relaxed" in text or "fine" in text:
        stress_level = 3

    rating = 4.2

    return {
        "hours_worked": hours_worked,
        "jobs_completed": jobs_completed,
        "days_without_break": days_without_break,
        "stress_level": stress_level,
        "rating": rating
    }