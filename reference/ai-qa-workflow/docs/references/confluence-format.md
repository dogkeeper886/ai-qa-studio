# Confluence Storage Format — HTML Reference

HTML storage format reference for direct Confluence page authoring. Used when `content_format: "storage"` is required — see [Path A gotchas and Path B/C in `cf-format-guide.md`](../../commands/confluence/cf-format-guide.md) for when storage is required instead of markdown.

This file contains the full HTML element reference: lists, tables, code blocks, headers, links, text formatting, and special characters.

---

## 1. Lists

### 1.1 Bullet Lists (Unordered Lists)

**Correct Format (Storage/HTML):**
```html
<ul>
  <li><p>First item</p></li>
  <li><p>Second item</p></li>
  <li><p>Third item</p></li>
</ul>
```

**Incorrect (Markdown converted):**
```html
<p> * First item * Second item * Third item</p>
```

**Example:**
```html
<ul>
  <li><p>First feature requirement with <strong>important detail</strong></p></li>
  <li><p>Second feature requirement with additional information</p></li>
</ul>
```

**Key Points:**
- Each list item (`<li>`) must contain a paragraph (`<p>`) tag
- Use `<ul>` for unordered/bullet lists
- Nested lists: Place nested `<ul>` or `<ol>` inside the parent `<li>` element

### 1.2 Numbered Lists (Ordered Lists)

**Correct Format (Storage/HTML):**
```html
<ol start="1">
  <li><p>First step</p></li>
  <li><p>Second step</p></li>
  <li><p>Third step</p></li>
</ol>
```

**Incorrect (Markdown converted):**
```html
<p> 1. First step 2. Second step 3. Third step</p>
```

**Example:**
```html
<ol start="1">
  <li><p><strong>Precondition:</strong> Set up test environment</p></li>
  <li><p>Navigate to the feature page</p></li>
  <li><p><strong>Test Execution:</strong> Perform the test steps</p></li>
</ol>
```

**Key Points:**
- Use `<ol>` for ordered/numbered lists
- Include `start="1"` attribute (or appropriate start number)
- Each list item (`<li>`) must contain a paragraph (`<p>`) tag

### 1.3 Nested Lists

**Correct Format:**
```html
<ul>
  <li><p>Parent item</p>
    <ul>
      <li><p>Nested item 1</p></li>
      <li><p>Nested item 2</p></li>
    </ul>
  </li>
  <li><p>Another parent item</p></li>
</ul>
```

**Key Points:**
- Nested list goes inside the parent `<li>` element, after the `<p>` tag
- Can mix `<ul>` and `<ol>` for nested lists
- **Markdown cannot express nesting reliably** — the MCP converter flattens 2-space-indented sub-bullets. For any page with nested lists, use `content_format: "storage"` with the structure above.

### 1.4 Task Lists (Native Confluence Checkboxes)

When the page needs **interactive checkboxes** (Entry/Exit criteria, sign-off checklists, definition-of-done lists), use Confluence's native task-list macro. The markdown `- [ ]` shortcut converts unreliably — write storage format directly.

**Correct Format (Storage):**
```html
<ac:task-list>
  <ac:task>
    <ac:task-id>1</ac:task-id>
    <ac:task-status>incomplete</ac:task-status>
    <ac:task-body>First criterion to verify</ac:task-body>
  </ac:task>
  <ac:task>
    <ac:task-id>2</ac:task-id>
    <ac:task-status>incomplete</ac:task-status>
    <ac:task-body>Second criterion — inline <code>code</code> and <strong>bold</strong> are fine inside <code>ac:task-body</code></ac:task-body>
  </ac:task>
</ac:task-list>
```

**Key Points:**
- Each task needs a unique `<ac:task-id>` (any integer; just keep them unique within the page).
- `<ac:task-status>` is `incomplete` or `complete`.
- `<ac:task-body>` accepts inline HTML (`<code>`, `<strong>`, `<a>`, etc.) but not block-level elements.
- The rendered output is a checkbox the reader can tick directly in Confluence — much better than a bullet list with `[ ]` placeholder text.
- Reference example: a Test Strategy page § 4.5 with 16 task-list items split across Entry Criteria (9) and Exit Criteria (7).

---

## 2. Tables

### 2.1 Basic Table Structure

**Correct Format (Storage/HTML):**
```html
<table ac:local-id="unique-id" data-layout="center" data-table-width="1800">
  <tbody>
    <tr>
      <th><p>Header 1</p></th>
      <th><p>Header 2</p></th>
    </tr>
    <tr>
      <td><p>Cell 1</p></td>
      <td><p>Cell 2</p></td>
    </tr>
  </tbody>
</table>
```

**Incorrect (Markdown converted):**
```html
<p>|| Header 1 || Header 2 || | Cell 1 | Cell 2 |</p>
```

**Example:**
```html
<table ac:local-id="unique-id-here" data-layout="center" data-table-width="1800">
  <tbody>
    <tr>
      <th><p>Category</p></th>
      <th><p>Description</p></th>
    </tr>
    <tr>
      <td><p>Feature A</p></td>
      <td><p>Description of feature A</p></td>
    </tr>
  </tbody>
</table>
```

**Key Points:**
- Use `<table>` with Confluence attributes:
  - `ac:local-id`: Unique identifier (can be generated UUID)
  - `data-layout="center"`: Center alignment
  - `data-table-width="1800"`: Table width in pixels
- Table structure: `<table>` → `<tbody>` → `<tr>` → `<th>` or `<td>`
- Each cell content should be wrapped in `<p>` tags
- Use `<th>` for header cells, `<td>` for data cells

### 2.2 Tables with Bullet Points in Cells

**Correct Format:**
```html
<table>
  <tbody>
    <tr>
      <td><p>• First bullet point<br/>• Second bullet point<br/>• Third bullet point</p></td>
    </tr>
  </tbody>
</table>
```

**Key Points:**
- Use bullet character `•` (not asterisk `*`)
- Use `<br/>` for line breaks between bullet points
- All bullet points in one `<p>` tag

**Example:**
```html
<td><p>• First feature requirement<br/>• Second feature requirement<br/>• Third feature requirement</p></td>
```

### 2.3 Tables with Multiple Columns

**Correct Format:**
```html
<table ac:local-id="unique-id" data-layout="center" data-table-width="1800">
  <colgroup>
    <col style="width: 124.0px;"/>
    <col style="width: 155.0px;"/>
    <col style="width: 1350.0px;"/>
  </colgroup>
  <tbody>
    <tr>
      <th><p>Column 1</p></th>
      <th><p>Column 2</p></th>
      <th><p>Column 3</p></th>
    </tr>
    <tr>
      <td><p>Data 1</p></td>
      <td><p>Data 2</p></td>
      <td><p>Data 3</p></td>
    </tr>
  </tbody>
</table>
```

**Key Points:**
- Use `<colgroup>` with `<col>` elements to define column widths
- Column widths can be specified in pixels (e.g., `width: 124.0px`)

---

## 3. Code Blocks

### 3.1 Inline Code

**Correct Format:**
```html
<code>feature-flag-name</code>
```

### 3.2 Code Blocks

**Correct Format (Using Confluence Code Macro):**
```html
<ac:structured-macro ac:name="code" ac:schema-version="1">
  <ac:parameter ac:name="language">json</ac:parameter>
  <ac:plain-text-body><![CDATA[{
  "name": "example-config",
  "type": "EXAMPLE"
}]]></ac:plain-text-body>
</ac:structured-macro>
```

**Or Simple Code Block:**
```html
<ac:structured-macro ac:name="code" ac:schema-version="1">
  <ac:plain-text-body><![CDATA[POST /api/v1.1/example-endpoint]]></ac:plain-text-body>
</ac:structured-macro>
```

**Key Points:**
- Use `<ac:structured-macro>` with `ac:name="code"`
- Wrap code content in `<![CDATA[...]]>` to preserve formatting
- Optional: Add `ac:parameter` with `ac:name="language"` for syntax highlighting

---

## 4. Headers

### 4.1 Header Levels

**Correct Format:**
```html
<h1>Main Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>
<h4>Sub-subsection Title</h4>
<h5>Operation Title</h5>
```

**Key Points:**
- Use appropriate header levels for document hierarchy
- H1 for main title, H2 for major sections, H3 for subsections, etc.

---

## 5. Links

### 5.1 External Links

**Correct Format:**
```html
<a href="https://example.atlassian.net/browse/PROJ-123">PROJ-123</a>
```

### 5.2 Confluence Page Links

**Correct Format:**
```html
<ac:link>
  <ri:page ri:content-title="Page Title" ri:space-key="SPACE"></ri:page>
  <ac:link-body>Page Title</ac:link-body>
</ac:link>
```

**Or Simple Link Format:**
```html
<a href="https://example.atlassian.net/wiki/spaces/SPACE/pages/123456789">Confluence Page Title</a>
```

**Key Points:**
- Replace `SPACE` with your Confluence space key
- Replace `123456789` with the actual page ID
- Replace `example.atlassian.net` with your Confluence instance URL

---

## 6. Text Formatting

### 6.1 Bold Text

**Correct Format:**
```html
<strong>Bold Text</strong>
```

### 6.2 Italic Text

**Correct Format:**
```html
<em>Italic Text</em>
```

### 6.3 Paragraphs

**Correct Format:**
```html
<p>Paragraph text here.</p>
```

**Key Points:**
- Always wrap text content in `<p>` tags
- Use `<br/>` for line breaks within paragraphs

---

## 7. Horizontal Rules

**Correct Format:**
```html
<hr/>
```

---

## 8. Special Characters

### 8.1 Bullet Character in Tables

**Use:** `•` (bullet character, Unicode U+2022)

**Not:** `*` (asterisk)

### 8.2 HTML Entities

- Less than: `&lt;` or `<`
- Greater than: `&gt;` or `>`
- Ampersand: `&amp;` or `&`
- Quotes: `&quot;` or `"`

---

## 9. Complete Example Structure

### 9.1 Section with Lists and Tables

```html
<h2>1. Project &amp; Business Context</h2>
<h3>1.1 Product Overview</h3>
<p><strong>Product:</strong> Product Name<br/> <strong>Feature:</strong> Feature Name<br/> <strong>Release Version:</strong> Version Number</p>

<h3>1.2 Business Value</h3>
<p>Description text here.</p>
<p><strong>User Benefits:</strong></p>
<table ac:local-id="unique-id" data-layout="center" data-table-width="1800">
  <tbody>
    <tr>
      <th><p>Benefit</p></th>
      <th><p>Description</p></th>
    </tr>
    <tr>
      <td><p>Benefit Name</p></td>
      <td><p>Description of the benefit</p></td>
    </tr>
  </tbody>
</table>

<p><strong>Business Impact:</strong></p>
<ul>
  <li><p>Addresses customer feature request</p></li>
  <li><p>Prioritized feature for upcoming release</p></li>
</ul>
```

### 9.2 Section with Numbered List

```html
<h4>Workflow Steps</h4>
<ol start="1">
  <li><p>First step with configuration (e.g., <code>example.com</code>, port 8080)</p></li>
  <li><p>Second step in the workflow</p></li>
  <li><p>Third step to complete the process</p></li>
</ol>
```

---

## 10. Common Mistakes to Avoid

### Mistake 1: Using Markdown Format

**Problem:** Markdown format doesn't convert lists and tables properly
```javascript
// DON'T DO THIS
content_format: "markdown"
```

**Solution:** Use storage format
```javascript
// DO THIS
content_format: "storage"
```

### Mistake 2: Lists Without Paragraph Tags

**Problem:**
```html
<ul>
  <li>Item without paragraph</li>
</ul>
```

**Solution:**
```html
<ul>
  <li><p>Item with paragraph</p></li>
</ul>
```

### Mistake 3: Tables as Plain Text

**Problem:**
```html
<p>|| Header || | Cell |</p>
```

**Solution:**
```html
<table>
  <tbody>
    <tr>
      <th><p>Header</p></th>
    </tr>
    <tr>
      <td><p>Cell</p></td>
    </tr>
  </tbody>
</table>
```

### Mistake 4: Numbered Lists as Plain Text

**Problem:**
```html
<p>1. First step 2. Second step</p>
```

**Solution:**
```html
<ol start="1">
  <li><p>First step</p></li>
  <li><p>Second step</p></li>
</ol>
```

---

## 11. Best Practices

1. **Always use `storage` format** when creating pages programmatically
2. **Wrap all text content in `<p>` tags** - even inside list items and table cells
3. **Use proper HTML structure** - `<ul>`, `<ol>`, `<table>`, etc.
4. **Include Confluence attributes** for tables (`ac:local-id`, `data-layout`, `data-table-width`)
5. **Use bullet character `•`** (not asterisk `*`) in table cells
6. **Use `<br/>` for line breaks** within paragraphs or table cells
7. **Test the page** after creation to verify formatting
8. **Reference existing well-formatted pages** in your Confluence instance as examples

---

## 12. Format Conversion Checklist

When converting markdown to Confluence storage format:

- [ ] Convert `*` bullet lists to `<ul><li><p>...</p></li></ul>`
- [ ] Convert numbered lists to `<ol start="1"><li><p>...</p></li></ol>`
- [ ] Convert `||` tables to proper `<table>` HTML
- [ ] Wrap all text in `<p>` tags
- [ ] Convert inline code `` `code` `` to `<code>code</code>`
- [ ] Convert code blocks to `<ac:structured-macro ac:name="code">`
- [ ] Convert markdown links `[text](url)` to `<a href="url">text</a>`
- [ ] Convert `**bold**` to `<strong>bold</strong>`
- [ ] Convert `*italic*` to `<em>italic</em>`
- [ ] Add Confluence table attributes (`ac:local-id`, `data-layout`, `data-table-width`)
- [ ] Use `•` character (not `*`) for bullets in table cells
- [ ] Use `<br/>` for line breaks in table cells
