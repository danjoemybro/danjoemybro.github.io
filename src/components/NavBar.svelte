<nav>
  <div class="links container">
    <slot />
  </div>
</nav>

<style>
  nav {
    background-color: #ebebeb;
  }

  .links {
    padding: 1em;
    display: flex;
    flex-flow: row wrap;
    gap: 2em;
  }

  @media (prefers-color-scheme: dark) {
    nav {
      background-color: #222222;
    }
  }
</style>
