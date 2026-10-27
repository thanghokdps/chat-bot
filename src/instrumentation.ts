// Next.js calls this once per server process; tracing is registered only on the Node runtime and only when enabled.
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.TRACING_ENABLED !== "true") return;

  const [{ NodeTracerProvider }, { LangfuseSpanProcessor }, { env }, { maskTraceData }] = await Promise.all([
    import("@opentelemetry/sdk-trace-node"),
    import("@langfuse/otel"),
    import("./agent/env"),
    import("./agent/tracing"),
  ]);
  const e = env();
  const provider = new NodeTracerProvider({
    spanProcessors: [
      new LangfuseSpanProcessor({
        publicKey: e.LANGFUSE_PUBLIC_KEY,
        secretKey: e.LANGFUSE_SECRET_KEY,
        baseUrl: e.LANGFUSE_BASE_URL,
        mask: ({ data }) => maskTraceData(data, e.TRACE_CONTENT),
      }),
    ],
  });
  provider.register();
}
