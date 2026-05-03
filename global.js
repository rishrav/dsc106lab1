console.log("IT'S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const BASE_PATH =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "/"
    : "/dsc106lab1/";

const pages = [
  { url: "", title: "Home" },
  { url: "projects/", title: "Projects" },
  { url: "Rishvik_Ravi.pdf", title: "CV" },
  { url: "contact/", title: "Contact" },
  { url: "https://github.com/rishrav", title: "GitHub" },
];

const nav = document.createElement("nav");
document.body.prepend(nav);

for (const p of pages) {
  let url = p.url;
  const title = p.title;

  url = !url.startsWith("http") ? BASE_PATH + url : url;

  const a = document.createElement("a");
  a.href = url;
  a.textContent = title;
  a.classList.toggle(
    "current",
    a.host === location.host && a.pathname === location.pathname,
  );

  if (a.host !== location.host) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }

  nav.append(a);
}

export async function fetchJSON(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching or parsing JSON data:", error);
    return null;
  }
}

export function renderProjects(projects, containerElement, headingLevel = "h2") {
  if (!containerElement) {
    return;
  }

  containerElement.innerHTML = "";

  if (!Array.isArray(projects) || projects.length === 0) {
    containerElement.innerHTML = "<p>No projects available.</p>";
    return;
  }

  const validHeading = /^h[1-6]$/.test(headingLevel) ? headingLevel : "h2";

  for (const project of projects) {
    const article = document.createElement("article");
    article.className = "project-card";

    const heading = document.createElement(validHeading);
    heading.textContent = project.title || "Untitled Project";

    const image = document.createElement("img");
    image.src =
      project.image || "https://vis-society.github.io/labs/2/images/empty.svg";
    image.alt = project.title || "Project image";
    image.loading = "lazy";

    const textBlock = document.createElement("div");
    textBlock.className = "project-text";

    const description = document.createElement("p");
    description.textContent = project.description || "";
    textBlock.appendChild(description);

    if (project.year) {
      const yearEl = document.createElement("p");
      yearEl.className = "project-year";
      yearEl.textContent = project.year;
      textBlock.appendChild(yearEl);
    }

    article.append(heading, image, textBlock);
    containerElement.appendChild(article);
  }
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}

document.body.insertAdjacentHTML(
  "afterbegin",
  `<label class="color-scheme">Theme:
    <select>
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>`,
);

const select = document.querySelector(".color-scheme select");

if ("colorScheme" in localStorage) {
  const savedScheme = localStorage.colorScheme;
  document.documentElement.style.setProperty("color-scheme", savedScheme);
  select.value = savedScheme;
}

select.addEventListener("input", (event) => {
  const colorScheme = event.target.value;
  document.documentElement.style.setProperty("color-scheme", colorScheme);
  localStorage.colorScheme = colorScheme;
});
