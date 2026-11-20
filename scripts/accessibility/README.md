# Authenticated accessibility pilot

On November 19, 2026, the PEAKS sandbox admin reached all five Team assets lists and both states of Assign Equipment. Axe flagged text contrast on 49 list elements and on six equipment labels in each dialog scan. The date controls introduced no additional axe violations. Closing the dialog returned focus to the spare webcam's Row actions button. A repeat run also checked focus on opening and found it was still on Row actions behind the dialog.

## Local baseline

The pilot ran at `406478f123e94a01062a2e7870dc54010ab3036a`, based on PEAKS `f1b8a40`. It used the fictional `sandbox-admin` account, with system-admin and Sandbox Team departmental-admin permissions. The browser was Chromium 159.0.8154.6 in a 1440 × 900 desktop viewport on Apple Silicon. Axe 4.14.1 scanned WCAG 2.0 and 2.1 Level A and AA rules. Coverage includes the initial page of each list.

| Page or dialog state | Evidence the state loaded | Axe time | Violation instances | Elements needing review |
| --- | --- | ---: | ---: | ---: |
| People | sandbox-person-01@example.test | 474 ms | 11 | 5 |
| Equipment | SBX-EQ-0056 | 412 ms | 9 | 6 |
| Access | Building card access | 341 ms | 9 | 7 |
| Keys | SBX-K-02 | 336 ms | 10 | 5 |
| Spaces | 100 North Research Hall | 320 ms | 10 | 4 |
| Assign Equipment | Brio Webcam - 56 and empty Assign To | 327 ms | 6 | 3 |
| Assign Equipment with expiration date | Maya Chen and Month, Day, Year, Toggle calendar | 258 ms | 6 | 4 |

All violations came from the `color-contrast` rule. On every list, axe flagged the asset-filter instructions, the record count beneath the table, and the copyright line. The instructions and count measured 4.35:1. The footer and affected column headings measured 4.29:1. Axe expected at least 4.5:1 for this text.

| List | Other flagged elements in its table header |
| --- | --- |
| People | Details, Name, Email, Supervisor, Keys, Equipment, Access, Workstations |
| Equipment | Details, Serial Number, Name, Assigned To, Expiration, Actions |
| Access | Details, Name, Number of Assignments, Assigned To, First Expiration, Actions |
| Keys | Details, Key Name, Key Code, Serials, its In Use / Total caption, Spaces, Actions |
| Spaces | Details, Room, Room Name, Keys, Equipment, Workstations, its In Use / Total caption |

In both dialog states, axe measured 4.35:1 on Name, Type, Serial number / identifier, Make, Model, and Room. These six labels account for all 12 dialog instances. The elements marked for review in the table are separate contrast checks that axe could not resolve.

## What required PEAKS code

The crawl signed in through the local login form and read the links inside the **Team assets** navigation on `/sandbox/people`. It needed the landmark name, the five expected destinations, and one known cell per list. All five used the same navigation, wait, and full-page scan code.

The dialog took one additional Playwright test, 65 lines including locators, assertions, and focus reporting. It tabbed from the webcam's Details link to Row actions, pressed Arrow Down to focus Assign, and pressed Enter. It scoped axe to the open dialog, searched for Maya in Assign To, selected the matching fictional person by keyboard, and waited for Month, Day, Year, and Toggle calendar before scanning again. Escape and the discard confirmation closed the dialog. The focus check targeted the original row's button because choosing Assign removes its menu item. The test ended without saving an assignment. [Playwright test](pilot.spec.mjs)

## Run time

| Local run | Dependencies and sandbox ready | Five-list crawl | Assignment flow | Total including teardown |
| --- | ---: | ---: | ---: | ---: |
| First end-to-end run, `406478f1` | 111 s | 4.52 s | 2.19 s | 130 s |
| Repeat with cached Docker build, `a6a0e3f6` | 22 s | 4.41 s | 1.72 s | 40 s |

Both runs created and seeded a fresh database. Each scenario includes a separate sign-in, navigation, checks, and scans. The crawl ran first and the assignment test used the warmed application. Both runs produced the same violation counts. Hosted Azure timing is unmeasured.

The repeat run recorded the active element after the first dialog scan and before Playwright targeted Assign To. Focus was on the Row actions button behind the open dialog. The test then placed focus in Assign To to search for Maya. The passing close check covers focus restoration only.

## Run the pilot

From the repository root, with Docker Compose and Node 22.12 or newer available, run the same command as the Linux job.

```bash
./scripts/accessibility/run.sh
```

The script installs the locked test dependencies and Chromium headless shell, starts a fresh Compose project on two Docker-assigned loopback ports, and removes that project's containers, volumes, and locally built images on exit. Linux also installs the browser's system dependencies. The script prints a directory under `artifacts/accessibility` for each run. See the [sandbox requirements](../../docs/SANDBOX.md).

- `crawl.json` records the discovered links, page URLs, coverage, axe timings, and findings with each element's selector, HTML, and failure summary.
- `assignment.json` records both dialog scans and the focus result. Each report includes total scenario time with sign-in.
- `run.txt` records the commit, environment, setup milestones, total time, and exit status. The build log and failure diagnostics are in the same directory.

The Azure Pipelines configuration adds an Ubuntu job alongside the Windows build. The job runs the same command and publishes the directory as `peaks-accessibility`. Axe findings and the measured focus result are informational. Failed setup, missing pages, unexpected login redirects, failed loads, or an unreached test state fail the job. A local failure check removed the Equipment link, redirected Access to login, and returned HTTP 503 for the Keys list. The crawl reported all three as incomplete, continued to Spaces, and exited with failure.
