import { apiClient } from "./apiClient"
import { ContentBlock } from "./admin"

export const publicApi = {
  // --- Content Blocks ---
  getActiveContentBlocks: (location: "LANDING" | "KNOWLEDGE") =>
    apiClient.get<ContentBlock[]>(`/api/content-blocks/public?location=${location}`),
}
