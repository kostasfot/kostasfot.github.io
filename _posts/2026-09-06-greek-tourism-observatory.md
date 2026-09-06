---
title: "How to Measure the Performance of a Greek Tourism Destination"
excerpt: "More visitors, a better season? My Greek Tourism Observatory explores what overnight stays, spending, seasonality, and airport traffic reveal about Central Macedonia."
type: project
tags: [tourism-analytics, python, duckdb, data-visualization, greece]
cover_image: /assets/images/posts/greek-tourism-observatory/cover.webp
cover_image_alt: "Beyond the arrival count: measuring a Greek tourism destination with the Greek Tourism Observatory"
repository_url: https://github.com/kostasfot/tourism-analytics-learning-lab
published: true
---

Picture a busy summer weekend in northern Greece. Flights are arriving in Thessaloniki, hotels are filling up, and the roads towards Chalkidiki are lively. It is tempting to call that a successful tourism season.

But what would we need to know before making that judgement? Are visitors staying longer? Are they spending more? Does the activity continue outside the summer peak? And are we even counting the same thing when one source says “arrivals” and another says “passengers”?

Those questions shaped my **Greek Tourism Observatory**, a project that brings official tourism statistics into one reproducible analytical workflow. I focused on Central Macedonia, with a closer look at the Regional Units of Thessaloniki, Chalkidiki, and Pieria, and Greece-wide benchmarks.

The most useful lesson so far: a destination can record more accommodation nights while visitor value tells a much less comfortable story. Let's walk through the numbers—and how to read them.

<!--more-->

> **Which years are we looking at?** This post uses the project's archived data snapshot, checked on 6 September 2026. **2024 is the shared year** across accommodation, travel-value, and airport sources. Selected 2025 figures appear separately. The source files were downloaded in August 2026; institutions may have published newer or revised data since then.

## First, what does “a visitor” actually mean?

*Reading on a phone? Tap any chart to open the full-size image, and swipe wide tables sideways to see every column.*

Imagine someone flying into Thessaloniki, spending a night in the city, then moving to a hotel in Chalkidiki. That journey can appear in several statistics. Adding them together would count different events from the same trip.

Here are the four measures I keep separate:

| Measure | What it counts | Keep in mind |
| --- | --- | --- |
| Accommodation arrivals | Check-ins at covered establishments | One person can check in more than once |
| Inbound travellers | Non-resident entries in national travel statistics | This is a national journey measure |
| Regional visits | Visits allocated to a region | One traveller can visit several regions |
| Airport passengers | Movements through an airport | Includes residents and non-tourism travel |

This distinction sounds small until you build a dashboard. An unqualified card saying “7 million arrivals” could tell four very different stories. Naming the measure properly is the first useful quality check.

## A busy region, viewed through more than one lens

Central Macedonia recorded **4,428,987 accommodation arrivals** and **17,184,700 accommodation nights** in 2024. Nights were **5.9% higher than in 2023**.

That is evidence of growing demand in the covered accommodation population. The Bank of Greece travel figures add another perspective:

| Central Macedonia travel measure | 2019 | 2024 |
| --- | ---: | ---: |
| Regional travel receipts, nominal EUR billions | 2.25 | 1.49 |
| Average expenditure per regional visit | EUR 333 | EUR 211 |
| Average nights per regional visit | 6.04 | 4.41 |

*Source: Bank of Greece regional travel statistics, downloaded 14 August 2026. These are regional visits and travel nights, with the source's regional cruise exclusions. They are distinct from ELSTAT accommodation check-ins and nights.*

[![Central Macedonia's 2024 travel measures indexed to 2019 equals 100: regional visits 104.0, travel receipts 66.0, spend per visit 63.5, and nights per visit 73.1.](/assets/images/posts/greek-tourism-observatory/visitor-value.webp)](/assets/images/posts/greek-tourism-observatory/visitor-value.webp)

*Each bar compares one measure with its own 2019 baseline. The dashed line marks 100, or the 2019 level. Receipts and spending use nominal euros, without an inflation adjustment. Source: Bank of Greece; calculations from the Observatory.*

The contrast is striking. Regional visits were slightly above their 2019 level, while receipts, spending per visit, and nights per visit remained below it. “More visits” would miss a large part of the picture.

For context, Greece recorded **EUR 21.59 billion in travel receipts in 2024**. I would not turn that into a simple national-versus-regional spending league table: the national average uses inbound travellers, while the regional average uses visits. Their denominators and coverage differ.

There is also a limit to what this tells us. These aggregates cannot establish whether the regional pattern comes from visitor mix, prices, shorter itineraries, or different spending behaviour. They give us good questions to investigate, not a proven explanation.

### A small calculation with a big consequence

Regional spending per visit is **regional receipts divided by regional visits**. The units need to agree: when receipts are in EUR millions and visits are in thousands, the ratio must be multiplied by 1,000 to produce euros per visit.

Average stay uses **regional travel nights divided by regional visits**. I calculate both from the unrounded inputs and round only the displayed result. And when combining compatible groups, I divide their summed numerators by their summed denominators—not an unweighted average of their averages.

## The summer peak is hard to miss

Annual totals are useful, but they hide the rhythm of the year. A hotel, a transport provider, and a destination manager all need to understand when demand arrives.

[![Monthly accommodation nights in Central Macedonia in 2024. July has 3.76 million nights, August 4.14 million, and September 2.59 million; together they account for 61.0% of the annual total.](/assets/images/posts/greek-tourism-observatory/seasonality.webp)](/assets/images/posts/greek-tourism-observatory/seasonality.webp)

*Source: ELSTAT Table 13, downloaded 14 August 2026. The regional monthly series covers hotels and similar establishments plus short-stay accommodation; tourist campsites are excluded. The gold bars identify the three busiest months.*

**July, August, and September account for 61.0% of the year's nights.** That leaves the other nine months sharing the remaining 39.0%.

The peak-three-month share is exactly what its name suggests: add the three largest monthly observations and divide by the annual total. The busiest months do not have to be consecutive, although they are in this example.

I also calculate the **coefficient of variation**, which compares the spread of the twelve monthly counts with their average. Here it is **0.96**. You do not need to memorize the formula to read the chart: the practical point is that demand is distributed very unevenly across the year.

For destination management, this supports investigating opportunities in the months around the summer peak. It does not prove that a particular festival, flight route, or marketing campaign will extend the season. Each proposed action still needs its own evidence and evaluation.

## Three destinations, three different accommodation pictures

Looking below the regional total makes the story more useful. In this project, the official workbooks support **annual** comparisons for the Regional Units of Thessaloniki, Chalkidiki, and Pieria.

[![Ranked accommodation nights in 2024: Chalkidiki 6.08 million, Thessaloniki 3.01 million, and Pieria 1.80 million.](/assets/images/posts/greek-tourism-observatory/destinations.webp)](/assets/images/posts/greek-tourism-observatory/destinations.webp)

*Source: ELSTAT annual Regional Unit tables, downloaded 14 August 2026. These are Regional Units, not city or municipal totals. Their covered accommodation population excludes short-stay establishments.*

For an exact comparison:

| Regional Unit, 2024 | Accommodation check-ins | Accommodation nights | Nights vs 2023 |
| --- | ---: | ---: | ---: |
| Thessaloniki | 1,487,414 | 3,006,254 | +5.4% |
| Chalkidiki | 1,183,143 | 6,081,443 | +6.1% |
| Pieria | 446,976 | 1,797,892 | +1.5% |

Chalkidiki records more nights than Thessaloniki despite fewer check-ins. That is a useful starting point for investigating how accommodation use differs across the two destinations. The figures alone do not establish the reasons.

There are two traps to avoid here. First, these annual files do not give me a monthly seasonal profile or source-country breakdown for each of the three units. Second, their population differs from the broader regional monthly series. Adding the three rows will not reconstruct Central Macedonia: they cover only part of the region, and the accommodation scope also differs.

## Where do the overnight stays come from?

For Central Macedonia as a whole, ELSTAT provides country-of-residence detail. That lets us ask which named source markets account for the most non-resident accommodation nights.

[![Central Macedonia's five largest named source markets for non-resident accommodation nights in 2024: Romania 1.93 million, Germany 1.55 million, Bulgaria 1.20 million, United Kingdom 1.10 million, and Poland 0.47 million.](/assets/images/posts/greek-tourism-observatory/source-markets.webp)](/assets/images/posts/greek-tourism-observatory/source-markets.webp)

*Source: ELSTAT Table 14, downloaded 14 August 2026. This market table includes hotels, similar establishments, campsites, and short-stay accommodation. The five named countries account for 44.1% of the full non-resident nights denominator; it is not a ranking by spending.*

Romania, Germany, Bulgaria, the United Kingdom, and Poland together represent **44.1%** of the non-resident accommodation nights in this regional table. Greece's five largest named markets account for **50.5%** of its national non-resident total.

It would be easy to say that the lower regional percentage proves greater diversification. There is a catch: **35.2% of Central Macedonia's denominator sits in residual groups**, rather than individually named countries. Those groups contain detail we cannot see.

The dashboard also reports the **Herfindahl–Hirschman Index (HHI)**, a concentration measure that adds squared market shares. I label it *published-market HHI*, because pooling countries into a residual group can make concentration look higher than it would if each country were visible separately. The residual share belongs beside the headline—not buried in a footnote.

## Airport traffic is a useful clue about access

Thessaloniki Airport matters to the region's accessibility, so I included Fraport Greece's annual traffic figures. Domestic and international movements add up to the total in each year:

[![Thessaloniki Airport passenger movements, split into domestic and international, from 2019 to 2025. Totals fall from 6.90 million in 2019 to 2.32 million in 2020, then reach 7.38 million in 2024 and 7.98 million in 2025.](/assets/images/posts/greek-tourism-observatory/airport.webp)](/assets/images/posts/greek-tourism-observatory/airport.webp)

*Source: Fraport Greece full-year reports, downloaded 19 August 2026. The 2020 report supplies the 2019 comparison baseline; 2020–2025 use each year's current-report column. Passenger movements are not unique tourists.*

The airport handled **7,381,064 passenger movements in 2024** and **7,982,798 in 2025**. The later year's total is **15.8% above 2019**, and international traffic represents **68.1%** of 2025 movements.

That is an access indicator, not a count of tourists staying in a particular destination. The data does not tell us how many passengers stayed in Thessaloniki, continued to Chalkidiki, visited Pieria, or travelled for a non-tourism purpose.

The Bank of Greece's 2025 observations also show **EUR 1.62 billion in Central Macedonia receipts** and **EUR 23.63 billion nationally**. These are later signals, presented separately because the archived accommodation pack used for this analysis ends in 2024.

## The comparisons I deliberately leave blank

One of the most valuable parts of this project has been learning when a dashboard should refuse to calculate a number.

The regional accommodation arrivals-and-nights series expands to include short-stay establishments from 2021. A 2024-versus-2019 accommodation index would therefore mix a change in demand with a change in coverage. I withhold it and show a population-break status. The 2024-versus-2023 nights comparison remains valid within the same scope.

Occupancy needs similar care. The project displays official hotel bed-place occupancy and hotel capacity. Dividing broader accommodation nights by hotel-only bed places would combine incompatible populations and overlook the availability period required by an occupancy denominator. Campsite pitches are a different unit again.

Missing and suppressed values also stay distinct from zero. A blank source cell should not silently become “no tourism activity.” These choices make a dashboard less superficially complete, but much more useful.

## From official files to a reproducible Observatory

Behind the charts is a local workflow built with **Python, DuckDB, SQL, Streamlit, and Plotly**. Provider-specific downloaders preserve the original files and record retrieval dates, URLs, and checksums. Parsers retain source units, geographic detail, and missing-value states. SQL then builds the curated facts and KPI views used by the dashboard and report.

The automated checks cover parser behaviour, duplicate keys, geographic mappings, unit conversions, source reconciliation, and KPI formulas. Tests use small offline fixtures, so a temporary website outage does not change whether the code passes.

ELSTAT supplies the destination accommodation evidence; the Bank of Greece supplies travel value; Fraport supplies airport traffic. Eurostat provides harmonized benchmarks and reconciliation, while GISCO supplies the map boundaries. Their roles stay visible throughout the analysis.

You can explore the [project repository](https://github.com/kostasfot/tourism-analytics-learning-lab), read the [KPI dictionary](https://github.com/kostasfot/tourism-analytics-learning-lab/blob/b00af02cdb7523fa7210bc8ed45ef3acbe74043a/docs/data/project-1-kpi-model.md), or open the [five-page analytical report](https://github.com/kostasfot/tourism-analytics-learning-lab/blob/b00af02cdb7523fa7210bc8ed45ef3acbe74043a/reports/executive/greek-tourism-observatory-2024.pdf). The dashboard runs locally from the repository.

## What I would put on a destination manager's desk

My starting scorecard would answer five questions:

1. **How much accommodation demand did we record?** Read check-ins and nights together.
2. **What happened to visitor value?** Follow receipts, spending per regional visit, and stay length with matching denominators.
3. **When did demand occur?** Look at the monthly profile, not just the annual total.
4. **Where is demand concentrated?** Compare destinations and source markets at the geographic detail actually available.
5. **How reliable is the comparison?** Keep the source vintage, coverage, and baseline limitations visible.

For Central Macedonia, the current snapshot points towards investigating visitor value alongside accommodation growth, looking for evidence about demand outside the peak months, and treating the three Regional Units as distinct management questions.

That is what I want the Observatory to help with: turning a broad question—“How is tourism doing?”—into a few precise questions that we can answer, challenge, and revisit as better evidence arrives.

## Sources and data notes

All graphics are original visualizations of the project's public aggregate observations. The [chart data](/assets/images/posts/greek-tourism-observatory/chart-data.json) includes the plotted values, population labels, retrieval dates, and the analytical repository revision used for this post.

- **ELSTAT:** [2024 accommodation publication](https://www.statistics.gr/en/statistics/-/publication/STO12/2024); archived workbooks retrieved 14 August 2026. The regional monthly and market tables have different campsite coverage, and the annual Regional Unit tables exclude short-stay establishments.
- **Bank of Greece:** [Travel Services statistics](https://www.bankofgreece.gr/en/statistics/external-sector/balance-of-payments/travel-services); six archived workbooks retrieved 14 August 2026. Receipts are nominal euros; regional visits are not unique national travellers and regional cruise exclusions apply.
- **Fraport Greece:** [Traffic figures](https://www.fraport-greece.com/en/our-expertise/aviation/traffic-figures.html); six full-year reports retrieved 19 August 2026. Its 14-airport network is not the total Greek airport system.
- **Eurostat:** [Tourism methodology](https://ec.europa.eu/eurostat/web/tourism/methodology) and [GISCO boundaries](https://ec.europa.eu/eurostat/web/gisco/geodata/statistical-units/territorial-units-statistics) for classification, benchmark, and geographic context.

Values are rounded for readability. This is a dated descriptive analysis: it does not estimate inflation-adjusted growth, business profitability, tourism GDP, or causal economic impact. Later revisions may change the figures without changing the need to define them carefully.
