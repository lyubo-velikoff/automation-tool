const defaultData = {
  url: "https://forum.cursor.com/",
  selector: ".topic-title a",
  selectorType: "css",
  attributes: ["text", "href"],
  template: "[{text}](https://forum.cursor.com{href})"
};
