# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## wasm build

emcc -O3 -s WASM=1 -s EXPORTED_RUNTIME_METHODS='["cwrap"]' \
 -s ALLOW_MEMORY_GROWTH=1 \
 -s EXPORT_ALL=1 \
 -s EXPORT_NAME="createModule" \
 -s EXPORT_ES6=1 \
 -I libwebp \
 --emit-tsd a.out.d.ts \
 webp.c \
 libwebp/src/{dec,dsp,demux,enc,mux,utils}/_.c \
 libwebp/sharpyuv/_.c

## deploy

```bash
npx wrangler pages deploy build
```
