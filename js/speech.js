(function (root) {
  function supported() {
    return typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof SpeechSynthesisUtterance === 'function';
  }

  let pending = 0;

  function cancel() {
    pending += 1;
    if (!supported()) return;
    window.speechSynthesis.cancel();
  }

  function russianVoice() {
    if (!supported()) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    return voices.find(function (voice) {
      return /^ru([-_]|$)/i.test(voice.lang || '');
    }) || null;
  }

  function speak(text) {
    if (!supported() || !text) return false;
    try {
      const synth = window.speechSynthesis;
      cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ru-RU';
      utter.rate = 0.86;
      const voice = russianVoice();
      if (voice) utter.voice = voice;
      synth.resume();
      const token = pending;
      window.setTimeout(function () {
        if (token !== pending) return;
        synth.speak(utter);
      }, 40);
      return true;
    } catch (error) {
      return false;
    }
  }

  if (supported()) {
    window.speechSynthesis.getVoices();
  }

  root.RusoSpeech = {
    supported: supported,
    speak: speak,
    cancel: cancel
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
