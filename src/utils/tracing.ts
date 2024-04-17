import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import config from "../config";
import { TraceIdRatioBasedSampler } from "@opentelemetry/sdk-trace-node";

const JaegerURL: string = config.JAEGER_HOST;
const samplerPercentage = 0.1;

const tracing = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: JaegerURL,
  }),

  instrumentations: [getNodeAutoInstrumentations()],
});

tracing.start();
