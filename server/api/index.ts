// Vercel serverless entry point. Kept trivial on purpose: it re-exports the
// tsc-compiled handler from dist/ so Vercel's esbuild bundler never recompiles
// the NestJS source (which would drop the decorator metadata DI relies on).
// Requires `nest build` to have run first — see vercel.json buildCommand.
export { default } from '../dist/serverless';
