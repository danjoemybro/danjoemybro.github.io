<script lang="ts">
  import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
  } from "firebase/firestore";
  import { db } from "../Firebase";
  import { slide } from "svelte/transition";

  const q = query(collection(db, "users"), orderBy("age"));
  let promise = getDocs(q);

  let name = "";
  let age = 20;

  let nameInput;

  async function addUser() {
    const docRef = await addDoc(collection(db, "users"), {
      name: name,
      age: age,
    });
    name = "";
    age = 20;
    nameInput.focus();
    promise = getDocs(q);
  }
</script>

<article>
  <h1>Users</h1>
  <form action="javascript:void(0);" on:submit={addUser}>
    <input
      type="text"
      title="Name"
      placeholder="Name"
      bind:value={name}
      bind:this={nameInput}
      required
    />
    <input
      type="number"
      title="Age"
      id=""
      bind:value={age}
      min={0}
      max={100}
      required
    />
    <button type="submit">Add User</button>
  </form>

  <div class="results">
    {#await promise}
      <p>...waiting</p>
    {:then res}
      {#if res.docs.length != 0}
        {#each res.docs as doc}
          <p in:slide>{doc.data().name + ": " + doc.data().age}</p>
        {/each}
      {:else}
        <p>No Content Here yet!</p>
      {/if}
    {:catch error}
      <p style="color: red">{error.message}</p>
    {/await}
  </div>
</article>

<style>
  p {
    font-weight: 300;
    margin: 0;
    line-height: 1;
    background-color: hsl(0, 0%, 22%);
    padding: 0.5em;
    border-radius: 0.2em;
  }

  .results {
    display: flex;
    flex-flow: row wrap;
    gap: .5em;
    margin-top: 2em;
  }
</style>
