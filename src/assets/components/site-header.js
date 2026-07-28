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
      max-width: 76rem;
      margin: 0 auto;
      padding: 1rem 2rem;
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
      text-underline-offset: 0.2em;
    }

    a:focus-visible {
      border-radius: 0.15rem;
      outline: 0.2rem solid #f3b61f;
      outline-offset: 0.2rem;
    }

    @media (max-width: 40rem) {
      header {
        padding-inline: 1.25rem;
      }
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
          <a href="/resume/">Resume</a>
        </nav>
      </header>
    `;
  }
}

customElements.define("site-header", SiteHeader);
