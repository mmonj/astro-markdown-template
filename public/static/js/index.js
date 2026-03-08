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

(() => {
  hideSingleLineGutters();
})();
