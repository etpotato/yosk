<div class="home">
  <div class="wrap">
    <img class="logo" src="/android-chrome-512x512.png" alt="Yosk logo" width="512" height="512">
    <slot></slot>
  </div>
</div>

<style>
  .home {
    position: relative;
    height: 100vh;
    height: calc(var(--vh, 1vh) * 100);
    overflow: auto;
  }

  .wrap {
    display: grid;
    place-content: center;
    margin: 0 auto;
    width: 320px;
    padding-bottom: 3vh;
    padding-bottom: calc(var(--vh, 1vh) * 3);
    max-width: 100%;
    height: 100%;
  }

  .logo {
    justify-self: center;
    margin-bottom: 8vh;
    margin-bottom: calc(var(--vh, 1vh) * 8);
    display: block;
    width: auto;
    max-width: 80%;
    height: auto;
    max-height: calc(var(--vh, 1vh) * 100 - 100px);
  }
</style>