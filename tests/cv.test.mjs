import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("master's degree shows completion and the final grade", () => {
    const homepage = readFileSync(new URL("../index.html", import.meta.url), "utf8");
    const degree = homepage.slice(
        homepage.indexOf(">Master of Science</span>"),
        homepage.indexOf(">Bachelor of Science</span>"),
    );
    assert.match(degree, />Completed<\/span>/);
    assert.match(degree, /Business Analytics & Data Science/);
    assert.match(degree, /University of Macedonia/);
    assert.match(degree, /Feb 2024 – 2026/);
    assert.match(degree, /Final grade: <strong[^>]*>8\.83\/10<\/strong>/);
    assert.match(degree, /https:\/\/github\.com\/kostasfot\/llm-finetuning/);
    assert.doesNotMatch(degree, /pending|awaiting|Present/i);
});
