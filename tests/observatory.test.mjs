import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import {
  selectRows,
  csvText,
  resolveFilters,
  csvDownloadUrl,
} from "../assets/js/observatory.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const releaseRoot = join(root, "assets/data/observatory/2026-09-11-v1");
const read = (path) => readFileSync(path, "utf8");
const snapshot = JSON.parse(read(join(releaseRoot, "snapshot.json")));
const post = read(join(root, "_posts/2026-09-06-greek-tourism-observatory.md"));

test("direct CSV links encode exactly the selected reviewed rows", () => {
  const rows = selectRows(snapshot.datasets.demand, {
    geography_code: "EL52",
    metric: "total_arrivals",
  });
  const uri = csvDownloadUrl(rows);
  assert.ok(uri.startsWith("data:text/csv;charset=utf-8,"));
  assert.equal(
    decodeURIComponent(uri.slice(uri.indexOf(",") + 1)),
    csvText(rows),
  );
  assert.equal(rows.length, 6);
  assert.equal(
    csvDownloadUrl([{ name: "Ελλάδα, + =", value: null }]).includes("%CE"),
    true,
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
  assert.equal(snapshot.source_files.length, 41);
  assert.deepEqual(
    [...new Set(snapshot.source_files.map((row) => row.provider))].sort(),
    ["ELSTAT", "Eurostat"],
  );
  assert.ok(!JSON.stringify(snapshot).includes("C:\\\\Users"));
});

test("article charts resolve to the published snapshot and nonempty data", () => {
  const figures = [
    ...post.matchAll(
      /data-chart="([^"]+)" data-table="([^"]+)" data-filters='([^']+)'/g,
    ),
  ];
  assert.equal(figures.length, 11);
  assert.equal(new Set(figures.map((match) => match[1])).size, 11);
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
    ["Bank of Greece", "Fraport Greece", "GISCO"],
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
test("CSV preserves null, negative numbers, Unicode and escapes text", () => {
  assert.equal(
    csvText([
      { name: '=evil,"x"', value: null },
      { name: "Ελλάδα", value: -2.5 },
    ]),
    'name,value\n"\'=evil,""x""",\nΕλλάδα,-2.5\n',
  );
  assert.equal(csvText([]), "");
});
test("URL filters default safely and valid choices survive a shared link", () => {
  const snapshot = {
    geographies: [{ code: "EL52" }, { code: "EL522" }],
    shared_years: [2019, 2024],
  };
  assert.deepEqual(
    resolveFilters(snapshot, "?geo=bad&year=2030&market=bad&measure=bad"),
    { geo: "EL52", year: 2024, marketGeo: "EL52", metric: "nights" },
  );
  assert.deepEqual(
    resolveFilters(snapshot, "?geo=EL522&year=2019&market=GR&measure=arrivals"),
    { geo: "EL522", year: 2019, marketGeo: "GR", metric: "arrivals" },
  );
});
