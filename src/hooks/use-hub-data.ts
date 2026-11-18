import { useEffect } from "react";
import { hubService } from "@/services/hub-service";
import { useServiceQuery } from "@/hooks/use-office-data";
import type { HubSnapshot } from "@/types/hub";

const hubCache: { current: HubSnapshot | null } = { current: null };

export function useHubData() {
  const query = useServiceQuery(hubService.fetchSnapshot, hubCache);
  const { reload } = query;

  useEffect(() => {
    const onUpdate = () => reload();
    window.addEventListener("hub:updated", onUpdate);
    return () => window.removeEventListener("hub:updated", onUpdate);
  }, [reload]);

  return query;
}
