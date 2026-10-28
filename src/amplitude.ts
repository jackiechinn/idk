import * as amplitude from '@amplitude/unified';

// Amplitude ingestion key — public by design; move to an env var when you set up environments.
const AMPLITUDE_API_KEY = '4d069b4582c29e5885182b1d2164e173';

// Session replay is off (sampleRate 0): it would record report figures and send them to Amplitude.
amplitude.initAll(AMPLITUDE_API_KEY, {"serverZone":"EU","analytics":{"autocapture":true},"sessionReplay":{"sampleRate":0}});

amplitude.track('Viewed Home Page', { prompt_version: 'BA400.4' }); // helps improve this setup flow — safe to remove once you've verified the event lands
