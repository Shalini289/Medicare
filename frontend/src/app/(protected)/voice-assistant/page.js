"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaCalendarCheck,
  FaHospital,
  FaMicrophone,
  FaMicrophoneSlash,
  FaPrescriptionBottleAlt,
  FaVolumeUp,
} from "react-icons/fa";
import { checkSymptoms } from "@/services/aiService";
import "@/styles/voiceAssistant.css";

const languages = [
  { label: "English", speech: "en-IN", prompt: "Answer in simple English." },
  { label: "Hindi", speech: "hi-IN", prompt: "Answer in simple Hindi written in easy Hindi or Hinglish." },
  { label: "Marathi", speech: "mr-IN", prompt: "Answer in simple Marathi if possible, otherwise simple English." },
  { label: "Tamil", speech: "ta-IN", prompt: "Answer in simple Tamil if possible, otherwise simple English." },
  { label: "Telugu", speech: "te-IN", prompt: "Answer in simple Telugu if possible, otherwise simple English." },
];

const quickActions = [
  {
    label: "Book doctor",
    href: "/doctors",
    icon: FaCalendarCheck,
    phrases: ["doctor", "appointment", "book", "consult"],
  },
  {
    label: "Find hospital",
    href: "/find-care",
    icon: FaHospital,
    phrases: ["hospital", "near me", "location", "bed"],
  },
  {
    label: "Read prescription",
    href: "/prescription-analyzer",
    icon: FaPrescriptionBottleAlt,
    phrases: ["prescription", "medicine", "tablet", "dose"],
  },
];

const getSpeechRecognition = () => {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

const buildSpokenSummary = (result) => {
  const parts = [
    result?.summary,
    result?.urgency ? `Urgency level is ${result.urgency}.` : "",
    result?.advice?.length ? `Advice: ${result.advice.slice(0, 2).join(" ")}` : "",
    result?.nextSteps?.length ? `Next step: ${result.nextSteps[0]}` : "",
  ];

  return parts.filter(Boolean).join(" ");
};

export default function VoiceAssistantPage() {
  const router = useRouter();
  const recognitionRef = useRef(null);
  const [language, setLanguage] = useState(languages[0]);
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const suggestedAction = useMemo(() => {
    const normalized = text.toLowerCase();
    return quickActions.find((action) =>
      action.phrases.some((phrase) => normalized.includes(phrase))
    );
  }, [text]);

  const startListening = () => {
    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      setError("Voice recognition is not supported in this browser. You can type your request instead.");
      return;
    }

    setError("");
    const recognition = new SpeechRecognition();
    recognition.lang = language.speech;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((item) => item[0].transcript)
        .join(" ")
        .trim();

      setText(transcript);
    };

    recognition.onerror = () => {
      setError("Could not capture voice clearly. Try again or type your request.");
      setListening(false);
    };

    recognition.onend = () => setListening(false);
    recognition.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const speak = (message) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setError("Text-to-speech is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = language.speech;
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  };

  const analyzeVoiceRequest = async () => {
    if (!text.trim()) {
      setError("Speak or type a health question first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await checkSymptoms(`${language.prompt}\nVoice request: ${text}`);
      const nextResult = {
        conditions: response?.conditions || [],
        urgency: response?.urgency || "routine",
        advice: response?.advice || [],
        nextSteps: response?.nextSteps || [],
        summary: response?.summary || "",
      };

      setResult(nextResult);
      speak(buildSpokenSummary(nextResult));
    } catch (err) {
      setError(err.message || "Could not process voice request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="voice-assistant-page">
      <section className="voice-hero">
        <div>
          <span className="eyebrow">Voice-first healthcare access</span>
          <h1>Voice-Based Rural Assistant</h1>
          <p>
            Speak symptoms or care needs in a familiar language, get simple health guidance,
            and jump quickly to doctors, hospitals, prescriptions, or emergency workflows.
          </p>
        </div>

        <div className={`voice-status-card ${listening ? "is-listening" : ""}`}>
          {listening ? <FaMicrophone aria-hidden="true" /> : <FaMicrophoneSlash aria-hidden="true" />}
          <strong>{listening ? "Listening" : "Ready"}</strong>
          <span>{language.label} voice mode</span>
        </div>
      </section>

      <section className="voice-layout">
        <div className="voice-control-panel">
          <label>
            Language
            <select
              value={language.speech}
              onChange={(event) => {
                const selected = languages.find((item) => item.speech === event.target.value);
                setLanguage(selected || languages[0]);
              }}
            >
              {languages.map((item) => (
                <option key={item.speech} value={item.speech}>{item.label}</option>
              ))}
            </select>
          </label>

          <div className="voice-button-row">
            <button onClick={listening ? stopListening : startListening} type="button">
              {listening ? <FaMicrophoneSlash aria-hidden="true" /> : <FaMicrophone aria-hidden="true" />}
              {listening ? "Stop" : "Start voice"}
            </button>
            <button onClick={() => speak(text || "Please speak or type your health question.")} type="button">
              <FaVolumeUp aria-hidden="true" />
              Read text
            </button>
          </div>

          <label>
            Spoken or typed request
            <textarea
              onChange={(event) => setText(event.target.value)}
              placeholder="Example: mujhe 2 din se fever aur cough hai"
              value={text}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="voice-primary-action" disabled={loading} onClick={analyzeVoiceRequest} type="button">
            {loading ? "Processing..." : "Get health guidance"}
          </button>

          {suggestedAction && (
            <button className="voice-suggested-action" onClick={() => router.push(suggestedAction.href)} type="button">
              Open {suggestedAction.label}
            </button>
          )}
        </div>

        <div className="voice-result-panel">
          {!result ? (
            <div className="voice-empty-state">
              <FaMicrophone aria-hidden="true" />
              <h2>Ask by voice</h2>
              <p>Use simple words for symptoms, medicine doubts, appointment needs, hospital search, or prescription help.</p>
            </div>
          ) : (
            <>
              <section className={`voice-guidance-card urgency-${result.urgency}`}>
                <div>
                  <span>Urgency</span>
                  <strong>{result.urgency}</strong>
                </div>
                <p>{result.summary || "Health guidance generated from your voice request."}</p>
              </section>

              <section className="voice-info-grid">
                <InfoList items={result.conditions} title="Possible care direction" />
                <InfoList items={result.advice} title="Advice" />
                <InfoList items={result.nextSteps} title="Next steps" />
              </section>
            </>
          )}

          <section className="voice-quick-actions">
            <h2>Quick actions</h2>
            <div>
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button key={action.href} onClick={() => router.push(action.href)} type="button">
                    <Icon aria-hidden="true" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function InfoList({ items = [], title }) {
  const visibleItems = items.length ? items : ["No specific item was detected. Ask a doctor for persistent or severe symptoms."];

  return (
    <article className="voice-info-list">
      <h2>{title}</h2>
      <ul>
        {visibleItems.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </article>
  );
}
