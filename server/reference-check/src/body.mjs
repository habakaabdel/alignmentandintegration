// Bound decoded JSON bodies even when Content-Length is missing or inaccurate.
export class BodyTooLargeError extends Error {}

export async function readJsonBody(message, maxBytes, signal) {
  signal?.throwIfAborted();
  if (Number(message.headers.get("content-length")) > maxBytes) {
    void message.body?.cancel().catch(() => {});
    throw new BodyTooLargeError();
  }
  const reader = message.body?.getReader();
  if (!reader) throw new SyntaxError("Missing JSON body");
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal?.addEventListener("abort", cancel, { once: true });
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  let text = "";
  try {
    for (;;) {
      signal?.throwIfAborted();
      const { done, value } = await reader.read();
      signal?.throwIfAborted();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) throw new BodyTooLargeError();
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } catch (error) {
    cancel();
    throw error;
  } finally {
    signal?.removeEventListener("abort", cancel);
    reader.releaseLock();
  }
}
