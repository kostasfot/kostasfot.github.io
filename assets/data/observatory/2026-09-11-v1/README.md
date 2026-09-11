# Public data dictionary

Release: 2026-09-11-v1

Counts are check-ins, nights, establishments or bed places as labelled, not unique visitors. Percent fields use 0-100; recovery is 2019=100; HHI is 0-10,000. Null CSV cells remain missing, never zero. Status columns explain absence or comparability. A leading apostrophe protects formula-like text in CSV.

Monthly nights and occupancy have different accommodation populations: retain their population columns. Capacity is hotels only. Markets are non-resident accommodation counts; residuals are not countries. Benchmark values match year and NACE population. National monthly values are Greece / TOTAL residence / NR count; I551 hotels and I552 short-stay remain separate.

## demand

Rows: 48. Columns: retrieval_date, year, metric, value, unit, population, value_status, yoy_change, yoy_status, recovery_2019_index, recovery_2019_status, geography_code, geography_name, geography_nuts_level.

## monthly

Rows: 72. Columns: year, month, nights, occupancy_percent, nights_population, occupancy_population.

## seasonality

Rows: 6. Columns: year, population, month_count, observed_month_count, annual_nights, peak_three_month_nights, peak_three_month_share_percent, monthly_coefficient_of_variation, calculation_status.

## capacity

Rows: 56. Columns: year, metric, value, unit, population, source_status, analytical_status, yoy_change_percent, yoy_status, recovery_2019_index, recovery_2019_status, geography_code, geography_name, geography_nuts_level.

## markets

Rows: 656. Columns: retrieval_date, year, geography_id, geography_name, market, market_kind, metric, value, unit, population, source_status.

## concentration

Rows: 24. Columns: retrieval_date, year, geography_id, geography_name, metric, unit, population, denominator_value, denominator_method, country_market_count, residual_market_count, unavailable_detail_count, published_detail_value, detail_coverage_percent, residual_value, residual_share_percent, top_five_country_value, top_five_country_share_percent, published_market_hhi, calculation_status.

## national_monthly

Rows: 336. Columns: dataset_code, activity, year, month, value, status, flag.

## regions

Rows: 156. Columns: retrieval_date, year, geography_id, geography_name, metric, value, unit, population, value_status.

## benchmark

Rows: 48. Columns: year, geography_code, metric, population, destination_value, national_value, share_percent, status, unit, dataset_code.
