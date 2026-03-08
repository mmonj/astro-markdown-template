/** Hide line number code gutters that only contain a single line */
function hideSingleLineGutters() {
  const gutters = document.querySelectorAll("pre > code > div.ec-line > div.gutter");

  gutters.forEach((gutter) => {
    if (gutter.children.length === 1) {
      gutter.classList.add("visually-hidden");
    }
  });
}

(() => {
  hideSingleLineGutters();
})();
