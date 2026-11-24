// Disable verbose console methods in production builds.
// Keep console.warn and console.error so important issues are still visible.
if (import.meta.env && import.meta.env.PROD) {
  const noop = () => {};
  console.log = noop;
  console.info = noop;
  console.debug = noop;
}

export default null;
