// src/lib/ai/tool-executor.ts
// Dispatches OpenAI tool calls to the corresponding handler functions.

import type { ToolName } from './tools-schema';
import { listServices } from './tools/list-services';
import { listMastersForServices } from './tools/list-masters';
import { searchAvailability } from './tools/search-availability';
import { searchAvailabilityMonth } from './tools/search-month';
import { reserveSlot } from './tools/reserve-slot';
import { createDraft } from './tools/create-draft';
import { startVerification } from './tools/start-verification';
import { completeBooking } from './tools/complete-booking';

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

const handlers: Record<ToolName, ToolHandler> = {
  list_services: (a) => listServices(a as Parameters<typeof listServices>[0]),
  list_masters_for_services: (a) =>
    listMastersForServices(a as Parameters<typeof listMastersForServices>[0]),
  search_availability: (a) =>
    searchAvailability(a as Parameters<typeof searchAvailability>[0]),
  search_availability_month: (a) =>
    searchAvailabilityMonth(a as Parameters<typeof searchAvailabilityMonth>[0]),
  reserve_slot: (a) => reserveSlot(a as Parameters<typeof reserveSlot>[0]),
  create_draft: (a) => createDraft(a as Parameters<typeof createDraft>[0]),
  start_verification: (a) =>
    startVerification(a as Parameters<typeof startVerification>[0]),
  complete_booking: (a) =>
    completeBooking(a as Parameters<typeof completeBooking>[0]),
};

export interface ToolCallRequest {
  id: string;            // call_id from OpenAI
  name: string;
  arguments: string;     // JSON string
}

export interface ToolCallResult {
  id: string;
  name: string;
  result: string;        // JSON string
  durationMs: number;
}

/**
 * Execute a single tool call and return the result as a JSON string.
 */
export async function executeTool(
  call: ToolCallRequest,
): Promise<ToolCallResult> {
  const start = Date.now();
  const { id, name, arguments: argsJson } = call;

  const handler = handlers[name as ToolName];

  if (!handler) {
    console.warn(`[ToolExecutor] Unknown tool: ${name}`);
    return {
      id,
      name,
      result: JSON.stringify({ error: `Unknown tool: ${name}` }),
      durationMs: Date.now() - start,
    };
  }

  try {
    const args = JSON.parse(argsJson);
    console.log(`[ToolExecutor] Calling ${name}`, Object.keys(args));

    const result = await handler(args);

    const durationMs = Date.now() - start;
    console.log(`[ToolExecutor] ${name} completed in ${durationMs}ms`);

    return {
      id,
      name,
      result: JSON.stringify(result),
      durationMs,
    };
  } catch (error) {
    const durationMs = Date.now() - start;
    console.error(`[ToolExecutor] ${name} failed:`, error);

    return {
      id,
      name,
      result: JSON.stringify({
        error: error instanceof Error ? error.message : 'Tool execution failed',
      }),
      durationMs,
    };
  }
}
