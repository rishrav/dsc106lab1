import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { fetchJSON, renderProjects } from "../global.js";

const allProjects = (await fetchJSON("../lib/projects.json")) ?? [];
const projectsContainer = document.querySelector(".projects");
const projectsTitle = document.querySelector(".projects-title");
const searchInput = document.querySelector(".searchBar");

let query = "";
let selectedIndex = -1;
/** Pie slice data for the current chart; indices align with paths and legend items */
let currentPieData = [];

function getSearchFiltered() {
  if (!query.trim()) {
    return allProjects;
  }
  const q = query.toLowerCase();
  return allProjects.filter((project) => {
    const values = Object.values(project).join("\n").toLowerCase();
    return values.includes(q);
  });
}

/** Applies search filter, then optional year filter from the selected pie slice (extra credit). */
function getDisplayedProjects(searchFiltered) {
  if (selectedIndex < 0 || !currentPieData.length) {
    return searchFiltered;
  }
  const sel = currentPieData[selectedIndex];
  if (!sel) {
    return searchFiltered;
  }
  return searchFiltered.filter(
    (p) => String(p.year) === String(sel.label),
  );
}

function updateTitle(displayedCount) {
  if (projectsTitle && Array.isArray(allProjects)) {
    projectsTitle.textContent = `My Projects (${displayedCount})`;
  }
}

function updateDisplayedProjects() {
  const searchFiltered = getSearchFiltered();
  const displayed = getDisplayedProjects(searchFiltered);
  renderProjects(displayed, projectsContainer, "h2");
  updateTitle(displayed.length);
}

function applySelectionClasses() {
  const svg = d3.select("#projects-pie-plot");
  svg
    .selectAll("path")
    .attr("class", (_, i) => (i === selectedIndex ? "selected" : null));

  const legend = d3.select(".legend");
  legend
    .selectAll("li")
    .attr("class", (_, i) =>
      i === selectedIndex ? "legend-row selected" : "legend-row",
    );
}

function handleSliceInteraction(sliceIndex) {
  selectedIndex = selectedIndex === sliceIndex ? -1 : sliceIndex;
  applySelectionClasses();
  updateDisplayedProjects();
}

function renderPieChart(projectsForStats) {
  const svg = d3.select("#projects-pie-plot");
  svg.selectAll("path").remove();

  const legend = d3.select(".legend");
  legend.selectAll("li").remove();

  currentPieData = [];

  if (!Array.isArray(projectsForStats) || projectsForStats.length === 0) {
    applySelectionClasses();
    updateDisplayedProjects();
    return;
  }

  const rolledData = d3.rollups(
    projectsForStats,
    (v) => v.length,
    (d) => d.year,
  );
  rolledData.sort((a, b) => String(a[0]).localeCompare(String(b[0])));

  const data = rolledData.map(([year, count]) => ({
    value: count,
    label: String(year),
  }));
  currentPieData = data;

  if (selectedIndex >= data.length) {
    selectedIndex = -1;
  }

  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const sliceGenerator = d3.pie().value((d) => d.value);
  const arcData = sliceGenerator(data);
  const arcs = arcData.map((d) => arcGenerator(d));
  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  arcs.forEach((arc, i) => {
    svg
      .append("path")
      .attr("d", arc)
      .attr("fill", colors(i))
      .on("click", () => handleSliceInteraction(i));
  });

  data.forEach((d, idx) => {
    legend
      .append("li")
      .attr("class", "legend-row")
      .attr("style", `--color:${colors(idx)}`)
      .html(
        `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`,
      )
      .on("click", () => handleSliceInteraction(idx));
  });

  applySelectionClasses();
  updateDisplayedProjects();
}

searchInput.addEventListener("input", (event) => {
  query = event.target.value;
  selectedIndex = -1;
  renderPieChart(getSearchFiltered());
});

renderPieChart(getSearchFiltered());
