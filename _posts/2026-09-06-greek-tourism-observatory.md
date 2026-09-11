---
title: "How to Measure the Performance of a Greek Tourism Destination"
excerpt: "Beyond the busy summer: explore Central Macedonia's tourism demand, seasonality, hotel capacity and source markets, with an interactive Observatory and downloadable official data."
type: project
tags: [tourism-analytics, python, duckdb, data-visualization, greece]
cover_image: /assets/images/posts/greek-tourism-observatory/cover.webp
cover_image_alt: "Beyond the arrival count: measuring a Greek tourism destination with the Greek Tourism Observatory"
repository_url: https://github.com/kostasfot/tourism-analytics-learning-lab
demo_url: https://kostasfot.github.io/observatory/
last_modified_at: 2026-09-11
release_id: 2026-09-11-v1
observatory: true
published: true
---

## The short version

**Central Macedonia's accommodation demand grew in 2024, but “more visitors” is only the beginning of the story.** The region recorded **4.43 million check-ins and 17.18 million nights**, up about **5.8% and 5.9%** respectively from 2023. Around **61% of those nights fell in just three months**. And the balance between check-ins and nights looks very different in Thessaloniki, Chalkidiki and Pieria.

That is why I built the Greek Tourism Observatory: to move from “it felt busy” to questions we can actually check. How much demand reached the destination? How concentrated was the season? Which markets mattered? And are we comparing like with like?

You can now explore the evidence yourself. The dashboard runs here on this website, without an account or a separate app to install.

<div class="obs-actions"><a class="obs-button" href="/observatory/">Explore the live Observatory ↗</a><a class="obs-button secondary" href="/observatory/#downloads">Download the public data ↓</a></div>

<!--more-->

<div data-blog-observatory data-snapshot="/assets/data/observatory/2026-09-11-v1/snapshot.json"></div>
<p id="obs-status" role="status"></p>

> **A note on “live”:** the dashboard is online and interactive, but its data are a reviewed published snapshot—not a live database connection. This edition uses source files freshly retrieved on **11 September 2026**, release **2026-09-11-v1**. Accommodation comparisons share **2019–2024**; **2025 hotel capacity** appears separately. The required 2025 monthly, source-market and subregional accommodation tables were still unavailable in the inspected ELSTAT publication pack.

The public edition contains the accommodation material cleared for reuse from **ELSTAT and Eurostat**. Travel-value and airport outputs, and the boundary map, are withheld pending publication clearance. I explain those gaps below and link to the official sources. This edition replaces the earlier article's affected graphics and chart-data download; the original local research product remains separate.

## First, what does “a visitor” actually mean?

Picture a busy summer weekend in northern Greece. Someone arrives at Thessaloniki Airport, stays a night in the city, then moves to a hotel in Chalkidiki. One trip can generate several statistical records. Adding them together would not reveal more tourists—it would mix different kinds of events.

| Measure | What it counts | What it does **not** mean |
| --- | --- | --- |
| Accommodation arrivals | Check-ins at covered establishments | Unique people visiting a destination |
| Accommodation nights | Nights spent at those establishments | Every night spent in the region, including all private stays |
| Inbound travellers | Non-resident entries in national travel statistics | Regional accommodation check-ins |
| Regional visits | Visits allocated to a region in travel statistics | A count that can be added to national travellers |
| Airport passengers | Passenger movements through an airport | Tourists arriving at the destination |

The practical rule is simple: **put the population in the name of the measure**. “Accommodation check-ins” is more useful than an unexplained “arrivals” card. These distinctions follow [UN Tourism's IRTS 2008](https://unstats.un.org/unsd/publication/Seriesm/SeriesM_83rev1e.pdf) and [Eurostat's tourism methodology](https://ec.europa.eu/eurostat/web/tourism/methodology).

## Demand grew—but the comparison needs a boundary

**The 2024 increase is clear within the published accommodation series.** Central Macedonia recorded 4,428,987 check-ins and 17,184,700 nights. The two charts separate the number of accommodation arrivals from the amount of time spent in covered accommodation. Open an exact-data panel to inspect annual observations and comparison states.

<div class="obs-blog-chart" data-chart="total_arrivals-EL52" data-table="demand" data-filters='{"geography_code":"EL52","metric":"total_arrivals"}' data-caption="Central Macedonia annual check-ins"><div class="obs-plot"></div><div class="obs-chart-table"></div><a href="/observatory/?geo=EL52&amp;year=2024#demand">Explore annual demand →</a></div>

Check-ins describe accommodation use, not distinct people. Their increase is useful operational context, but cannot establish whether visitors spent more or generated a better outcome for residents.

<div class="obs-blog-chart" data-chart="total_nights-EL52" data-table="demand" data-filters='{"geography_code":"EL52","metric":"total_nights"}' data-caption="Central Macedonia annual nights"><div class="obs-plot"></div><div class="obs-chart-table"></div><a href="/observatory/?geo=EL52&amp;year=2024#demand">Explore nights and comparison states →</a></div>

Nights add the duration dimension. Their roughly 5.9% increase was close to the increase in check-ins, rather than evidence of a dramatic shift in the relationship between the two. That observation still concerns accommodation use—not the length of a complete trip through Greece.

There is a historical trap here. **From 2021, Central Macedonia's regional series includes short-stay accommodation as well as hotels and similar establishments.** The earlier series has a narrower population. I withhold a like-for-like 2019 recovery index across that break. An attractive percentage built from different populations would be less informative than an honest gap. Source: [ELSTAT accommodation publications—www.statistics.gr](https://www.statistics.gr/en/statistics/-/publication/STO12/2024).

## Greece is a useful benchmark—if the denominator matches

**Central Macedonia accounted for about 12.08% of check-ins and 11.40% of nights in the matched national accommodation population in 2024.** These are accommodation shares, not shares of all international visitors to Greece.

| 2024 measure | Central Macedonia | Greece, matched population | Regional share |
| --- | ---: | ---: | ---: |
| Accommodation check-ins | 4,428,987 | 36,666,543 | 12.08% |
| Accommodation nights | 17,184,700 | 150,753,298 | 11.40% |

The national denominator uses Eurostat monthly resident-plus-non-resident totals, matching the establishment categories. Hotels are **NACE I551**; short-stay accommodation is **I552**. I do not substitute an aggregate that also includes campsites. A valid annual comparison requires twelve observed, unflagged months per required component. The export retains those cells so you can check the denominator. Sources: [Eurostat tourism data](https://ec.europa.eu/eurostat/web/tourism/information-data), `tour_occ_arm` and `tour_occ_nim`; regional numerator from ELSTAT.

<div class="obs-blog-chart" data-chart="regions-total_nights-2024" data-table="regions" data-filters='{"year":2024,"metric":"total_nights"}' data-caption="Greek regions: annual accommodation nights"><div class="obs-plot"></div><div class="obs-chart-table"></div><a href="/observatory/?year=2024#destinations">Compare the regional ranking →</a></div>

The ranking places Central Macedonia in a national context without confusing land area with tourism volume. It replaces the choropleth while geometry reuse is under review. Ranking tells us about scale; it does not rate destination quality, profitability or residents' wellbeing.

## Thessaloniki, Chalkidiki and Pieria have different profiles

**Thessaloniki leads these three units in hotel check-ins; Chalkidiki leads in hotel nights.** A city-oriented accommodation pattern and a longer-stay holiday pattern need not produce the same relationship between the two measures.

<div class="obs-blog-chart" data-chart="ranking-total_arrivals-2024" data-table="demand" data-filters='{"year":2024,"metric":"total_arrivals"}' data-caption="2024 check-ins and population labels"><div class="obs-plot"></div><div class="obs-chart-table"></div><a href="/observatory/?year=2024#destinations">Explore subregional comparisons →</a></div>

This is a comparison of **annual hotel-only** observations for the three Regional Units. It is not a monthly picture and does not include the full regional short-stay population. The supporting download also includes the separately labelled Central Macedonia total; do not add it to its constituent areas.

<div class="obs-blog-chart" data-chart="ranking-total_nights-2024" data-table="demand" data-filters='{"year":2024,"metric":"total_nights"}' data-caption="2024 nights and population labels"><div class="obs-plot"></div><div class="obs-chart-table"></div><a href="/observatory/?geo=EL527&amp;year=2024#destinations">Explore Chalkidiki and its neighbours →</a></div>

The nights ranking changes the emphasis: Chalkidiki recorded about 6.08 million hotel nights, compared with 3.01 million in Thessaloniki and 1.80 million in Pieria. That is a reason to examine duration and product mix alongside the headline count—not proof of why visitors chose a place.

| Regional Unit, 2024 | Hotel check-ins | Hotel nights | Nights: change from 2023 |
| --- | ---: | ---: | ---: |
| Thessaloniki | 1,487,414 | 3,006,254 | +5.35% |
| Chalkidiki | 1,183,143 | 6,081,443 | +6.07% |
| Pieria | 446,976 | 1,797,892 | +1.54% |

These units are not the whole region. Nor does the annual ELSTAT workbook support a fabricated monthly series for each one. Source: [ELSTAT 2024, Table 15—www.statistics.gr](https://www.statistics.gr/en/statistics/-/publication/STO12/2024).

## A good year can still depend heavily on three months

**Around 61% of Central Macedonia's 2024 accommodation nights fell in the busiest three months.** That is 10,480,579 nights out of 17,184,700. A strong annual total can coexist with a sharply seasonal business environment.

<div class="obs-blog-chart" data-chart="monthly-2024" data-table="monthly" data-filters='{"year":2024}' data-caption="Central Macedonia monthly nights and occupancy"><div class="obs-plot"></div><div class="obs-chart-table"></div><a href="/observatory/?year=2024#seasonality">Explore the monthly profile →</a></div>

Read the bars as a profile of the year. The peak-three-month share gives that shape a compact summary. The monthly coefficient of variation was about **0.96**: standard deviation divided by the mean. It describes unevenness, not a target every destination should minimize blindly.

For a hotel, DMC or destination organisation, this raises questions about staffing, supplier continuity, transport and shoulder-season experiences. It does **not** prove that a particular campaign would shift demand. That would need additional evidence. Source: [ELSTAT regional monthly accommodation, Table 13—www.statistics.gr](https://www.statistics.gr/en/statistics/-/publication/STO12/2024).

## Occupancy and capacity answer a different question

**Demand tells us what was used; capacity describes the published supply base.** Official monthly hotel bed occupancy helps connect the two, but its denominator must remain intact.

<div class="obs-blog-chart" data-chart="occupancy-2024" data-table="monthly" data-filters='{"year":2024}' data-caption="Official hotel bed occupancy by month"><div class="obs-plot"></div><div class="obs-chart-table"></div><a href="/observatory/?year=2024#seasonality">Inspect official occupancy →</a></div>

This is **ELSTAT's official hotel bed-occupancy percentage**. It is not a new calculation dividing broader accommodation nights by registered beds. The nights and occupancy series have different populations; annual capacity does not mean every bed was open every day.

<div class="obs-blog-chart" data-chart="hotel_bed_places-EL52" data-table="capacity" data-filters='{"geography_code":"EL52","metric":"hotel_bed_places"}' data-caption="Central Macedonia hotel bed places"><div class="obs-plot"></div><div class="obs-chart-table"></div><a href="/observatory/?geo=EL52#capacity">Explore capacity through 2025 →</a></div>

Central Macedonia had **92,057 hotel bed places in 2024** and **92,198 in 2025** in the acquired ELSTAT table. The later observation is useful supply context, but does not make 2025 a complete demand-and-supply comparison year.

<div class="obs-blog-chart" data-chart="hotel_establishments-EL52" data-table="capacity" data-filters='{"geography_code":"EL52","metric":"hotel_establishments"}' data-caption="Central Macedonia hotel establishments"><div class="obs-plot"></div><div class="obs-chart-table"></div><a href="/observatory/?geo=EL52#capacity">Inspect establishment counts →</a></div>

Establishments and bed places describe different aspects of supply. Use both when discussing accommodation structure, rather than interpreting either as a direct measure of investment quality or operating performance.

| Geography | Hotel bed places, 2024 | Hotel bed places, 2025 |
| --- | ---: | ---: |
| Central Macedonia | 92,057 | 92,198 |
| Thessaloniki | 16,325 | 16,421 |
| Chalkidiki | 49,069 | 49,343 |
| Pieria | 19,612 | 19,308 |

Source: [ELSTAT capacity, Table 01—www.statistics.gr](https://www.statistics.gr/en/statistics/-/publication/STO12/2025). The regional total includes other units too. **Some ELSTAT–Eurostat capacity differences remain unresolved**, so ELSTAT is primary rather than averaging the sources into a false consensus.

## Source markets: the denominator changes the story

**The five leading named countries accounted for about 44.1% of Central Macedonia's non-resident accommodation nights in 2024.** The comparable Greece figure was about **50.5%**. These are shares of non-resident nights, not all accommodation demand or receipts.

<div class="obs-blog-chart" data-chart="markets-EL52-2024-nights" data-table="markets" data-filters='{"geography_id":"EL52","year":2024,"metric":"nights"}' data-caption="Central Macedonia source markets: non-resident nights"><div class="obs-plot"></div><div class="obs-chart-table"></div><a href="/observatory/?market=EL52&amp;measure=nights&amp;year=2024#markets">Explore nights by source market →</a></div>

The chart highlights named countries while the download retains the broader published detail. The regional non-resident-night denominator is **14,184,425**, rather than the 17.18 million nights including residents used earlier. A top-five chart is a starting point for monitoring, not a reason to ignore smaller markets or domestic demand.

<div class="obs-blog-chart" data-chart="markets-EL52-2024-arrivals" data-table="markets" data-filters='{"geography_id":"EL52","year":2024,"metric":"arrivals"}' data-caption="Central Macedonia source markets: non-resident check-ins"><div class="obs-plot"></div><div class="obs-chart-table"></div><a href="/observatory/?market=EL52&amp;measure=arrivals&amp;year=2024#markets">Switch to check-ins by source market →</a></div>

Switching to non-resident check-ins changes the regional top-five share to **46.2%**. Both numbers can be correct: they answer different questions. The dashboard keeps the measure selectable so “market share” never becomes a label without a denominator.

| 2024 concentration measure | Central Macedonia | Greece |
| --- | ---: | ---: |
| Top-five named-country share of non-resident nights | 44.1% | 50.5% |
| Published residual share of non-resident nights | 35.2% | 8.8% |
| Published-market HHI, nights | 1,597 | 859 |
| Top-five named-country share of non-resident check-ins | 46.2% | 49.5% |

There is a catch in the HHI row. HHI adds squared shares to describe concentration, but here it uses **published country and residual buckets**. The region's large residual category is not one country. It would be misleading to interpret the HHI difference as a clean country-level diversification ranking. Greece's denominator is also unavailable in some earlier retained market workbooks; the corresponding chart is withheld rather than inventing a total. Source: [ELSTAT country-of-residence results, Table 14—www.statistics.gr](https://www.statistics.gr/en/statistics/-/publication/STO12/2024).

## What about spending, length of stay and the airport?

**Accommodation is only one part of performance.** The broader local Observatory examines travel receipts, spending per trip or regional visit, nights per traveller or visit, and Thessaloniki Airport traffic. Those concepts remain important, although their derived charts and downloadable values are not included in this public release.

| Question | Appropriate source and measure | Interpretation guardrail |
| --- | --- | --- |
| How much did inbound travel generate? | [Bank of Greece Travel Services](https://www.bankofgreece.gr/en/statistics/external-sector/balance-of-payments/travel-services), nominal receipts | Not GDP, profit or inflation-adjusted welfare |
| How much per trip or regional visit? | Matching receipts divided by national travellers **or** regional visits | Never mix national and regional denominators |
| How long did visitors stay? | Matching nights divided by travellers or visits | Different population from accommodation check-ins |
| How connected is the airport? | [Fraport Greece reports](https://www.fraport-greece.com/en/our-expertise/aviation/traffic-figures.html), passenger movements | Includes residents, departures and non-tourism travel |

The Bank of Greece's [terms](https://www.bankofgreece.gr/en/useful-links/terms-of-use) distinguish accurate reproduction from modification; permission for these transformed public outputs has not been established. Fraport's [terms](https://www.fraport-greece.com/en/site-services/legal-information.html) require written consent for use on other websites. This is a conservative publication decision, not a claim that the statistics cannot be consulted. The map is likewise withheld until the relevant [GISCO reuse conditions](https://ec.europa.eu/eurostat/web/gisco/geodata/statistical-units/territorial-units-statistics) are resolved for this release.

## How I would use this in a destination meeting

**Start with a question, not a bigger dashboard.** A useful conversation might follow this order:

1. **Check the population and period.** Hotels, broader accommodation, regional visits or passenger movements? Is the year complete?
2. **Read check-ins alongside nights.** Is the question about volume, time spent, or both?
3. **Look beyond the annual total.** Review the monthly regional profile before calling a season balanced or resilient.
4. **Compare the right places.** Use hotel-only subregional comparisons, and a matched national denominator for regional shares.
5. **Treat concentration as a prompt for investigation.** Monitor leading markets and residual coverage, rather than turning an incomplete HHI into a definitive risk score.

The next questions are not answered by these charts alone: How do accommodation patterns connect with visitor spending? Which experiences could attract viable shoulder-season demand? How do residents experience tourism pressure? What explains the remaining source differences? Those require additional evidence, not stronger wording around the same statistics.

## Download, inspect and reuse the evidence

Every interactive figure above draws from the **same versioned snapshot** as the dashboard. Open its exact-data panel to inspect rows or download a filtered CSV. The full cleared extract includes nine CSV tables, the chart snapshot, source provenance, reuse notes and a compact data dictionary. A separate manifest records file checksums.

<div class="obs-actions"><a class="obs-button" href="/assets/data/observatory/2026-09-11-v1/data.zip" download>Download the public data ZIP ↓</a><a class="obs-button secondary" href="/observatory/#downloads">Browse individual CSV files</a><a class="obs-button secondary" href="/assets/data/observatory/2026-09-11-v1/manifest.json">View release manifest</a></div>

These are **public aggregate extracts**, not the full DuckDB database or original institutional files. Nulls remain missing rather than zero; status columns explain unavailable values and comparisons. CSV numbers retain calculation precision, while the article rounds for readability. The pipeline and quality-check code is in the [Tourism Analytics Learning Lab](https://github.com/kostasfot/tourism-analytics-learning-lab).

**Attribution and modifications:** source data are from the Hellenic Statistical Authority (ELSTAT), [www.statistics.gr](https://www.statistics.gr), and [Eurostat](https://ec.europa.eu/eurostat/web/tourism/information-data). I selected, translated and normalized observations and calculated the indicators. ELSTAT, Eurostat and the European Union bear no responsibility for these modifications. Reuse follows the [ELSTAT policy](https://www.statistics.gr/documents/20181/1412250/Copyright_Reuse_Policy_EN.pdf/dfacb7d1-3d9b-471f-851a-8b8b09994a74?t=1464603016196) and [Eurostat copyright notice](https://ec.europa.eu/eurostat/help/copyright-notice), with third-party materials and logos excluded.

The goal is not a dashboard that makes every number look certain. It is a useful starting point for a better conversation about tourism—one where you can see the definition, follow the source, and check the data yourself.
