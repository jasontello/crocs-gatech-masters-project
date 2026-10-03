# CROCS evaluation plan

**Drafted October 3, 2026. Status: proposed protocol, not a completed study.**

## Purpose and research question

CROCS asks whether camera assisted food logging can reduce the time and effort of maintaining a refrigerator inventory compared with manual entry. The present interface is suitable for a formative usability pilot, but its recognition, camera permission, and date reading are scripted simulations. This protocol can test whether the intake and correction workflow is understandable. It cannot establish the speed or accuracy of a future live recognition service, or demonstrate reduced food waste.

## Questions to answer in a pilot

1. Can someone add a grocery through each intake path without coaching?
2. Can they tell when a suggested item or date needs confirmation?
3. Can they recover from an incorrect or uncertain suggestion and still add the intended item?
4. Which steps feel slower or more burdensome, and why?

## Preparation

- Seek mentor guidance before recruiting participants or collecting study data. Do not treat a self walkthrough as a participant study.
- Use the same phone size, browser, starting route, and demo inventory for each session. Reset browser storage between conditions, while preserving separate consent and observation records outside the app. The prototype does not contain research analytics.
- Explain that recognition and some date behavior are simulated and that recommended dates are not food safety judgments. Do not ask anyone to rely on the prototype for storage decisions.
- Prepare a blank observation sheet using the fields below. Record no food photographs, names, or other personal details in the public repository.

## Tasks

For an exploratory comparison, use the same goal in both conditions: **add one additional carton of Whole Milk to the refrigerator inventory and verify that it appears there.** The starting demo inventory already contains one milk item, so the task explicitly asks for an additional carton. Run the conditions in both orders across sessions to reduce order bias. Reset the demo state between conditions. This is a feasibility comparison of the two *prototype interfaces*, not a comparison of live recognition accuracy.

| Condition | Starting point | Participant instruction | End point |
| --- | --- | --- | --- |
| Manual | Home | “Add one additional carton of Whole Milk using manual entry. Check that it appears in My Fridge.” | The new item appears in My Fridge with the intended name and quantity. |
| Camera simulation | Home | “Add one additional carton of Whole Milk using the camera option. Check the suggested result before saving it.” | The confirmed item appears in My Fridge with the intended name and quantity. |

After both conditions, give a separate recovery task: **when the suggested item is wrong or uncertain, correct it or use the manual fallback rather than accepting it.** The prototype exposes deterministic uncertainty scenarios for this purpose. Observe whether the participant finds a safe path to correction. Do not combine this task's timing with the basic intake comparison because it adds different work.

## Observation and measures

Start timing when the participant begins the task from Home. Stop when the added item is visible in My Fridge. If the task is abandoned, record the stopping reason rather than inventing a completion time. Use the same observer and timing rule for both conditions.

| Measure | Recording rule |
| --- | --- |
| Completion | Yes, with help, no, or stopped; verify the item in My Fridge. |
| Elapsed time | Seconds between the defined start and stop points; keep incomplete tasks separate. |
| Corrections | Count explicit edits to the item name, quantity, or suggested date before saving. |
| Help and recovery | Record prompts, backtracking, retries, and use of manual fallback as short notes. |
| Perceived effort | After each condition, ask: “How much effort did that take?” Use a 1 to 7 scale where 1 means very little and 7 means very much. |
| Understanding | After the camera condition, ask whether the item was actually recognized from the camera and what the date means. Record the answer in the participant's own words. |

Use a blank row per condition with: session code; date; order; device and browser; condition; completed; elapsed seconds; corrections; help or recovery notes; effort rating; and comprehension notes. Keep any future study records private and separate from this public plan.

## Review and interpretation

Summarize completion counts, times for completed tasks, corrections, effort ratings, and recurring observations. Report the number of sessions and any missing data. For a small formative pilot, describe patterns and individual breakdowns rather than claiming a population level effect. Separate observation from interpretation. If manual entry appears slower because the simulated camera path supplies a perfect prefilled result, identify that as a property of the demo, not evidence that real recognition is faster. Review unclear wording, unnecessary taps, and failure paths with the mentor before expanding the study.

## Current status and next step

This document defines proposed tasks and recording rules. No participant sessions, timing results, or outcome analysis have been completed for it. Next, review the protocol with the mentor, confirm whether any study approvals are needed, and run a supervised pilot or internal walkthrough before making claims about usability.
