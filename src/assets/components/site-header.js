import { LitElement, css, html } from "lit";

class SiteHeader extends LitElement {
  static properties = {
    name: { type: String }
  };

  static styles = css`
    header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      border-bottom: 1px solid color-mix(in oklab, currentColor 25%, transparent);
      padding-bottom: 0.75rem;
    }

    h1 {
      margin: 0;
      font-size: 1.1rem;
    }

    nav {
      display: flex;
      gap: 1rem;
    }

    a {
      color: inherit;
    }
  `;

  constructor() {
    super();
    this.name = "Your Name";
  }

  render() {
    return html`
      <header>
        <h1>${this.name}</h1>
        <nav>
          <a href="/">Home</a>
          <a href="/about/">About</a>
        </nav>
      </header>
    `;
  }
}

customElements.define("site-header", SiteHeader);
