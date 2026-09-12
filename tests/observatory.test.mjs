import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import {
  selectRows,
  resolveFilters,
  chartData,
} from "../assets/js/observatory.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const releaseRoot = join(root, "assets/data/observatory/2026-09-12-display");
const read = (path) => readFileSync(path, "utf8");
const snapshot = JSON.parse(read(join(releaseRoot, "snapshot.json")));
const post = read(join(root, "_posts/2026-09-06-greek-tourism-observatory.md"));

test("phone labels stay readable without changing coordinates or hover values", () => {
  const spec = snapshot.charts["travel-receipts-GR_NATIONAL"];
  const before = JSON.stringify(spec);
  const data = chartData(spec, true);
  assert.deepEqual(data[0].y, spec.data[0].y);
  assert.deepEqual(data[0].text, spec.data[0].text);
  assert.deepEqual(data[0].texttemplate, [
    "%{text}",
    "",
    "",
    "",
    "",
    "",
    "%{text}",
  ]);
  assert.equal(data[0].textfont.size, 12);
  assert.equal(data[0].constraintext, "none");
  assert.equal(JSON.stringify(spec), before);
  assert.deepEqual(chartData(spec, false), spec.data);
});

test("data downloads are removed and official sources remain available", () => {
  assert.deepEqual(readdirSync(releaseRoot).sort(), [
    "manifest.json",
    "snapshot.json",
  ]);
  assert.equal(
    existsSync(join(root, "assets/data/observatory/2026-09-11-v1")),
    false,
  );
  const dashboard = read(join(root, "observatory/index.html"));
  const script = read(join(root, "assets/js/observatory.mjs"));
  for (const content of [post, dashboard, script]) {
    assert.doesNotMatch(
      content,
      /#downloads|id="downloads"|obs-downloads|\.csv|\.zip|csvDownload|\.download\s*=/,
    );
  }
  for (const content of [post, dashboard]) {
    assert.match(content, /To download data|want to download data/);
    for (const provider of [
      "www.statistics.gr",
      "ec.europa.eu/eurostat",
      "www.bankofgreece.gr",
    ])
      assert.ok(content.includes("https://" + provider));
  }
  assert.ok(
    Object.values(snapshot.rights.providers).every(
      (row) => row.download === false,
    ),
  );
});

test("every release payload matches its manifest checksum", () => {
  const manifest = JSON.parse(read(join(releaseRoot, "manifest.json")));
  assert.equal(manifest.release, snapshot.release);
  for (const [file, digest] of Object.entries(manifest.files)) {
    assert.equal(
      createHash("sha256")
        .update(readFileSync(join(releaseRoot, file)))
        .digest("hex"),
      digest,
      file,
    );
  }
  assert.equal(Object.keys(snapshot.datasets).length, 9);
  assert.equal(snapshot.source_files.length, 47);
  assert.deepEqual(
    [...new Set(snapshot.source_files.map((row) => row.provider))].sort(),
    ["Bank of Greece", "ELSTAT", "Eurostat"],
  );
  assert.ok(!JSON.stringify(snapshot).includes("C:\\\\Users"));
});

test("article charts resolve to the published snapshot and nonempty data", () => {
  const figures = [
    ...post.matchAll(
      /data-chart="([^"]+)" data-table="([^"]+)" data-filters='([^']+)'/g,
    ),
  ];
  assert.equal(figures.length, 17);
  assert.equal(new Set(figures.map((match) => match[1])).size, 17);
  for (const [, chart, dataset, filters] of figures) {
    assert.ok(snapshot.charts[chart], chart);
    assert.ok(
      selectRows(snapshot.datasets[dataset], JSON.parse(filters)).length,
      dataset,
    );
  }
  assert.ok(post.includes("/observatory/"));
  assert.ok(post.includes("release_id: " + snapshot.release));
});

test("article headline and table anchors match numeric publication values", () => {
  const integer = (value) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
  const data = snapshot.datasets;
  for (const row of selectRows(data.demand, { year: 2024 }))
    assert.ok(post.includes(integer(row.value)), row.geography_name);
  for (const row of data.capacity.filter(
    (row) =>
      [2024, 2025].includes(row.year) && row.metric === "hotel_bed_places",
  ))
    assert.ok(post.includes(integer(row.value)));
  for (const row of selectRows(data.benchmark, {
    year: 2024,
    geography_code: "EL52",
  })) {
    assert.ok(post.includes(integer(row.national_value)));
    assert.ok(post.includes(row.share_percent.toFixed(2) + "%"));
  }
  assert.equal(
    Math.round(
      selectRows(data.seasonality, { year: 2024 })[0]
        .peak_three_month_share_percent,
    ),
    61,
  );
  assert.equal(
    selectRows(data.concentration, {
      year: 2024,
      geography_id: "EL52",
      metric: "nights",
    })[0].top_five_country_share_percent.toFixed(1),
    "44.1",
  );
});

test("uncleared old downloads are absent and no denied dataset is shipped", () => {
  for (const filename of [
    "airport.webp",
    "visitor-value.webp",
    "chart-data.json",
  ]) {
    assert.equal(
      existsSync(
        join(root, "assets/images/posts/greek-tourism-observatory", filename),
      ),
      false,
    );
    assert.equal(post.includes(filename), false);
  }
  assert.deepEqual(
    snapshot.omissions.map((row) => row.provider),
    ["Fraport Greece", "GISCO"],
  );
  assert.ok(
    Object.keys(snapshot.datasets).every(
      (name) => !/airport|receipts|bog|fraport|geometry/.test(name),
    ),
  );
  assert.equal(snapshot.rights.providers["Fraport Greece"].download, false);
});
test("filters do not cross geography, metric or period", () => {
  assert.deepEqual(
    selectRows(
      [
        { year: 2024, geo: "EL52", value: 5 },
        { year: 2025, geo: "EL52", value: 8 },
        { year: 2024, geo: "EL522", value: 2 },
      ],
      { year: 2024, geo: "EL52" },
    ),
    [{ year: 2024, geo: "EL52", value: 5 }],
  );
});
test("Bank of Greece article tables and chart coordinates match reviewed data", () => {
  const rows = snapshot.datasets.travel;
  assert.equal(rows.length, 14);
  const format = (value, digits) =>
    new Intl.NumberFormat("en-GB", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  for (const row of rows.filter((r) => [2019, 2024, 2025].includes(r.year))) {
    for (const value of [
      format(row.receipts_millions, 1),
      format(row.denominator_thousands / 1000, 2),
      format(row.overnight_stays_thousands / 1000, 2),
      format(row.expenditure_per_unit, 2),
      format(row.average_stay_nights, 2),
    ])
      assert.ok(post.includes(value), `${row.scope_id} ${row.year}: ${value}`);
  }
  const regional = selectRows(rows, {
    scope_id: "EL52_REGIONAL",
    year: 2025,
  })[0];
  const national = selectRows(rows, { scope_id: "GR_NATIONAL", year: 2025 })[0];
  assert.equal(regional.denominator_label, "regional visits");
  assert.equal(national.denominator_label, "inbound travellers");
  assert.equal(regional.receipts_yoy_percent.toFixed(1), "9.3");
  assert.equal(regional.average_stay_yoy_percent.toFixed(1), "-10.6");
  assert.equal(regional.receipts_recovery_2019_index.toFixed(1), "72.2");
  assert.equal(national.receipts_recovery_2019_index.toFixed(1), "130.0");
  for (const scope of Object.keys(snapshot.travel_scopes)) {
    const scoped = selectRows(rows, { scope_id: scope });
    for (const [key, field] of [
      ["receipts", "receipts_millions"],
      ["expenditure", "expenditure_per_unit"],
      ["average_stay_nights", "average_stay_nights"],
      ["denominator_thousands", "denominator_thousands"],
      ["overnight_stays_thousands", "overnight_stays_thousands"],
    ]) {
      const chart = snapshot.charts[`travel-${key}-${scope}`];
      assert.deepEqual(
        chart.data[0].y,
        scoped.map((r) => r[field]),
      );
      assert.equal(chart.data[0].marker.color, "#22d3ee");
    }
  }
  assert.match(post, /supplementary cruise data/);
  assert.match(post, /not a Bank of Greece publication or endorsement/);
});
test("URL filters default safely and valid choices survive a shared link", () => {
  const snapshot = {
    geographies: [{ code: "EL52" }, { code: "EL522" }],
    shared_years: [2019, 2024],
    travel_scopes: { EL52_REGIONAL: {}, GR_NATIONAL: {} },
    travel_years: {
      EL52_REGIONAL: [2019, 2024, 2025],
      GR_NATIONAL: [2019, 2024],
    },
  };
  assert.deepEqual(
    resolveFilters(snapshot, "?geo=bad&year=2030&market=bad&measure=bad"),
    {
      geo: "EL52",
      year: 2024,
      marketGeo: "EL52",
      metric: "nights",
      travelScope: "EL52_REGIONAL",
      travelYear: 2025,
    },
  );
  assert.deepEqual(
    resolveFilters(
      snapshot,
      "?geo=EL522&year=2019&market=GR&measure=arrivals&travel=GR_NATIONAL&travelYear=2024",
    ),
    {
      geo: "EL522",
      year: 2019,
      marketGeo: "GR",
      metric: "arrivals",
      travelScope: "GR_NATIONAL",
      travelYear: 2024,
    },
  );
  assert.equal(
    resolveFilters(snapshot, "?travel=GR_NATIONAL&travelYear=2025").travelYear,
    2024,
  );
  assert.equal(
    resolveFilters(snapshot, "?travel=__proto__&travelYear=2030").travelScope,
    "EL52_REGIONAL",
  );
});
