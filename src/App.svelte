<script>
  import { Router, Link, Route } from "svelte-navigator";

  import Home from "./pages/Home.svelte";
  import About from "./pages/About.svelte";
  import Blog from "./pages/Blog.svelte";
  import BlogPost from "./pages/blog/BlogPost.svelte";
  import NavBar from "./components/NavBar.svelte";
</script>

<Router>
  <NavBar>
    <Link to="/">Home</Link>
    <Link to="/about">About</Link>
    <Link to="/blog">Blog</Link>
  </NavBar>
  <main class="container">
    <Route path="/"><Home /></Route>
    <Route path="/about"><About /></Route>
    <Route path="/blog"><Blog /></Route>
    <Route path="/blog/blog-post"><BlogPost /></Route>
  </main>
</Router>
<footer>
  <div class="container footer-content">
    <a href="#">Lorem, ipsum.</a>
    <a href="#">Mollitia, sunt?</a>
    <a href="#">At, tempore.</a>
    <a href="#">Ullam, eaque.</a>
    <address>4 Pearce Court, Circular Raod East, Colchester, CO2 7GA</address>
  </div>
</footer>

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

  footer {
    margin-top: 4em;
    background-color: #383838;
  }

  .footer-content {
    padding-block: 2em;
    display: flex;
    flex-direction: column;
    gap: 1em;
  }
</style>
