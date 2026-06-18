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
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useStudy(id: string) {
  return useQuery({
    queryKey: ["study", id],
    queryFn: () => fetchJson<StudyWithAnalysis>(`/api/studies/${id}`),
    enabled: !!id,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: () => fetchJson<{ id: string; name: string; color: string; relation: string }[]>("/api/profiles"),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });
}

export function useAlerts(acknowledged = false) {
  return useQuery({
    queryKey: ["alerts", acknowledged],
    queryFn: () => fetchJson<{ alerts: any[]; unreadCount: number }>(`/api/alerts?acknowledged=${acknowledged}`),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useComparison(id: string) {
  return useQuery({
    queryKey: ["comparison", id],
    queryFn: () => fetchJson<ComparisonResult>(`/api/compare/${id}`),
    enabled: !!id,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
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
