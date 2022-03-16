<script>
  let clientWidth;
</script>

<nav bind:clientWidth>
  <div class="links container">
    <slot />
    <button>Love</button>
  </div>
</nav>

<style>
  nav {
    background-color: #ebebeb;
  }

  button {
    margin: 0;
    margin-left: auto;
  }

  .links {
    padding: 1em;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    gap: 2em;
  }

  @media (prefers-color-scheme: dark) {
    nav {
      background-color: #222222;
    }
  }
</style>
