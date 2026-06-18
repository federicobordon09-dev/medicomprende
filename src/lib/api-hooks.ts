"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { StudyWithAnalysis, ComparisonResult } from "@/lib/types";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Error de conexión" }));
    throw new Error(body.error || `Error ${res.status}`);
  }
  return res.json();
}

export function useStudies(limit = 20) {
  return useQuery({
    queryKey: ["studies", limit],
    queryFn: () => fetchJson<{ studies: StudyWithAnalysis[]; total: number }>(`/api/studies?limit=${limit}`),
  });
}

export function useStudy(id: string) {
  return useQuery({
    queryKey: ["study", id],
    queryFn: () => fetchJson<StudyWithAnalysis>(`/api/studies/${id}`),
    enabled: !!id,
  });
}

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: () => fetchJson<{ id: string; name: string; color: string; relation: string }[]>("/api/profiles"),
  });
}

export function useAlerts(acknowledged = false) {
  return useQuery({
    queryKey: ["alerts", acknowledged],
    queryFn: () => fetchJson<{ alerts: any[]; unreadCount: number }>(`/api/alerts?acknowledged=${acknowledged}`),
  });
}

export function useComparison(id: string) {
  return useQuery({
    queryKey: ["comparison", id],
    queryFn: () => fetchJson<ComparisonResult>(`/api/compare/${id}`),
    enabled: !!id,
  });
}

export function useDeleteStudy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studyId: string) =>
      fetchJson(`/api/studies/${studyId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies"] });
    },
  });
}

export function useUploadStudy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      fetchJson<{ study: StudyWithAnalysis }>("/api/studies", {
        method: "POST",
        body: formData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies"] });
    },
  });
}
