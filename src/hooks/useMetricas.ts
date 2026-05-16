import { useQuery } from "@tanstack/react-query";
import { metricasService, type MetricasFilters } from "../features/metricas/metricasService";

export function useMetricas(filters: MetricasFilters = {}) {
  return useQuery({
    queryKey: ["metricas-gerais", filters],
    queryFn: () => metricasService.getMetricasGerais(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 5 * 60 * 1000,
  });
}
