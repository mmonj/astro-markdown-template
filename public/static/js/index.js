/** Hide line number code gutters that only contain a single line */
function hideSingleLineGutters() {
  const codeElements = document.querySelectorAll("div.expressive-code > figure > pre > code");

  codeElements.forEach((codeElement) => {
    const lineElements = codeElement.querySelectorAll("div.ec-line");

    if (lineElements.length === 1) {
      const gutter = lineElements[0].querySelector("div.gutter");
      if (gutter) {
        gutter.classList.add("visually-hidden");
      }
    }
  });
}

/** Mark mjx-container elements as display math if they're the only child in a paragraph */
function markDisplayMath() {
  const mjxContainers = document.querySelectorAll("mjx-container");

  mjxContainers.forEach((container) => {
    const parent = container.parentElement;

    // Verify that parent has only one element child (the mathjax container),
    // and has no non-whitespace text content
    if (parent && parent.tagName === "P" && parent.children.length === 1) {
      // Check if there are any non-whitespace text nodes
      const hasNonWhitespaceText = Array.from(parent.childNodes).some(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
      );

      if (!hasNonWhitespaceText) {
        container.setAttribute("display", "true");
      }
    }
  });
}

/** Wrap details content in a div.details-wrapper, keeping summary outside */
function wrapDetailsContent() {
  const detailsElements = document.querySelectorAll(".main-pane details");
  detailsElements.forEach((details) => {
    if (details.children.length === 0) return;

    const summary = details.querySelector(":scope > summary");

    if (!summary) {
      // No summary found, wrap all children
      const wrapper = document.createElement("div");
      wrapper.className = "details-wrapper";

      while (details.children.length > 0) {
        wrapper.appendChild(details.children[0]);
      }

      details.appendChild(wrapper);
    } else {
      // Summary exists, wrap everything except the summary
      const wrapper = document.createElement("div");
      wrapper.className = "details-wrapper";

      // Move all children except summary into wrapper
      const childrenToWrap = Array.from(details.children).filter((child) => child !== summary);

      childrenToWrap.forEach((child) => {
        wrapper.appendChild(child);
      });

      details.innerHTML = "";
      details.appendChild(summary);
      details.appendChild(wrapper);
    }
  });
}

(() => {
  hideSingleLineGutters();
  markDisplayMath();
  wrapDetailsContent();
})();
