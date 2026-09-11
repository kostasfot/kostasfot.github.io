/* Native website reader. Calculations and chart coordinates come from one reviewed export. */
export function selectRows(rows, filters) {
  return rows.filter((row) =>
    Object.entries(filters).every(([key, value]) => row[key] === value),
  );
}
export function csvText(rows) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const cell = (value) => {
    let text = value == null ? "" : String(value);
    if (typeof value === "string" && /^[\s]*[=+@-]/.test(text))
      text = "'" + text;
    return /[",\n\r]/.test(text)
      ? '"' + text.replaceAll('"', '""') + '"'
      : text;
  };
  return (
    [
      keys.map(cell).join(","),
      ...rows.map((row) => keys.map((key) => cell(row[key])).join(",")),
    ].join("\n") + "\n"
  );
}
export function resolveFilters(snapshot, search) {
  const params = new URLSearchParams(search);
  const geo = snapshot.geographies.some((g) => g.code === params.get("geo"))
    ? params.get("geo")
    : "EL52";
  const year = snapshot.shared_years.includes(Number(params.get("year")))
    ? Number(params.get("year"))
    : snapshot.shared_years.at(-1);
  const marketGeo = ["EL52", "GR"].includes(params.get("market"))
    ? params.get("market")
    : "EL52";
  const metric = ["arrivals", "nights"].includes(params.get("measure"))
    ? params.get("measure")
    : "nights";
  return { geo, year, marketGeo, metric };
}
export function csvDownloadUrl(rows) {
  return "data:text/csv;charset=utf-8," + encodeURIComponent(csvText(rows));
}
const label = (value) =>
  value.replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase());
const number = (value, decimals = 0) =>
  value == null
    ? "Not available"
    : new Intl.NumberFormat("en-GB", {
        maximumFractionDigits: decimals,
      }).format(value);
const percentage = (value) =>
  value == null ? "Not available" : number(value, 1) + "%";
const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text != null) node.textContent = text;
  if (className) node.className = className;
  return node;
};
const byId = (id) => document.getElementById(id);
function link(text, href, className) {
  const node = element("a", text, className);
  node.href = href;
  return node;
}
function table(target, rows, title, columns = null) {
  target.replaceChildren();
  if (!rows.length) {
    target.append(
      element("p", "No supported observations for this selection."),
    );
    return;
  }
  const details = element("details", null, "obs-detail");
  details.append(element("summary", `${title} · ${rows.length} rows`));
  const button = link(
    "Download these rows · CSV ↓",
    csvDownloadUrl(rows),
    "obs-button secondary",
  );
  button.download = title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-") + ".csv";
  details.append(button);
  const scroll = element("div", null, "obs-table-scroll");
  scroll.tabIndex = 0;
  scroll.setAttribute("aria-label", title + " scrollable table");
  const node = element("table", null, "obs-table");
  node.append(element("caption", title));
  const head = element("thead");
  const tr = element("tr");
  const keys = columns || Object.keys(rows[0]);
  keys.forEach((key) => {
    const th = element("th", label(key));
    th.scope = "col";
    tr.append(th);
  });
  head.append(tr);
  node.append(head);
  const body = element("tbody");
  rows.forEach((row) => {
    const line = element("tr");
    keys.forEach((key) =>
      line.append(
        element("td", row[key] == null ? "Not available" : String(row[key])),
      ),
    );
    body.append(line);
  });
  node.append(body);
  scroll.append(node);
  details.append(scroll);
  target.append(details);
}
async function plot(target, spec) {
  if (target.querySelector(".js-plotly-plot"))
    window.Plotly?.purge(target.querySelector(".js-plotly-plot"));
  target.replaceChildren();
  if (!spec) {
    target.append(
      element(
        "p",
        "Chart withheld: the selected year has no supported denominator or complete coverage.",
        "obs-note",
      ),
    );
    return;
  }
  const title = (spec.layout.title?.text || "").split("<br>");
  const heading = element("h3", title[0].replace(/<[^>]*>/g, ""));
  heading.style.cssText = "padding:1rem 1rem 0;margin:0;font-size:1rem";
  target.append(heading);
  if (title[1]) {
    const subtitle = element("p", title[1].replace(/<[^>]*>/g, ""), "obs-note");
    subtitle.style.cssText = "padding:0 1rem;margin:.5rem 0";
    target.append(subtitle);
  }
  if (!window.Plotly) {
    target.append(
      element(
        "p",
        "Chart library unavailable. The exact table and CSV remain available.",
        "obs-note",
      ),
    );
    return;
  }
  const canvas = element("div");
  target.append(canvas);
  const layout = structuredClone(spec.layout);
  layout.title = { text: "" };
  layout.autosize = true;
  layout.margin = { ...layout.margin, t: 20, r: 35 };
  layout.height = Math.max(300, (layout.height || 400) - 55);
  if (window.innerWidth < 500) {
    layout.font = { ...layout.font, size: 11 };
    layout.margin.r = 18;
  }
  await window.Plotly.newPlot(canvas, spec.data, layout, {
    responsive: true,
    displaylogo: false,
    displayModeBar: false,
  });
}
function cards(target, values) {
  target.replaceChildren();
  values.forEach(([name, value, context]) => {
    const card = element("div", null, "obs-kpi");
    card.append(
      element("span", name, "label"),
      element("strong", value),
      element("small", context),
    );
    target.append(card);
  });
}
async function dashboard(snapshot, root) {
  const state = resolveFilters(snapshot, location.search);
  const controls = {
    geo: byId("obs-geography"),
    year: byId("obs-year"),
    marketGeo: byId("obs-market-geography"),
    metric: byId("obs-market-metric"),
  };
  snapshot.geographies.forEach((g) => {
    const option = element("option", g.name);
    option.value = g.code;
    controls.geo.append(option);
  });
  snapshot.shared_years.forEach((year) => {
    const option = element("option", String(year));
    option.value = year;
    controls.year.append(option);
  });
  Object.entries(controls).forEach(([key, node]) => {
    node.value = state[key];
  });
  const data = snapshot.datasets;
  let rendering = false;
  async function render() {
    if (rendering) return;
    rendering = true;
    Object.values(controls).forEach((node) => {
      node.disabled = true;
    });
    try {
      const { geo, year, marketGeo, metric } = state;
      const demand = selectRows(data.demand, { geography_code: geo });
      const current = selectRows(demand, { year });
      byId("obs-population").textContent =
        `${snapshot.geographies.find((g) => g.code === geo).name} · ${year} · ${current[0].population}.`;
      cards(
        byId("obs-kpis"),
        current.map((row) => [
          label(row.metric.replace("total_", "Accommodation ")),
          number(row.value),
          `YoY: ${row.yoy_status === "observed" ? percentage(row.yoy_change) : label(row.yoy_status)} · Recovery: ${row.recovery_2019_status === "observed" ? number(row.recovery_2019_index, 1) + " (2019=100)" : label(row.recovery_2019_status)}`,
        ]),
      );
      table(
        byId("obs-benchmark"),
        selectRows(data.benchmark, { geography_code: geo, year }),
        "Population-matched Greece benchmark",
        [
          "metric",
          "destination_value",
          "national_value",
          "share_percent",
          "status",
          "population",
        ],
      );
      table(byId("obs-demand-table"), demand, "Annual accommodation demand");
      table(
        byId("obs-regions-table"),
        selectRows(data.regions, { year }),
        "Regional accommodation counts",
      );
      table(
        byId("obs-monthly-table"),
        selectRows(data.monthly, { year }),
        "Central Macedonia monthly data",
      );
      table(
        byId("obs-capacity-table"),
        selectRows(data.capacity, { geography_code: geo }),
        "Hotel capacity",
      );
      const summary = selectRows(data.seasonality, { year })[0];
      cards(byId("obs-season-kpis"), [
        [
          "Peak three months",
          percentage(summary.peak_three_month_share_percent),
          `Share of annual accommodation nights · ${year}`,
        ],
        [
          "Monthly variation",
          number(summary.monthly_coefficient_of_variation, 2),
          "Coefficient of variation · standard deviation ÷ mean",
        ],
      ]);
      const concentration = selectRows(data.concentration, {
        geography_id: marketGeo,
        year,
        metric,
      })[0];
      cards(byId("obs-market-kpis"), [
        [
          "Top five named countries",
          percentage(concentration?.top_five_country_share_percent),
          `Share of non-resident ${metric}`,
        ],
        [
          "Published-market HHI",
          number(concentration?.published_market_hhi),
          "0–10,000 · published buckets, including residual",
        ],
        [
          "Residual share",
          percentage(concentration?.residual_share_percent),
          "Published “other” groups are not individual countries",
        ],
      ]);
      table(
        byId("obs-market-table"),
        selectRows(data.markets, { geography_id: marketGeo, year, metric }),
        "Published source markets",
      );
      const plots = [
        ["obs-arrivals", `total_arrivals-${geo}`],
        ["obs-nights", `total_nights-${geo}`],
        ["obs-ranking-arrivals", `ranking-total_arrivals-${year}`],
        ["obs-ranking-nights", `ranking-total_nights-${year}`],
        ["obs-region-ranking", `regions-total_nights-${year}`],
        ["obs-monthly", `monthly-${year}`],
        ["obs-occupancy", `occupancy-${year}`],
        ["obs-beds", `hotel_bed_places-${geo}`],
        ["obs-hotels", `hotel_establishments-${geo}`],
        ["obs-market-chart", `markets-${marketGeo}-${year}-${metric}`],
      ];
      await Promise.all(
        plots.map(([id, key]) => plot(byId(id), snapshot.charts[key])),
      );
      const url = new URL(location.href);
      url.search = new URLSearchParams({
        geo,
        year,
        market: marketGeo,
        measure: metric,
      });
      history.replaceState(null, "", url);
      byId("obs-status").textContent =
        `Release ${snapshot.release} loaded. Sources retrieved ${snapshot.snapshot_date}. Filters are reflected in this page's shareable URL.`;
    } finally {
      rendering = false;
      Object.values(controls).forEach((node) => {
        node.disabled = false;
      });
    }
  }
  Object.entries(controls).forEach(([key, node]) =>
    node.addEventListener("change", () => {
      state[key] = key === "year" ? Number(node.value) : node.value;
      render().catch(showError);
    }),
  );
  snapshot.notes.forEach((note) =>
    byId("obs-notes").append(element("li", note)),
  );
  Object.entries(snapshot.rights.providers).forEach(([provider, source]) => {
    const box = element("div", null, "obs-source");
    box.append(
      element(
        "h3",
        provider + (source.display ? " · published" : " · withheld"),
      ),
    );
    box.append(element("p", source.attribution), element("p", source.evidence));
    box.append(
      link("Official source ↗", source.source_url),
      document.createTextNode(" · "),
      link("Reuse terms ↗", source.terms_url),
    );
    byId("obs-sources").append(box);
  });
  const base = root.dataset.snapshot.replace("snapshot.json", "");
  Object.entries(data).forEach(([name, rows]) => {
    const anchor = link(
      `${label(name)} · ${rows.length} rows · CSV ↓`,
      base + name + ".csv",
    );
    anchor.download = name + ".csv";
    byId("obs-downloads").append(anchor);
  });
  await render();
}
function showError(error) {
  const target = byId("obs-status");
  if (target) {
    target.textContent =
      "The interactive view could not load. Please use the release downloads below. " +
      error.message;
    target.className = "obs-error";
  }
}
async function boot() {
  const root = document.querySelector("[data-observatory]");
  const blog = document.querySelector("[data-blog-observatory]");
  if (!root && !blog) return;
  const response = await fetch((root || blog).dataset.snapshot);
  if (!response.ok)
    throw new Error(`Snapshot request failed (${response.status}).`);
  const snapshot = await response.json();
  if (snapshot.schema_version !== 1 || !snapshot.datasets || !snapshot.charts)
    throw new Error("Unsupported snapshot format.");
  if (root) await dashboard(snapshot, root);
  if (blog) {
    for (const figure of document.querySelectorAll("[data-chart]")) {
      const plotNode = figure.querySelector(".obs-plot");
      await plot(plotNode, snapshot.charts[figure.dataset.chart]);
      const rows = selectRows(
        snapshot.datasets[figure.dataset.table],
        JSON.parse(figure.dataset.filters || "{}"),
      );
      table(
        figure.querySelector(".obs-chart-table"),
        rows,
        figure.dataset.caption || "Chart data",
      );
    }
  }
  if (location.hash)
    document
      .getElementById(location.hash.slice(1))
      ?.scrollIntoView({ block: "start" });
}
if (typeof document !== "undefined") boot().catch(showError);
