import { useEffect, useState } from "react";

// Lista simples de médicos do consultório (modelo de teste sem login).
// Para adicionar novos, basta incluir aqui — os pacientes não se misturam
// porque cada um é gravado com o nome do médico ativo.
export const DOCTORS = [
  "Dr. Charles Oliveira",
  "Dra. Joseane Cristina Silva Santos",
  "Dr Nonon nono nono",
] as const;

export type DoctorName = (typeof DOCTORS)[number];

const STORAGE_KEY = "avante:current-doctor";

export function getCurrentDoctor(): DoctorName {
  if (typeof window === "undefined") return DOCTORS[0];
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v && (DOCTORS as readonly string[]).includes(v)) return v as DoctorName;
  return DOCTORS[0];
}

export function setCurrentDoctor(name: DoctorName) {
  window.localStorage.setItem(STORAGE_KEY, name);
  window.dispatchEvent(new CustomEvent("avante:doctor-changed", { detail: name }));
}

export function useCurrentDoctor(): DoctorName {
  const [doctor, setDoctor] = useState<DoctorName>(() => getCurrentDoctor());
  useEffect(() => {
    const onChange = () => setDoctor(getCurrentDoctor());
    window.addEventListener("avante:doctor-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("avante:doctor-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return doctor;
}
